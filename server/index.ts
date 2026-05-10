import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { pool } from './db';
import * as kv from './kv';
import * as auth from './auth';
import { seedIfEmpty } from './seed';
import { ensureJobPostings } from './jobPostingsSeed';
import { executeRemote, validateSource } from './executeCode';

const allowedOrigin = process.env.ALLOWED_ORIGIN ?? '*';
const environment = process.env.APP_ENV ?? 'development';
const enableSeed = process.env.ENABLE_DEMO_SEED === 'true';
const rateLimitPerMinute = Number(process.env.RATE_LIMIT_PER_MINUTE ?? '120');
const routeNamespace = process.env.FUNCTIONS_NAMESPACE ?? 'make-server-c6b9db5d';

type AppVariables = { requestId: string };
const app = new Hono<{ Variables: AppVariables }>();
const routePrefix = `/${routeNamespace}`;
const RATE_WINDOW_MS = 60_000;
const requestBuckets = new Map<string, { count: number; startedAt: number }>();

function getRequestId(): string {
  return crypto.randomUUID();
}

function log(level: 'info' | 'warn' | 'error', message: string, payload: Record<string, unknown> = {}) {
  console.log(JSON.stringify({ level, message, environment, ...payload }));
}

async function getUserFromAuthHeader(authHeader: string | undefined): Promise<{
  id: string;
  email?: string;
  user_metadata?: { name?: string };
} | null> {
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.slice(7);
  const payload = auth.verifyAccessToken(token);
  if (!payload) return null;
  return { id: payload.sub, email: payload.email, user_metadata: { name: payload.name } };
}

function assertString(value: unknown, name: string, maxLength = 1000): string {
  if (typeof value !== 'string') throw new Error(`${name} must be a string`);
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > maxLength) throw new Error(`${name} is invalid`);
  return trimmed;
}

app.use('*', cors({ origin: allowedOrigin, allowHeaders: ['Authorization', 'Content-Type', 'X-Request-Id'] }));

app.use('*', async (c, next) => {
  const requestId = c.req.header('X-Request-Id') ?? getRequestId();
  c.set('requestId', requestId);
  const ip = c.req.header('x-forwarded-for') ?? 'unknown';
  const now = Date.now();
  const bucket = requestBuckets.get(ip);
  if (!bucket || now - bucket.startedAt > RATE_WINDOW_MS) {
    requestBuckets.set(ip, { count: 1, startedAt: now });
  } else {
    bucket.count += 1;
    if (bucket.count > rateLimitPerMinute) {
      return c.json({ error: 'Too many requests', requestId }, 429);
    }
  }
  log('info', 'request_received', { requestId, method: c.req.method, path: c.req.path, ip });
  await next();
});

app.get(`${routePrefix}/health`, (c) => {
  const requestId = c.get('requestId') as string;
  return c.json({ ok: true, environment, requestId });
});

app.post(`${routePrefix}/login`, async (c) => {
  const requestId = c.get('requestId') as string;
  try {
    const body = await c.req.json();
    const email = assertString(body.email, 'email', 255);
    const password = assertString(body.password, 'password', 255);
    const row = await auth.findUserByEmail(pool, email);
    if (!row || !(await auth.verifyPassword(password, row.password_hash))) {
      return c.json({ error: 'Invalid email or password', requestId }, 401);
    }
    const user = auth.userRowToClient(row);
    const access_token = auth.signAccessToken({
      sub: row.id,
      email: row.email,
      name: row.name,
    });
    return c.json({ access_token, user, requestId });
  } catch (error) {
    log('error', 'login_exception', { requestId, error: String(error) });
    return c.json({ error: 'Login failed', requestId }, 500);
  }
});

app.post(`${routePrefix}/signup`, async (c) => {
  const requestId = c.get('requestId') as string;
  try {
    const body = await c.req.json();
    const email = assertString(body.email, 'email', 255);
    const password = assertString(body.password, 'password', 255);
    const name = assertString(body.name, 'name', 120);

    if (await auth.findUserByEmail(pool, email)) {
      return c.json({ error: 'Email already registered', requestId }, 400);
    }

    const hash = await auth.hashPassword(password);
    const row = await auth.createUser(pool, email, hash, name);
    const user = auth.userRowToClient(row);
    const access_token = auth.signAccessToken({
      sub: row.id,
      email: row.email,
      name: row.name,
    });

    return c.json({ success: true, user, access_token, requestId });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    if (msg.includes('unique') || msg.includes('duplicate')) {
      return c.json({ error: 'Email already registered', requestId }, 400);
    }
    log('error', 'signup_exception', { requestId, error: msg });
    return c.json({ error: 'Signup failed', requestId }, 500);
  }
});

app.get(`${routePrefix}/profile`, async (c) => {
  const requestId = c.get('requestId') as string;
  const user = await getUserFromAuthHeader(c.req.header('Authorization'));
  if (!user) return c.json({ error: 'Unauthorized', requestId }, 401);
  try {
    const profile = await kv.kvGet(pool, `profile:${user.id}`);
    return c.json({ profile: profile || {}, requestId });
  } catch (error) {
    log('error', 'get_profile_failed', { requestId, userId: user.id, error: String(error) });
    return c.json({ error: 'Failed to get profile', requestId }, 500);
  }
});

app.post(`${routePrefix}/profile`, async (c) => {
  const requestId = c.get('requestId') as string;
  const user = await getUserFromAuthHeader(c.req.header('Authorization'));
  if (!user) return c.json({ error: 'Unauthorized', requestId }, 401);
  try {
    const body = await c.req.json();
    await kv.kvSet(pool, `profile:${user.id}`, body);
    return c.json({ success: true, requestId });
  } catch (error) {
    log('error', 'update_profile_failed', { requestId, userId: user.id, error: String(error) });
    return c.json({ error: 'Failed to update profile', requestId }, 500);
  }
});

app.post(`${routePrefix}/aptitude-test`, async (c) => {
  const requestId = c.get('requestId') as string;
  const user = await getUserFromAuthHeader(c.req.header('Authorization'));
  if (!user) return c.json({ error: 'Unauthorized', requestId }, 401);
  try {
    const body = await c.req.json();
    const { answers, score, recommendations } = body;
    if (typeof score !== 'number') throw new Error('score must be number');
    if (!Array.isArray(recommendations)) throw new Error('recommendations must be array');
    const result = { answers, score, recommendations, timestamp: new Date().toISOString() };
    await kv.kvSet(pool, `aptitude:${user.id}`, result);
    return c.json({ success: true, result, requestId });
  } catch (error) {
    log('error', 'save_aptitude_failed', { requestId, userId: user.id, error: String(error) });
    return c.json({ error: 'Failed to save test results', requestId }, 500);
  }
});

app.get(`${routePrefix}/aptitude-test`, async (c) => {
  const requestId = c.get('requestId') as string;
  const user = await getUserFromAuthHeader(c.req.header('Authorization'));
  if (!user) return c.json({ error: 'Unauthorized', requestId }, 401);
  try {
    const result = await kv.kvGet(pool, `aptitude:${user.id}`);
    return c.json({ result, requestId });
  } catch (error) {
    log('error', 'get_aptitude_failed', { requestId, userId: user.id, error: String(error) });
    return c.json({ error: 'Failed to get test results', requestId }, 500);
  }
});

app.post(`${routePrefix}/personality-test`, async (c) => {
  const requestId = c.get('requestId') as string;
  const user = await getUserFromAuthHeader(c.req.header('Authorization'));
  if (!user) return c.json({ error: 'Unauthorized', requestId }, 401);
  try {
    const body = await c.req.json();
    const result = { ...body, timestamp: new Date().toISOString() };
    await kv.kvSet(pool, `personality:${user.id}`, result);
    return c.json({ success: true, result, requestId });
  } catch (error) {
    log('error', 'save_personality_failed', { requestId, userId: user.id, error: String(error) });
    return c.json({ error: 'Failed to save personality results', requestId }, 500);
  }
});

app.get(`${routePrefix}/counselors`, async (c) => {
  const requestId = c.get('requestId') as string;
  try {
    const field = c.req.query('field');
    let counselors = (await kv.kvGetByPrefix(pool, 'counselor:')) as Record<string, unknown>[];
    if (field) {
      counselors = counselors.filter(
        (x) => String(x.field ?? '').toLowerCase() === field.toLowerCase(),
      );
    }
    return c.json({ counselors, requestId });
  } catch (error) {
    log('error', 'get_counselors_failed', { requestId, error: String(error) });
    return c.json({ error: 'Failed to get counselors', requestId }, 500);
  }
});

app.post(`${routePrefix}/book-counselor`, async (c) => {
  const requestId = c.get('requestId') as string;
  const user = await getUserFromAuthHeader(c.req.header('Authorization'));
  if (!user) return c.json({ error: 'Unauthorized', requestId }, 401);
  try {
    const body = await c.req.json();
    const bookingId = `booking:${user.id}:${Date.now()}`;
    await kv.kvSet(pool, bookingId, { userId: user.id, ...body, timestamp: new Date().toISOString() });
    return c.json({ success: true, bookingId, requestId });
  } catch (error) {
    log('error', 'book_counselor_failed', { requestId, userId: user.id, error: String(error) });
    return c.json({ error: 'Failed to book counselor', requestId }, 500);
  }
});

app.post(`${routePrefix}/analyze-resume`, async (c) => {
  const requestId = c.get('requestId') as string;
  const user = await getUserFromAuthHeader(c.req.header('Authorization'));
  if (!user) return c.json({ error: 'Unauthorized', requestId }, 401);
  try {
    const body = await c.req.json();
    const resumeText = assertString(body.resumeText, 'resumeText', 25000);
    const jobDescription = assertString(body.jobDescription, 'jobDescription', 25000);
    const keywords = jobDescription.toLowerCase().split(/\s+/);
    const resumeLower = resumeText.toLowerCase();
    let matchCount = 0;
    keywords.forEach((keyword: string) => {
      if (keyword.length > 3 && resumeLower.includes(keyword)) matchCount += 1;
    });
    const score = Math.min(100, Math.round((matchCount / Math.max(keywords.length, 1)) * 100));
    const analysis = {
      score,
      matchedKeywords: matchCount,
      totalKeywords: keywords.length,
      suggestions:
        score < 70
          ? [
              'Add more relevant keywords from job description',
              'Highlight technical skills mentioned in the job posting',
              'Include specific achievements and metrics',
            ]
          : ['Your resume is well-optimized for this position!'],
      timestamp: new Date().toISOString(),
    };
    await kv.kvSet(pool, `resume-analysis:${user.id}:${Date.now()}`, analysis);
    return c.json({ analysis, requestId });
  } catch (error) {
    log('error', 'analyze_resume_failed', { requestId, userId: user.id, error: String(error) });
    return c.json({ error: 'Failed to analyze resume', requestId }, 500);
  }
});

app.get(`${routePrefix}/resume-count`, async (c) => {
  const requestId = c.get('requestId') as string;
  const user = await getUserFromAuthHeader(c.req.header('Authorization'));
  if (!user) return c.json({ error: 'Unauthorized', requestId }, 401);
  try {
    const resumes = await kv.kvGetByPrefix(pool, `resume:${user.id}:`);
    const isPremium = await kv.kvGet(pool, `premium:${user.id}`);
    return c.json({
      count: resumes.length,
      isPremium: !!isPremium,
      canCreate: !!isPremium || resumes.length < 3,
      requestId,
    });
  } catch (error) {
    log('error', 'resume_count_failed', { requestId, userId: user.id, error: String(error) });
    return c.json({ error: 'Failed to get resume count', requestId }, 500);
  }
});

app.post(`${routePrefix}/save-resume`, async (c) => {
  const requestId = c.get('requestId') as string;
  const user = await getUserFromAuthHeader(c.req.header('Authorization'));
  if (!user) return c.json({ error: 'Unauthorized', requestId }, 401);
  try {
    const body = await c.req.json();
    const resumes = await kv.kvGetByPrefix(pool, `resume:${user.id}:`);
    const isPremium = await kv.kvGet(pool, `premium:${user.id}`);
    if (!isPremium && resumes.length >= 3) {
      return c.json({ error: 'Free tier limited to 3 resumes. Upgrade to Premium!', requestId }, 403);
    }
    const resumeId = `resume:${user.id}:${Date.now()}`;
    await kv.kvSet(pool, resumeId, { ...body, timestamp: new Date().toISOString() });
    return c.json({ success: true, resumeId, requestId });
  } catch (error) {
    log('error', 'save_resume_failed', { requestId, userId: user.id, error: String(error) });
    return c.json({ error: 'Failed to save resume', requestId }, 500);
  }
});

app.get(`${routePrefix}/my-resumes`, async (c) => {
  const requestId = c.get('requestId') as string;
  const user = await getUserFromAuthHeader(c.req.header('Authorization'));
  if (!user) return c.json({ error: 'Unauthorized', requestId }, 401);
  try {
    const rows = await kv.kvListByPrefix(pool, `resume:${user.id}:`, 50);
    const resumes = rows.map(({ key, value }) => {
      const v = value as Record<string, unknown>;
      const ts = typeof v.timestamp === 'string' ? v.timestamp : '';
      const label =
        (typeof v.name === 'string' && v.name.trim()) ||
        (typeof v.email === 'string' && v.email.trim()) ||
        key.slice(-12);
      return { key, label, timestamp: ts };
    });
    return c.json({ resumes, requestId });
  } catch (error) {
    log('error', 'my_resumes_failed', { requestId, userId: user.id, error: String(error) });
    return c.json({ error: 'Failed to list resumes', requestId }, 500);
  }
});

app.get(`${routePrefix}/resume`, async (c) => {
  const requestId = c.get('requestId') as string;
  const user = await getUserFromAuthHeader(c.req.header('Authorization'));
  if (!user) return c.json({ error: 'Unauthorized', requestId }, 401);
  const key = c.req.query('key') ?? '';
  const prefix = `resume:${user.id}:`;
  if (!key.startsWith(prefix)) {
    return c.json({ error: 'Invalid resume key', requestId }, 400);
  }
  try {
    const doc = await kv.kvGet(pool, key);
    if (!doc) return c.json({ error: 'Not found', requestId }, 404);
    return c.json({ resume: doc, key, requestId });
  } catch (error) {
    log('error', 'get_resume_failed', { requestId, userId: user.id, error: String(error) });
    return c.json({ error: 'Failed to load resume', requestId }, 500);
  }
});

app.post(`${routePrefix}/track-job`, async (c) => {
  const requestId = c.get('requestId') as string;
  const user = await getUserFromAuthHeader(c.req.header('Authorization'));
  if (!user) return c.json({ error: 'Unauthorized', requestId }, 401);
  try {
    const body = await c.req.json();
    const jobId = `job:${user.id}:${Date.now()}`;
    await kv.kvSet(pool, jobId, { ...body, status: 'applied', timestamp: new Date().toISOString() });
    return c.json({ success: true, jobId, requestId });
  } catch (error) {
    log('error', 'track_job_failed', { requestId, userId: user.id, error: String(error) });
    return c.json({ error: 'Failed to track job', requestId }, 500);
  }
});

app.get(`${routePrefix}/tracked-jobs`, async (c) => {
  const requestId = c.get('requestId') as string;
  const user = await getUserFromAuthHeader(c.req.header('Authorization'));
  if (!user) return c.json({ error: 'Unauthorized', requestId }, 401);
  try {
    const jobs = await kv.kvGetByPrefix(pool, `job:${user.id}:`);
    return c.json({ jobs, requestId });
  } catch (error) {
    log('error', 'get_jobs_failed', { requestId, userId: user.id, error: String(error) });
    return c.json({ error: 'Failed to get tracked jobs', requestId }, 500);
  }
});

app.get(`${routePrefix}/community/questions`, async (c) => {
  const requestId = c.get('requestId') as string;
  try {
    const questions = (await kv.kvGetByPrefix(pool, 'question:')) as { timestamp?: string }[];
    questions.sort(
      (a, b) => new Date(b.timestamp ?? 0).getTime() - new Date(a.timestamp ?? 0).getTime(),
    );
    return c.json({ questions, requestId });
  } catch (error) {
    log('error', 'get_questions_failed', { requestId, error: String(error) });
    return c.json({ error: 'Failed to get questions', requestId }, 500);
  }
});

app.post(`${routePrefix}/community/question`, async (c) => {
  const requestId = c.get('requestId') as string;
  const user = await getUserFromAuthHeader(c.req.header('Authorization'));
  if (!user) return c.json({ error: 'Unauthorized', requestId }, 401);
  try {
    const body = await c.req.json();
    const questionId = `question:${Date.now()}`;
    await kv.kvSet(pool, questionId, {
      ...body,
      userId: user.id,
      userName: user.user_metadata?.name || 'Anonymous',
      answers: [],
      votes: 0,
      timestamp: new Date().toISOString(),
    });
    return c.json({ success: true, questionId, requestId });
  } catch (error) {
    log('error', 'post_question_failed', { requestId, userId: user.id, error: String(error) });
    return c.json({ error: 'Failed to post question', requestId }, 500);
  }
});

app.post(`${routePrefix}/community/answer`, async (c) => {
  const requestId = c.get('requestId') as string;
  const user = await getUserFromAuthHeader(c.req.header('Authorization'));
  if (!user) return c.json({ error: 'Unauthorized', requestId }, 401);
  try {
    const body = await c.req.json();
    const questionId = assertString(body.questionId, 'questionId', 200);
    const answer = assertString(body.answer, 'answer', 5000);
    const question = (await kv.kvGet(pool, questionId)) as Record<string, unknown> | undefined;
    if (!question) return c.json({ error: 'Question not found', requestId }, 404);
    const answers = (question.answers as unknown[]) || [];
    answers.push({
      userId: user.id,
      userName: user.user_metadata?.name || 'Anonymous',
      answer,
      votes: 0,
      timestamp: new Date().toISOString(),
    });
    question.answers = answers;
    await kv.kvSet(pool, questionId, question);
    return c.json({ success: true, requestId });
  } catch (error) {
    log('error', 'post_answer_failed', { requestId, userId: user.id, error: String(error) });
    return c.json({ error: 'Failed to post answer', requestId }, 500);
  }
});

app.get(`${routePrefix}/colleges`, async (c) => {
  const requestId = c.get('requestId') as string;
  try {
    const field = c.req.query('field');
    let colleges = (await kv.kvGetByPrefix(pool, 'college:')) as { programs?: string[] }[];
    if (field) {
      const fl = field.toLowerCase();
      colleges = colleges.filter((col) =>
        col.programs?.some((p: string) => p.toLowerCase().includes(fl)),
      );
    }
    colleges.sort((a: { featured?: boolean; ranking?: number }, b: { featured?: boolean; ranking?: number }) => {
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return (a.ranking ?? 0) - (b.ranking ?? 0);
    });
    return c.json({ colleges, requestId });
  } catch (error) {
    log('error', 'get_colleges_failed', { requestId, error: String(error) });
    return c.json({ error: 'Failed to get colleges', requestId }, 500);
  }
});

app.get(`${routePrefix}/dsa/daily-question`, async (c) => {
  const requestId = c.get('requestId') as string;
  try {
    const today = new Date().toISOString().split('T')[0];
    let question = await kv.kvGet(pool, `dsa-daily:${today}`);
    if (!question) {
      const questions = await kv.kvGetByPrefix(pool, 'dsa-question:');
      const arr = questions as Record<string, unknown>[];
      question =
        arr[Math.floor(Math.random() * Math.max(arr.length, 1))] ||
        ({
          title: 'Two Sum',
          difficulty: 'Easy',
          description:
            'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
          examples: ['Input: nums = [2,7,11,15], target = 9\nOutput: [0,1]'],
          constraints: ['2 <= nums.length <= 10^4'],
          hints: ['Use a hash map to store values and indices'],
        } as Record<string, unknown>);
      await kv.kvSet(pool, `dsa-daily:${today}`, question);
    }
    return c.json({ question, requestId });
  } catch (error) {
    log('error', 'get_daily_dsa_failed', { requestId, error: String(error) });
    return c.json({ error: 'Failed to get daily question', requestId }, 500);
  }
});

app.post(`${routePrefix}/dsa/submit`, async (c) => {
  const requestId = c.get('requestId') as string;
  const user = await getUserFromAuthHeader(c.req.header('Authorization'));
  if (!user) return c.json({ error: 'Unauthorized', requestId }, 401);
  try {
    const body = await c.req.json();
    const submissionId = `submission:${user.id}:${Date.now()}`;
    await kv.kvSet(pool, submissionId, { ...body, timestamp: new Date().toISOString() });
    return c.json({ success: true, submissionId, requestId });
  } catch (error) {
    log('error', 'submit_dsa_failed', { requestId, userId: user.id, error: String(error) });
    return c.json({ error: 'Failed to submit solution', requestId }, 500);
  }
});

app.get(`${routePrefix}/job-postings`, async (c) => {
  const requestId = c.get('requestId') as string;
  try {
    const postings = (await kv.kvGetByPrefix(pool, 'job-posting:')) as { postedDate?: string }[];
    postings.sort(
      (a, b) => new Date(b.postedDate ?? 0).getTime() - new Date(a.postedDate ?? 0).getTime(),
    );
    return c.json({ postings, requestId });
  } catch (error) {
    log('error', 'get_job_postings_failed', { requestId, error: String(error) });
    return c.json({ error: 'Failed to get job postings', requestId }, 500);
  }
});

app.post(`${routePrefix}/upgrade-premium`, async (c) => {
  const requestId = c.get('requestId') as string;
  const user = await getUserFromAuthHeader(c.req.header('Authorization'));
  if (!user) return c.json({ error: 'Unauthorized', requestId }, 401);
  try {
    await kv.kvSet(pool, `premium:${user.id}`, { activated: true, timestamp: new Date().toISOString() });
    return c.json({ success: true, requestId });
  } catch (error) {
    log('error', 'upgrade_premium_failed', { requestId, userId: user.id, error: String(error) });
    return c.json({ error: 'Failed to upgrade', requestId }, 500);
  }
});

app.post(`${routePrefix}/execute-code`, async (c) => {
  const requestId = c.get('requestId') as string;
  try {
    const body = await c.req.json();
    const language = assertString(body.language, 'language', 24);
    const source = typeof body.source === 'string' ? body.source : '';
    const stdin = typeof body.stdin === 'string' ? body.stdin : '';
    const v = validateSource(source);
    if (!v.ok) return c.json({ error: v.error, requestId }, 400);
    const result = await executeRemote(language, source, stdin);
    return c.json({ ...result, requestId });
  } catch (error) {
    log('error', 'execute_code_failed', { requestId, error: String(error) });
    return c.json({ error: 'Execution request failed', requestId }, 500);
  }
});

const port = Number(process.env.PORT ?? '8787');

async function start() {
  if (enableSeed) {
    try {
      await seedIfEmpty(pool);
    } catch (e) {
      log('error', 'init_seed_failed', { error: String(e) });
    }
  }
  try {
    await ensureJobPostings(pool);
  } catch (e) {
    log('error', 'ensure_job_postings_failed', { error: String(e) });
  }
  serve({ fetch: app.fetch, port }, () => {
    console.log(`[server] Listening on http://localhost:${port}${routePrefix}/health`);
  });
}

start().catch((e) => {
  console.error(e);
  process.exit(1);
});

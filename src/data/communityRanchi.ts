/** Synthetic Q&A bank: Ranchi-area colleges + student-style names (demo data, not real individuals). */

export type CommunityQuestion = {
  id: string;
  title: string;
  content: string;
  tags: string[];
  userId: string;
  userName: string;
  votes: number;
  answers: { userId: string; userName: string; answer: string; votes: number; timestamp: string }[];
  timestamp: string;
};

const COLLEGES = [
  'BIT Mesra',
  'Ranchi University',
  "St. Xavier's College, Ranchi",
  'Marwari College, Ranchi',
  'Doranda College, Ranchi',
  'Ranchi College',
  'IIIT Ranchi',
  'NIFFT Ranchi',
  'Usha Martin University',
  'Amity University Jharkhand (Ranchi)',
  'Central University of Jharkhand',
  'DSPMU Ranchi',
  'Ranchi Womens College',
  'Cambridge Institute of Technology, Ranchi',
  'Silli Polytechnic',
  'Gossner College, Ranchi',
  'Doranda Womens College',
  'Jharkhand Rai University',
  'Sarala Birla University',
  'YBN University',
] as const;

const FIRST = [
  'Aditya', 'Ananya', 'Rohan', 'Priya', 'Karan', 'Neha', 'Vikash', 'Sneha', 'Rahul', 'Kavya', 'Arjun', 'Ishita',
  'Manish', 'Divya', 'Saurabh', 'Pooja', 'Nitish', 'Ritu', 'Aman', 'Shreya', 'Harsh', 'Megha', 'Gaurav', 'Tanvi',
  'Deepak', 'Ankita', 'Suraj', 'Swati', 'Raj', 'Komal', 'Abhishek', 'Jyoti', 'Siddharth', 'Preeti', 'Chandan',
  'Rimjhim', 'Vishal', 'Suman', 'Alok', 'Puja',
] as const;

const LAST = [
  'Kumar', 'Singh', 'Mahto', 'Prasad', 'Das', 'Tiwari', 'Mishra', 'Oraon', 'Hembrom', 'Minj', 'Soren', 'Xalxo',
  'Lakra', 'Bhengra', 'Hansda', 'Munda', 'Topno', 'Ekka', 'Barla', 'Kispotta', 'Bharti', 'Rana', 'Sharma',
  'Verma', 'Gupta', 'Roy', 'Ghosh', 'Mandal', 'Pandey', 'Yadav',
] as const;

const TITLE_TEMPLATES = [
  (c: string) => `Placement prep from ${c} — where to start?`,
  (c: string) => `Hostel vs PG near ${c} for 1st year?`,
  (c: string) => `Internship opportunities for ${c} students?`,
  (c: string) => `CGPA vs skills: what do companies care for ${c}?`,
  (c: string) => `Coding clubs / societies at ${c}?`,
  (c: string) => `Gate / higher studies after B.Tech from ${c}?`,
  (c: string) => `Branch change rules at ${c}?`,
  (c: string) => `Campus fest and tech events at ${c}?`,
  (c: string) => `Scholarship options at ${c}?`,
  (c: string) => `Commute from Hatia / Kantatoli to ${c}?`,
] as const;

const CONTENT_SNIPPETS = [
  'Final year student here — looking for honest advice from seniors.',
  '1st year — feeling overwhelmed with syllabus and want a roadmap.',
  'Comparing notes with friends from other colleges in Ranchi.',
  'Anyone from same batch who cracked off-campus interviews?',
  'Prefer practical tips over generic motivation.',
  'Also curious about local hackathons and meetups.',
  'Would love to connect with alumni working in Bangalore/Hyderabad.',
];

/** Spread questions from May 2025 through end of May 2026 (previous year → this month). */
const RANGE_START_MS = new Date('2025-05-01T06:00:00+05:30').getTime();
const RANGE_END_MS = new Date('2026-05-31T22:00:00+05:30').getTime();

const ANSWER_SNIPPETS: ((college: string) => string)[] = [
  (c) =>
    `Senior from ${c}: start LeetCode easy/medium + one solid project (GitHub). Most campus drives filter on aptitude + coding round first.`,
  (c) =>
    `Alumni (2023 batch) from ${c}: CGPA 7.5+ helps shortlist but projects matter more for startups. For IT service mass recruiters, maintain 7+ and practice verbal.`,
  () =>
    'If you stay near Kantatoli / Hinoo, shared autos to campus are common before 9 am — budget 40–80/day depending on distance.',
  (c) =>
    `For ${c}: join whatever coding/robotics society exists + inter-college events in Ranchi — networking helps for referrals.`,
  () =>
    'Internships: apply on LinkedIn + Unstop early; local NGOs/teaching gigs also look good on resume if unpaid tech intern is hard first year.',
  () =>
    'Hostel: ask seniors about mess quality and curfew; PG near main road can be noisy — visit once before locking deposit.',
  () =>
    'GATE: start 3rd year if PSU/research goal; else product companies rarely ask GATE — prioritize internships instead.',
  (c) =>
    `Scholarship desk at ${c} usually opens in July — keep income certificate + marksheets ready; EWS category has separate window.`,
  () =>
    'Branch change: rules change yearly — read latest notice PDF from exam cell; usually top 10% CGPA after 1st year.',
  () =>
    'Fest season: volunteer for tech fest logistics — easiest way to meet seniors and company reps who judge events.',
];

function pseudoRand(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function questionTimestampMs(i: number): number {
  const u = pseudoRand(i * 9301 + 17);
  return Math.round(RANGE_START_MS + u * (RANGE_END_MS - RANGE_START_MS));
}

function buildAnswers(questionPostedMs: number, i: number, college: string): CommunityQuestion['answers'] {
  const n = 1 + (i % 3);
  const answers: CommunityQuestion['answers'] = [];
  const hourMs = 3600000;
  const dayMs = 86400000;
  const span = Math.max(0, RANGE_END_MS - questionPostedMs - hourMs);
  const step = span > 0 ? span / (n + 2) : dayMs;

  for (let k = 0; k < n; k++) {
    const aFn = FIRST[(i * 3 + k * 11 + 1) % FIRST.length];
    const aLn = LAST[(i * 5 + k * 13 + 2) % LAST.length];
    const acol = COLLEGES[(i + k + 4) % COLLEGES.length];
    const text = ANSWER_SNIPPETS[(i + k) % ANSWER_SNIPPETS.length](college);
    const answerMs = Math.min(
      RANGE_END_MS - hourMs,
      Math.max(
        questionPostedMs + hourMs,
        Math.round(questionPostedMs + (k + 1) * step + pseudoRand(i * 31 + k) * dayMs),
      ),
    );
    answers.push({
      userId: `demo-ans-${i}-${k}`,
      userName: `${aFn} ${aLn} · ${acol}`,
      answer: text,
      votes: Math.floor(pseudoRand(i * 101 + k) * 40) + 1,
      timestamp: new Date(answerMs).toISOString(),
    });
  }
  return answers;
}

export function generateRanchiCommunityQuestions(total: number): CommunityQuestion[] {
  const out: CommunityQuestion[] = [];

  for (let i = 0; i < total; i++) {
    const college = COLLEGES[i % COLLEGES.length];
    const fn = FIRST[i % FIRST.length];
    const ln = LAST[(i * 17 + 3) % LAST.length];
    const userName = `${fn} ${ln} · ${college}`;
    const title = TITLE_TEMPLATES[i % TITLE_TEMPLATES.length](college);
    const content =
      `${CONTENT_SNIPPETS[i % CONTENT_SNIPPETS.length]} ` +
      `Context: studying at ${college}, Ranchi / nearby. Question #${i + 1} in local demo bank.`;

    const votes = Math.floor(pseudoRand(i + 1) * 120) + 2;
    const qMs = questionTimestampMs(i);
    const ts = new Date(qMs).toISOString();
    const answers = buildAnswers(qMs, i, college);

    out.push({
      id: `ranchi-${i + 1}`,
      title,
      content,
      tags: ['Ranchi', 'Jharkhand', college.split(',')[0].slice(0, 24), 'B.Tech', 'Career'],
      userId: `demo-user-${i + 1}`,
      userName,
      votes,
      answers,
      timestamp: ts,
    });
  }

  return out.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export const RANCHI_QUESTION_BANK_SIZE = 2000;

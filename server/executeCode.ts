const JUDGE0_URL = 'https://ce.judge0.com/submissions?base64_encoded=false&wait=true';
const MAX_SOURCE = 100_000;

/** Judge0 CE language_id — https://ce.judge0.com/languages */
const LANGUAGE_IDS: Record<string, number> = {
  java: 62,
  c: 50,
  cpp: 54,
  'c++': 54,
};

export type ExecuteCodeResult = {
  ok: boolean;
  language: string;
  compileOutput: string;
  compileStderr: string;
  compileCode: number | null;
  runStdout: string;
  runStderr: string;
  runCode: number | null;
  signal: string | null;
  statusDescription?: string;
  notice?: string;
  judgeError?: string;
};

export async function executeRemote(language: string, source: string, stdin: string): Promise<ExecuteCodeResult> {
  const lang = language.toLowerCase().trim();
  if (lang === 'apex') {
    return {
      ok: true,
      language: 'apex',
      compileOutput: '',
      compileStderr: '',
      compileCode: null,
      runStdout: '',
      runStderr: '',
      runCode: null,
      signal: null,
      notice:
        'Apex runs only on Salesforce (Developer Console, anonymous apex, or scratch orgs). Judge0 does not ship an Apex compiler. Use Trailhead modules for hands-on Apex.',
    };
  }

  const languageId = LANGUAGE_IDS[lang];
  if (!languageId) {
    return {
      ok: false,
      language: lang,
      compileOutput: '',
      compileStderr: 'Unsupported language. Use java, cpp (or c++), or c.',
      compileCode: null,
      runStdout: '',
      runStderr: '',
      runCode: null,
      signal: null,
    };
  }

  const res = await fetch(JUDGE0_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      language_id: languageId,
      source_code: source,
      stdin: stdin ?? '',
    }),
  });

  const rawText = await res.text();
  if (!res.ok) {
    return {
      ok: false,
      language: lang,
      compileOutput: '',
      compileStderr: '',
      compileCode: null,
      runStdout: '',
      runStderr: '',
      runCode: null,
      signal: null,
      judgeError: `Judge0 HTTP ${res.status}: ${rawText.slice(0, 800)}`,
    };
  }

  let data: {
    stdout?: string | null;
    stderr?: string | null;
    compile_output?: string | null;
    message?: string | null;
    status?: { id?: number; description?: string };
    exit_code?: number | null;
    exit_signal?: string | null;
  };
  try {
    data = JSON.parse(rawText) as typeof data;
  } catch {
    return {
      ok: false,
      language: lang,
      compileOutput: '',
      compileStderr: '',
      compileCode: null,
      runStdout: '',
      runStderr: '',
      runCode: null,
      signal: null,
      judgeError: rawText.slice(0, 400),
    };
  }

  const compileOut = data.compile_output ?? '';
  const stderr = data.stderr ?? '';
  const stdout = data.stdout ?? '';

  return {
    ok: true,
    language: lang,
    compileOutput: compileOut,
    compileStderr: compileOut ? '' : '',
    compileCode: compileOut ? 0 : null,
    runStdout: stdout,
    runStderr: stderr,
    runCode: typeof data.exit_code === 'number' ? data.exit_code : null,
    signal: data.exit_signal ?? null,
    statusDescription: data.status?.description,
    judgeError: data.message ?? undefined,
  };
}

export function validateSource(source: string): { ok: true } | { ok: false; error: string } {
  if (typeof source !== 'string') return { ok: false, error: 'source must be a string' };
  if (source.length > MAX_SOURCE) return { ok: false, error: `source exceeds ${MAX_SOURCE} characters` };
  return { ok: true };
}

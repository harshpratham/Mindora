import { buildApiUrl } from './api';

const JUDGE0_IDS: Record<string, number> = {
  java: 62,
  c: 50,
  cpp: 54,
  'c++': 54,
};

type Judge0Wait = {
  stdout?: string | null;
  stderr?: string | null;
  compile_output?: string | null;
  message?: string | null;
  status?: { description?: string };
  exit_code?: number | null;
  exit_signal?: string | null;
};

type ServerExecute = {
  ok: boolean;
  notice?: string;
  judgeError?: string;
  compileOutput?: string;
  runStdout?: string;
  runStderr?: string;
  runCode?: number | null;
  statusDescription?: string;
  error?: string;
};

function formatJudge0(data: Judge0Wait): string {
  const lines: string[] = [];
  if (data.status?.description) lines.push(`Status: ${data.status.description}`);
  if (data.compile_output) {
    lines.push('--- Compile output ---');
    lines.push(String(data.compile_output).trimEnd());
  }
  if (data.stderr) {
    lines.push('--- Runtime stderr ---');
    lines.push(String(data.stderr).trimEnd());
  }
  if (data.stdout !== undefined && data.stdout !== null && String(data.stdout).length > 0) {
    lines.push('--- stdout ---');
    lines.push(String(data.stdout).trimEnd());
  }
  if (data.exit_code !== undefined && data.exit_code !== null) lines.push(`Exit code: ${data.exit_code}`);
  if (data.exit_signal) lines.push(`Signal: ${data.exit_signal}`);
  if (data.message) lines.push(`Message: ${data.message}`);
  return lines.join('\n') || '(no output)';
}

function formatServer(data: ServerExecute): string {
  if (data.error) return `Error: ${data.error}`;
  if (data.notice) return data.notice;
  if (data.judgeError) return `Judge error: ${data.judgeError}`;
  const lines: string[] = [];
  if (data.statusDescription) lines.push(`Status: ${data.statusDescription}`);
  if (data.compileOutput) {
    lines.push('--- Compile output ---');
    lines.push(String(data.compileOutput).trimEnd());
  }
  if (data.runStderr) {
    lines.push('--- Runtime stderr ---');
    lines.push(String(data.runStderr).trimEnd());
  }
  if (data.runStdout) {
    lines.push('--- stdout ---');
    lines.push(String(data.runStdout).trimEnd());
  }
  if (data.runCode !== undefined && data.runCode !== null) lines.push(`Exit code: ${data.runCode}`);
  return lines.join('\n') || '(no output)';
}

export async function runUserCode(language: string, source: string, stdin: string): Promise<string> {
  const lang = language.toLowerCase();
  if (lang === 'apex') {
    return (
      'Apex runs only on Salesforce (Developer Console, Trailhead, or scratch orgs).\n' +
      'Public judges (Judge0) do not provide an Apex compiler.\n' +
      'Tip: deploy snippets to a sandbox and use Execute Anonymous for quick checks.'
    );
  }

  const id = JUDGE0_IDS[lang];
  if (!id) {
    return 'Unsupported language. Choose Java, C++, C, or Apex (info only).';
  }

  if (import.meta.env.DEV) {
    const res = await fetch('/api/judge0/submissions?base64_encoded=false&wait=true', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ language_id: id, source_code: source, stdin }),
    });
    const data = (await res.json()) as Judge0Wait & { error?: string; message?: string };
    if (!res.ok) {
      return `Run failed (${res.status}): ${data.message || data.error || JSON.stringify(data).slice(0, 400)}`;
    }
    return formatJudge0(data);
  }

  const res = await fetch(buildApiUrl('execute-code'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ language, source, stdin }),
  });
  const data = (await res.json()) as ServerExecute;
  if (!res.ok) return `Error: ${data.error || res.statusText}`;
  return formatServer(data);
}

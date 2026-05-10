export type ResumeFormData = {
  name: string;
  email: string;
  phone: string;
  github: string;
  linkedin: string;
  summary: string;
  experience: string;
  education: string;
  skills: string;
  projects: string;
};

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function block(title: string, body: string): string {
  const t = body.trim();
  if (!t) return '';
  const safe = escapeHtml(t).replace(/\n/g, '<br/>');
  return `<section class="section"><h2>${escapeHtml(title)}</h2><div class="body">${safe}</div></section>`;
}

export function buildResumePrintDocument(d: ResumeFormData): string {
  const contact: string[] = [];
  if (d.email.trim()) contact.push(escapeHtml(d.email.trim()));
  if (d.phone.trim()) contact.push(escapeHtml(d.phone.trim()));
  if (d.github.trim()) contact.push(escapeHtml(d.github.trim()));
  if (d.linkedin.trim()) contact.push(escapeHtml(d.linkedin.trim()));

  const name = d.name.trim() || 'Resume';
  const summary = d.summary.trim();

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <title>${escapeHtml(name)} — Resume</title>
  <style>
    @page { size: A4; margin: 14mm; }
    * { box-sizing: border-box; }
    body {
      font-family: 'Segoe UI', system-ui, sans-serif;
      font-size: 10.5pt;
      line-height: 1.45;
      color: #1a1a1a;
      max-width: 720px;
      margin: 0 auto;
      padding: 8px;
    }
    h1 { font-size: 20pt; font-weight: 700; margin: 0 0 4px 0; letter-spacing: -0.02em; }
    .contact { font-size: 9.5pt; color: #444; margin-bottom: 14px; }
    .section { margin-top: 12px; page-break-inside: avoid; }
    .section h2 {
      font-size: 9pt;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #2563eb;
      border-bottom: 1px solid #e5e7eb;
      padding-bottom: 4px;
      margin: 0 0 6px 0;
    }
    .body { white-space: normal; }
  </style>
</head>
<body>
  <h1>${escapeHtml(name)}</h1>
  ${contact.length ? `<div class="contact">${contact.join(' · ')}</div>` : ''}
  ${summary ? block('Summary', summary) : ''}
  ${d.skills.trim() ? block('Skills', d.skills) : ''}
  ${block('Experience', d.experience)}
  ${block('Education', d.education)}
  ${block('Projects', d.projects)}
</body>
</html>`;
}

/** Opens a print dialog so the user can save as PDF (browser print → “Save as PDF”). */
export function printResumeAsPdf(d: ResumeFormData): void {
  const html = buildResumePrintDocument(d);
  const w = window.open('about:blank', '_blank', 'noopener,noreferrer,width=900,height=1200');
  if (!w) {
    window.alert('Pop-up blocked. Allow pop-ups for this site to print / save PDF.');
    return;
  }
  w.document.open();
  w.document.write(html);
  w.document.close();
  w.focus();
  window.setTimeout(() => {
    w.print();
  }, 250);
}

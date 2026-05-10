export function calculateAtsScore(resumeText: string, jobDescription: string): number {
  const keywords = jobDescription
    .toLowerCase()
    .split(/\s+/)
    .filter((word) => word.length > 3);
  if (!keywords.length) return 0;

  const resumeLower = resumeText.toLowerCase();
  let matchCount = 0;
  for (const keyword of keywords) {
    if (resumeLower.includes(keyword)) {
      matchCount += 1;
    }
  }
  return Math.min(100, Math.round((matchCount / keywords.length) * 100));
}

export function canCreateResume(isPremium: boolean, resumeCount: number): boolean {
  return isPremium || resumeCount < 3;
}

export function getAtsSuggestions(score: number): string[] {
  if (score < 70) {
    return [
      'Add more phrases from the job description (skills, tools, responsibilities) where truthful.',
      'Mirror important keywords naturally in your summary and experience bullets.',
      'Quantify outcomes (%, revenue, users, latency) so scanners pick up impact.',
    ];
  }
  return ['Your resume aligns well with the pasted job description for keyword overlap.'];
}

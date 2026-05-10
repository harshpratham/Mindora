import { describe, expect, it } from 'vitest';
import { calculateAtsScore, canCreateResume, getAtsSuggestions } from './career';

describe('career utils', () => {
  it('calculates ATS score from matching keywords', () => {
    const score = calculateAtsScore(
      'Experienced React and TypeScript developer with testing skills',
      'Looking for React TypeScript engineer with system design knowledge',
    );
    expect(score).toBeGreaterThan(0);
  });

  it('allows resume creation correctly by tier', () => {
    expect(canCreateResume(false, 2)).toBe(true);
    expect(canCreateResume(false, 3)).toBe(false);
    expect(canCreateResume(true, 10)).toBe(true);
  });

  it('returns improvement tips for low ATS scores', () => {
    expect(getAtsSuggestions(40).length).toBeGreaterThan(1);
    expect(getAtsSuggestions(90).length).toBe(1);
  });
});

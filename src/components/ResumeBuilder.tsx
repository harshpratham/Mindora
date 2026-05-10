import { useState, useEffect, useCallback } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Progress } from './ui/progress';
import { FileText, Download, Sparkles, Crown, Loader2, FolderOpen } from 'lucide-react';
import { buildApiUrl } from '../utils/api';
import * as session from '../utils/session';
import { calculateAtsScore, getAtsSuggestions } from '../utils/career';
import { printResumeAsPdf, type ResumeFormData } from '../utils/resumePdf';

interface ResumeBuilderProps {
  user: any;
  onShowAuth: () => void;
}

const DRAFT_KEY = 'mindora_resume_draft_v1';

const emptyForm = (): ResumeFormData => ({
  name: '',
  email: '',
  phone: '',
  github: '',
  linkedin: '',
  summary: '',
  experience: '',
  education: '',
  skills: '',
  projects: '',
});

function docToForm(doc: Record<string, unknown>): ResumeFormData {
  return {
    name: String(doc.name ?? ''),
    email: String(doc.email ?? ''),
    phone: String(doc.phone ?? ''),
    github: String(doc.github ?? ''),
    linkedin: String(doc.linkedin ?? ''),
    summary: String(doc.summary ?? ''),
    experience: String(doc.experience ?? ''),
    education: String(doc.education ?? ''),
    skills: String(doc.skills ?? ''),
    projects: String(doc.projects ?? ''),
  };
}

type SavedResumeMeta = { key: string; label: string; timestamp: string };

export function ResumeBuilder({ user, onShowAuth }: ResumeBuilderProps) {
  const [resumeData, setResumeData] = useState<ResumeFormData>(emptyForm);
  const [jobDescription, setJobDescription] = useState('');
  const [atsScore, setAtsScore] = useState<number | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [resumeCount, setResumeCount] = useState(0);
  const [canCreate, setCanCreate] = useState(true);
  const [isPremium, setIsPremium] = useState(false);
  const [savedResumes, setSavedResumes] = useState<SavedResumeMeta[]>([]);
  const [loadKey, setLoadKey] = useState('');
  const [loadingList, setLoadingList] = useState(false);
  const [loadingResume, setLoadingResume] = useState(false);
  const [saving, setSaving] = useState(false);
  const [draftNote, setDraftNote] = useState('');

  const checkResumeLimit = useCallback(async () => {
    if (!user) {
      setResumeCount(0);
      setCanCreate(true);
      setIsPremium(false);
      return;
    }
    try {
      const { data: { session: s } } = await session.getSession();
      if (!s?.access_token) return;
      const response = await fetch(buildApiUrl('resume-count'), {
        headers: { Authorization: `Bearer ${s.access_token}` },
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) return;
      setResumeCount(data.count || 0);
      setCanCreate(!!data.canCreate);
      setIsPremium(!!data.isPremium);
    } catch (error) {
      console.error('Error checking resume limit:', error);
    }
  }, [user]);

  const fetchSavedList = useCallback(async () => {
    if (!user) {
      setSavedResumes([]);
      setLoadKey('');
      return;
    }
    setLoadingList(true);
    try {
      const { data: { session: s } } = await session.getSession();
      if (!s?.access_token) return;
      const response = await fetch(buildApiUrl('my-resumes'), {
        headers: { Authorization: `Bearer ${s.access_token}` },
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) return;
      const list = (data.resumes || []) as SavedResumeMeta[];
      setSavedResumes(list);
      setLoadKey('');
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingList(false);
    }
  }, [user]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Record<string, unknown>;
        setResumeData((prev) => ({ ...prev, ...docToForm(parsed) }));
        setDraftNote('Restored draft from this device.');
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    const t = window.setTimeout(() => {
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(resumeData));
      } catch {
        /* quota */
      }
    }, 500);
    return () => window.clearTimeout(t);
  }, [resumeData]);

  useEffect(() => {
    void checkResumeLimit();
  }, [checkResumeLimit]);

  useEffect(() => {
    void fetchSavedList();
  }, [fetchSavedList]);

  const analyzeResume = () => {
    const jd = jobDescription.trim();
    if (!jd) {
      setAtsScore(null);
      setSuggestions([]);
      window.alert('Paste a job description (or posting text) first, then run the analyzer.');
      return;
    }
    const resumeText = Object.values(resumeData).join('\n');
    if (!resumeText.trim()) {
      window.alert('Fill in at least some resume fields before analyzing.');
      return;
    }
    const score = calculateAtsScore(resumeText, jd);
    setAtsScore(score);
    setSuggestions(getAtsSuggestions(score));
  };

  const saveResume = async () => {
    if (!resumeData.name.trim() || !resumeData.email.trim()) {
      window.alert('Please enter at least your full name and email before saving.');
      return;
    }

    if (!user) {
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(resumeData));
        setDraftNote('Draft saved on this device. Sign in to store copies in your account.');
      } catch {
        window.alert('Could not save draft (storage may be full).');
      }
      return;
    }

    if (!canCreate && !isPremium) {
      window.alert('Free tier is limited to 3 saved resumes in your account. Upgrade to Premium for more.');
      return;
    }

    setSaving(true);
    try {
      const { data: { session: s } } = await session.getSession();
      if (!s?.access_token) {
        onShowAuth();
        return;
      }
      const response = await fetch(buildApiUrl('save-resume'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${s.access_token}`,
        },
        body: JSON.stringify(resumeData),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        window.alert(typeof data.error === 'string' ? data.error : 'Failed to save resume.');
        return;
      }
      window.alert('Resume saved to your account.');
      await checkResumeLimit();
      await fetchSavedList();
    } catch (error) {
      console.error('Error saving resume:', error);
      window.alert('Failed to save resume. Check your connection and try again.');
    } finally {
      setSaving(false);
    }
  };

  const loadFromAccount = async () => {
    if (!loadKey || !user) return;
    setLoadingResume(true);
    try {
      const { data: { session: s } } = await session.getSession();
      if (!s?.access_token) {
        onShowAuth();
        return;
      }
      const url = `${buildApiUrl('resume')}?key=${encodeURIComponent(loadKey)}`;
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${s.access_token}` },
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        window.alert(typeof data.error === 'string' ? data.error : 'Could not load resume.');
        return;
      }
      const doc = data.resume as Record<string, unknown>;
      setResumeData(docToForm(doc));
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(docToForm(doc)));
      } catch {
        /* ignore */
      }
      setDraftNote('Loaded from your account (draft updated on this device).');
    } finally {
      setLoadingResume(false);
    }
  };

  const upgradeToPremium = async () => {
    if (!user) {
      onShowAuth();
      return;
    }

    try {
      const { data: { session: s } } = await session.getSession();
      if (!s?.access_token) return;
      const response = await fetch(buildApiUrl('upgrade-premium'), {
        method: 'POST',
        headers: { Authorization: `Bearer ${s.access_token}` },
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        window.alert(typeof data.error === 'string' ? data.error : 'Upgrade failed.');
        return;
      }
      window.alert('Upgraded to Premium. You can save unlimited resumes to your account.');
      await checkResumeLimit();
    } catch (error) {
      console.error('Error upgrading to premium:', error);
    }
  };

  const downloadPdf = () => {
    printResumeAsPdf(resumeData);
  };

  const clearForm = () => {
    if (!window.confirm('Clear all fields? Your device draft will reset after a moment.')) return;
    setResumeData(emptyForm());
    setAtsScore(null);
    setSuggestions([]);
    try {
      localStorage.removeItem(DRAFT_KEY);
    } catch {
      /* ignore */
    }
    setDraftNote('Form cleared.');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Card className="p-6 bg-white/80 backdrop-blur-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shrink-0">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Resume Builder</h2>
              <p className="text-sm text-gray-600">
                {user ? (
                  isPremium ? (
                    <span className="flex items-center gap-1">
                      <Crown className="w-4 h-4 text-yellow-500" />
                      Premium — unlimited cloud saves
                    </span>
                  ) : (
                    `Account saves: ${resumeCount}/3 (draft also auto-saves on this device)`
                  )
                ) : (
                  'Draft auto-saves on this device. Sign in to save up to 3 resumes in your account (free).'
                )}
              </p>
              {draftNote ? <p className="text-xs text-indigo-600 mt-1">{draftNote}</p> : null}
            </div>
          </div>
          {!isPremium && user && (
            <Button onClick={upgradeToPremium} className="bg-gradient-to-r from-yellow-500 to-orange-500 shrink-0">
              <Crown className="w-4 h-4 mr-2" />
              Upgrade to Premium
            </Button>
          )}
        </div>

        {!canCreate && !isPremium && user && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
            <p className="text-yellow-800 font-medium text-sm">
              You have reached the free account limit of 3 saved resumes. You can still edit, analyze, and print PDFs.
              Upgrade to Premium for unlimited cloud saves.
            </p>
          </div>
        )}

        {user && (
          <div className="mt-4 flex flex-col sm:flex-row gap-3 sm:items-end border-t pt-4">
            <div className="flex-1 space-y-2">
              <Label className="flex items-center gap-2">
                <FolderOpen className="w-4 h-4 text-gray-500" />
                Load a resume saved to your account
              </Label>
              <div className="flex flex-col sm:flex-row gap-2">
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={loadKey}
                  onChange={(e) => setLoadKey(e.target.value)}
                  disabled={loadingList || savedResumes.length === 0}
                >
                  <option value="">
                    {loadingList ? 'Loading…' : savedResumes.length ? 'Choose a saved resume…' : 'No saves yet'}
                  </option>
                  {savedResumes.map((r) => (
                    <option key={r.key} value={r.key}>
                      {r.label}
                      {r.timestamp ? ` — ${new Date(r.timestamp).toLocaleString()}` : ''}
                    </option>
                  ))}
                </select>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => void loadFromAccount()}
                  disabled={!loadKey || loadingResume}
                  className="sm:w-40"
                >
                  {loadingResume ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Load'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-6 bg-white/80 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Resume information</h3>
            <Button type="button" variant="ghost" size="sm" className="text-gray-500" onClick={clearForm}>
              Clear
            </Button>
          </div>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Full name *</Label>
              <Input
                id="name"
                value={resumeData.name}
                onChange={(e) => setResumeData({ ...resumeData, name: e.target.value })}
                placeholder="John Doe"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={resumeData.email}
                  onChange={(e) => setResumeData({ ...resumeData, email: e.target.value })}
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={resumeData.phone}
                  onChange={(e) => setResumeData({ ...resumeData, phone: e.target.value })}
                  placeholder="+91 1234567890"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="github">GitHub</Label>
                <Input
                  id="github"
                  value={resumeData.github}
                  onChange={(e) => setResumeData({ ...resumeData, github: e.target.value })}
                  placeholder="github.com/johndoe"
                />
              </div>
              <div>
                <Label htmlFor="linkedin">LinkedIn</Label>
                <Input
                  id="linkedin"
                  value={resumeData.linkedin}
                  onChange={(e) => setResumeData({ ...resumeData, linkedin: e.target.value })}
                  placeholder="linkedin.com/in/johndoe"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="summary">Professional summary</Label>
              <Textarea
                id="summary"
                value={resumeData.summary}
                onChange={(e) => setResumeData({ ...resumeData, summary: e.target.value })}
                placeholder="Brief professional summary…"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="skills">Skills (comma-separated)</Label>
              <Input
                id="skills"
                value={resumeData.skills}
                onChange={(e) => setResumeData({ ...resumeData, skills: e.target.value })}
                placeholder="Python, JavaScript, React, Node.js"
              />
            </div>
            <div>
              <Label htmlFor="experience">Work experience</Label>
              <Textarea
                id="experience"
                value={resumeData.experience}
                onChange={(e) => setResumeData({ ...resumeData, experience: e.target.value })}
                placeholder="Roles, companies, dates, and bullet achievements…"
                rows={5}
              />
            </div>
            <div>
              <Label htmlFor="education">Education</Label>
              <Textarea
                id="education"
                value={resumeData.education}
                onChange={(e) => setResumeData({ ...resumeData, education: e.target.value })}
                placeholder="Degrees, institutions, years…"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="projects">Projects</Label>
              <Textarea
                id="projects"
                value={resumeData.projects}
                onChange={(e) => setResumeData({ ...resumeData, projects: e.target.value })}
                placeholder="Notable projects, stack, and outcomes…"
                rows={4}
              />
            </div>
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="p-6 bg-white/80 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-green-600" />
              <h3 className="font-semibold text-gray-900">ATS keyword match</h3>
            </div>
            <p className="text-xs text-gray-500 mb-3">
              Compares words in your resume against the job text (length &gt; 3). Works offline; sign-in not required.
            </p>
            <div className="space-y-4">
              <div>
                <Label htmlFor="jobDesc">Job description</Label>
                <Textarea
                  id="jobDesc"
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the full job description here…"
                  rows={6}
                />
              </div>
              <Button onClick={analyzeResume} className="w-full bg-gradient-to-r from-green-600 to-emerald-600">
                Analyze ATS score
              </Button>

              {atsScore !== null && (
                <div className="space-y-4">
                  <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
                    <div className="text-sm text-gray-600 mb-2">Keyword overlap score</div>
                    <div className="text-4xl font-bold text-green-600 mb-2">{atsScore}%</div>
                    <Progress value={atsScore} className="h-3" />
                  </div>

                  {suggestions.length > 0 && (
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2">Suggestions</h4>
                      <ul className="space-y-1">
                        {suggestions.map((suggestion, index) => (
                          <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                            <span className="text-blue-600">•</span>
                            <span>{suggestion}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-r from-indigo-50 to-purple-50">
            <h3 className="font-semibold text-gray-900 mb-4">Actions</h3>
            <div className="space-y-3">
              <Button
                onClick={() => void saveResume()}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600"
                disabled={(!canCreate && !isPremium && !!user) || saving}
              >
                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileText className="w-4 h-4 mr-2" />}
                {user ? 'Save to account' : 'Save draft on device'}
              </Button>
              <Button type="button" variant="outline" className="w-full" onClick={downloadPdf}>
                <Download className="w-4 h-4 mr-2" />
                Download as PDF (print)
              </Button>
              <p className="text-xs text-gray-600">
                PDF: a new tab opens — in the print dialog choose <strong>Save as PDF</strong> (Chrome / Edge) or
                “Microsoft Print to PDF”.
              </p>
            </div>
          </Card>

          {isPremium && (
            <Card className="p-6 bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300">
              <div className="flex items-center gap-2 mb-2">
                <Crown className="w-5 h-5 text-yellow-600" />
                <h3 className="font-semibold text-gray-900">Premium</h3>
              </div>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>Unlimited resume saves in your account</li>
                <li>Same ATS tools and PDF export</li>
              </ul>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

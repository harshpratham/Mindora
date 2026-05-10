import { useState, useEffect, useMemo } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Code, Play, RotateCcw, CheckCircle, Library } from 'lucide-react';
import { buildApiUrl } from '../utils/api';
import * as session from '../utils/session';
import { runUserCode } from '../utils/runUserCode';
import {
  CODING_IDE_QUESTIONS,
  VISIBLE_QUESTION_COUNT,
  MORE_QUESTIONS_LABEL,
  type CodingIdeQuestion,
  type IdeLanguage,
} from '../data/codingIdeQuestions';

interface CodingIDEProps {
  user: any;
  onShowAuth: () => void;
}

const LANGS: { id: IdeLanguage; label: string }[] = [
  { id: 'java', label: 'Java' },
  { id: 'cpp', label: 'C++' },
  { id: 'c', label: 'C' },
  { id: 'apex', label: 'Apex' },
];

export function CodingIDE({ user, onShowAuth }: CodingIDEProps) {
  const visibleQuestions = useMemo(
    () => CODING_IDE_QUESTIONS.slice(0, VISIBLE_QUESTION_COUNT),
    [],
  );
  const [selectedId, setSelectedId] = useState(visibleQuestions[0]?.id ?? 'cq-1');
  const [language, setLanguage] = useState<IdeLanguage>('java');
  const [code, setCode] = useState('');
  const [output, setOutput] = useState('Click Run to compile / execute (Java, C, C++) or read Apex note.');
  const [running, setRunning] = useState(false);

  const selected = useMemo(
    () => CODING_IDE_QUESTIONS.find((q) => q.id === selectedId) ?? CODING_IDE_QUESTIONS[0],
    [selectedId],
  );

  useEffect(() => {
    if (!selected) return;
    setCode(selected.starters[language] ?? '');
  }, [selected, language]);

  const runCode = async () => {
    setRunning(true);
    setOutput('Running…');
    try {
      const text = await runUserCode(language, code, '');
      setOutput(text);
    } catch (e: unknown) {
      setOutput(e instanceof Error ? e.message : String(e));
    } finally {
      setRunning(false);
    }
  };

  const submitSolution = async () => {
    if (!user) {
      onShowAuth();
      return;
    }
    try {
      const { data: { session: s } } = await session.getSession();
      if (s?.access_token) {
        await fetch(buildApiUrl('dsa/submit'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${s.access_token}`,
          },
          body: JSON.stringify({
            questionId: selected?.id,
            language,
            code,
            timestamp: new Date().toISOString(),
          }),
        });
        setOutput((o) => `${o}\n\n— Solution snapshot saved on server (if API is running).`);
      }
    } catch (error) {
      console.error('Error submitting solution:', error);
      setOutput((o) => `${o}\n\nSubmit failed (is the API server running?).`);
    }
  };

  const resetStarter = () => {
    if (selected) setCode(selected.starters[language] ?? '');
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy':
        return 'bg-green-100 text-green-700';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700';
      case 'hard':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const q: CodingIdeQuestion = selected;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <Card className="p-6 bg-white/80 backdrop-blur-sm">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl flex items-center justify-center">
              <Code className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Coding IDE</h2>
              <p className="text-sm text-gray-600">
                {CODING_IDE_QUESTIONS.length} practice problems · Run uses Judge0 (Java / C / C++) — Apex info-only
              </p>
            </div>
          </div>
          <Badge variant="outline" className="text-xs font-normal">
            Dev: Run works without API · Prod: start API for Run
          </Badge>
        </div>
      </Card>

      <div className="grid lg:grid-cols-12 gap-6">
        <Card className="lg:col-span-3 p-4 bg-white/80 backdrop-blur-sm flex flex-col max-h-[720px]">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Library className="w-4 h-4" />
            Question bank
          </h3>
          <div className="space-y-1 overflow-y-auto flex-1 pr-1">
            {visibleQuestions.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedId(item.id)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                  item.id === selectedId
                    ? 'bg-indigo-100 text-indigo-900 font-medium'
                    : 'hover:bg-gray-100 text-gray-800'
                }`}
              >
                <span className="block truncate">{item.title}</span>
                <span className="text-xs text-gray-500">{item.difficulty}</span>
              </button>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="rounded-lg bg-gradient-to-br from-violet-50 to-indigo-50 p-4 text-center">
              <p className="text-2xl font-bold text-indigo-700">{MORE_QUESTIONS_LABEL}</p>
              <p className="text-xs text-gray-600 mt-1">
                more problems in the full library (coming with backend sync)
              </p>
            </div>
            <p className="text-[11px] text-gray-500 mt-2 text-center">
              Showing {VISIBLE_QUESTION_COUNT} of {CODING_IDE_QUESTIONS.length} bundled problems
            </p>
          </div>
        </Card>

        <Card className="lg:col-span-5 p-6 bg-white/80 backdrop-blur-sm min-h-[400px]">
          <Tabs defaultValue="description">
            <TabsList className="mb-4 flex-wrap h-auto">
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="examples">Examples</TabsTrigger>
              <TabsTrigger value="hints">Hints</TabsTrigger>
            </TabsList>

            <TabsContent value="description">
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <h3 className="text-xl font-bold text-gray-900">{q.title}</h3>
                  <Badge className={getDifficultyColor(q.difficulty)}>{q.difficulty}</Badge>
                </div>
                <Badge variant="outline">{q.topic}</Badge>
                <p className="text-gray-700 leading-relaxed text-sm">{q.description}</p>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Constraints</h4>
                  <ul className="space-y-1 text-sm text-gray-700">
                    {q.constraints.map((c, i) => (
                      <li key={i}>• {c}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="examples">
              <div className="space-y-4">
                {q.examples.map((ex, i) => (
                  <div key={i} className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">Example {i + 1}</h4>
                    <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">{ex}</pre>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="hints">
              <div className="space-y-3">
                {q.hints.map((hint, i) => (
                  <div key={i} className="p-4 bg-blue-50 rounded-lg text-sm text-gray-700">
                    <span className="font-semibold text-blue-600 mr-1">Tip:</span>
                    {hint}
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </Card>

        <div className="lg:col-span-4 space-y-4">
          <Card className="p-4 bg-white/80 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
              <h3 className="font-semibold text-gray-900">Language</h3>
              <div className="flex gap-1 flex-wrap">
                {LANGS.map(({ id, label }) => (
                  <Button
                    key={id}
                    type="button"
                    size="sm"
                    variant={language === id ? 'default' : 'outline'}
                    className={language === id ? 'bg-indigo-600' : ''}
                    onClick={() => setLanguage(id)}
                  >
                    {label}
                  </Button>
                ))}
              </div>
            </div>
            <div className="flex gap-2 mb-2">
              <Button onClick={resetStarter} size="sm" variant="outline">
                <RotateCcw className="w-4 h-4 mr-1" />
                Reset starter
              </Button>
              <Button
                onClick={runCode}
                size="sm"
                disabled={running}
                className="bg-gradient-to-r from-green-600 to-emerald-600"
              >
                <Play className="w-4 h-4 mr-1" />
                {running ? 'Running…' : 'Run'}
              </Button>
            </div>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full min-h-[280px] lg:min-h-[320px] p-4 font-mono text-sm bg-gray-900 text-green-400 rounded-lg resize-y focus:outline-none focus:ring-2 focus:ring-indigo-500"
              spellCheck={false}
            />
          </Card>

          <Card className="p-4 bg-white/80 backdrop-blur-sm">
            <h3 className="font-semibold text-gray-900 mb-2">Output</h3>
            <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg min-h-[140px] max-h-[220px] overflow-y-auto font-mono text-xs whitespace-pre-wrap">
              {output}
            </pre>
          </Card>

          <Button onClick={submitSolution} className="w-full bg-gradient-to-r from-pink-600 to-rose-600">
            <CheckCircle className="w-4 h-4 mr-2" />
            Submit snapshot
          </Button>
        </div>
      </div>

      <Card className="p-6 bg-gradient-to-r from-indigo-50 to-purple-50">
        <h3 className="font-semibold text-gray-900 mb-2">How Run works</h3>
        <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
          <li>
            <strong>Java / C / C++</strong> — <code className="text-xs bg-white/80 px-1 rounded">npm run dev</code> uses
            Vite proxy to Judge0 CE. Production build: start your API server so{' '}
            <code className="text-xs bg-white/80 px-1 rounded">execute-code</code> can reach Judge0.
          </li>
          <li>
            <strong>Apex</strong> — no public compiler; Run shows how to use Salesforce / Trailhead.
          </li>
        </ul>
      </Card>
    </div>
  );
}

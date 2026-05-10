import { useState, useEffect, useMemo, useCallback } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { MessageSquare, Plus, ThumbsUp, MessageCircle, TrendingUp, Search } from 'lucide-react';
import * as session from '../utils/session';
import { buildApiUrl } from '../utils/api';
import {
  generateRanchiCommunityQuestions,
  RANCHI_QUESTION_BANK_SIZE,
  type CommunityQuestion,
} from '../data/communityRanchi';

interface CommunityProps {
  user: any;
  onShowAuth: () => void;
}

const PAGE_SIZE = 40;

function mergeByTime(api: CommunityQuestion[], ranchi: CommunityQuestion[]): CommunityQuestion[] {
  return [...api, ...ranchi].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  );
}

export function Community({ user, onShowAuth }: CommunityProps) {
  const ranchiBank = useMemo(
    () => generateRanchiCommunityQuestions(RANCHI_QUESTION_BANK_SIZE),
    [],
  );
  const [apiQuestions, setApiQuestions] = useState<CommunityQuestion[]>([]);
  const [localExtras, setLocalExtras] = useState<CommunityQuestion[]>([]);
  const [search, setSearch] = useState('');
  const [displayCount, setDisplayCount] = useState(PAGE_SIZE);
  const [showAskDialog, setShowAskDialog] = useState(false);
  const [newQuestion, setNewQuestion] = useState({ title: '', content: '', tags: '' });
  const [selectedQuestion, setSelectedQuestion] = useState<CommunityQuestion | null>(null);
  const [newAnswer, setNewAnswer] = useState('');

  const [ranchiOverrides, setRanchiOverrides] = useState<Record<string, CommunityQuestion>>({});

  const allQuestions = useMemo(() => {
    return mergeByTime([...apiQuestions, ...localExtras], ranchiBank);
  }, [apiQuestions, localExtras, ranchiBank]);

  const effectiveQuestions = useMemo(() => {
    return allQuestions.map((q) => ranchiOverrides[q.id] ?? q);
  }, [allQuestions, ranchiOverrides]);

  const filteredEff = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return effectiveQuestions;
    return effectiveQuestions.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.content.toLowerCase().includes(q) ||
        item.userName.toLowerCase().includes(q) ||
        item.tags.some((t) => t.toLowerCase().includes(q)),
    );
  }, [effectiveQuestions, search]);

  const visibleEff = useMemo(() => filteredEff.slice(0, displayCount), [filteredEff, displayCount]);

  useEffect(() => {
    setDisplayCount(PAGE_SIZE);
  }, [search]);

  const fetchQuestions = useCallback(async () => {
    try {
      const response = await fetch(buildApiUrl('community/questions'));
      const data = await response.json();
      const list = (data.questions || []) as CommunityQuestion[];
      setApiQuestions(
        list.map((q) => ({
          ...q,
          id: typeof q.id === 'string' && q.id.startsWith('question:') ? q.id.replace(/^question:/, '') : q.id,
        })),
      );
    } catch {
      setApiQuestions([]);
    }
  }, []);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const handleAskQuestion = async () => {
    if (!user) {
      onShowAuth();
      return;
    }
    const tags = newQuestion.tags.split(',').map((t) => t.trim()).filter(Boolean);
    const title = newQuestion.title;
    const content = newQuestion.content;
    const live: CommunityQuestion = {
      id: `live-${Date.now()}`,
      title,
      content,
      tags: tags.length ? tags : ['General'],
      userId: user.id ?? 'me',
      userName: user.user_metadata?.name || user.email || 'You',
      votes: 0,
      answers: [],
      timestamp: new Date().toISOString(),
    };
    setLocalExtras((prev) => [live, ...prev]);
    setShowAskDialog(false);
    setNewQuestion({ title: '', content: '', tags: '' });

    try {
      const { data: { session: s } } = await session.getSession();
      if (s?.access_token) {
        await fetch(buildApiUrl('community/question'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${s.access_token}`,
          },
          body: JSON.stringify({ title, content, tags }),
        });
        fetchQuestions();
      }
    } catch {
      /* local-only ok */
    }
  };

  const handlePostAnswer = async () => {
    if (!user || !selectedQuestion) {
      onShowAuth();
      return;
    }
    const qid = selectedQuestion.id;
    const isRanchiOrLive = qid.startsWith('ranchi-') || qid.startsWith('live-');

    const answerObj = {
      userId: user.id ?? 'me',
      userName: user.user_metadata?.name || user.email || 'You',
      answer: newAnswer,
      votes: 0,
      timestamp: new Date().toISOString(),
    };

    if (isRanchiOrLive) {
      const updater = (q: CommunityQuestion) => ({
        ...q,
        answers: [...(q.answers || []), answerObj],
      });
      if (qid.startsWith('live-')) {
        setLocalExtras((prev) => prev.map((q) => (q.id === qid ? updater(q) : q)));
      } else {
        const base = ranchiBank.find((q) => q.id === qid);
        if (base) {
          setRanchiOverrides((o) => {
            const prev = o[qid] ?? base;
            return { ...o, [qid]: updater(prev) };
          });
        }
      }
      setNewAnswer('');
      setSelectedQuestion((cur) => (cur && cur.id === qid ? updater(cur) : cur));
      return;
    }

    try {
      const { data: { session: s } } = await session.getSession();
      if (s?.access_token) {
        const questionId = String(selectedQuestion.id).startsWith('question:')
          ? selectedQuestion.id
          : `question:${selectedQuestion.id}`;
        await fetch(buildApiUrl('community/answer'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${s.access_token}`,
          },
          body: JSON.stringify({ questionId, answer: newAnswer }),
        });
        setNewAnswer('');
        fetchQuestions();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const questions = visibleEff;
  const totalCount = filteredEff.length;
  const statsBase = effectiveQuestions;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Card className="p-6 bg-white/80 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Community Q&amp;A</h2>
              <p className="text-sm text-gray-600">
                {RANCHI_QUESTION_BANK_SIZE}+ Ranchi-area college threads (demo names) — search &amp; load more
              </p>
            </div>
          </div>
          <Button onClick={() => setShowAskDialog(true)} className="bg-gradient-to-r from-teal-600 to-cyan-600">
            <Plus className="w-4 h-4 mr-2" />
            Ask Question
          </Button>
        </div>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search: college name, student, Ranchi, placement…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg">
            <TrendingUp className="w-6 h-6 text-blue-600 mb-2" />
            <div className="text-2xl font-bold text-gray-900">{statsBase.length}</div>
            <div className="text-sm text-gray-600">Questions</div>
          </div>
          <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
            <MessageCircle className="w-6 h-6 text-green-600 mb-2" />
            <div className="text-2xl font-bold text-gray-900">
              {statsBase.reduce((acc, q) => acc + (q.answers?.length || 0), 0)}
            </div>
            <div className="text-sm text-gray-600">Answers</div>
          </div>
          <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
            <ThumbsUp className="w-6 h-6 text-purple-600 mb-2" />
            <div className="text-2xl font-bold text-gray-900">
              {statsBase.reduce((acc, q) => acc + (q.votes || 0), 0)}
            </div>
            <div className="text-sm text-gray-600">Upvotes</div>
          </div>
        </div>
      </Card>

      <div className="flex items-center justify-between text-sm text-gray-600 px-1">
        <span>
          Showing {questions.length} of {totalCount}
          {search ? ' (filtered)' : ''}
        </span>
        {displayCount < totalCount && (
          <Button variant="outline" size="sm" onClick={() => setDisplayCount((c) => c + PAGE_SIZE)}>
            Load more
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {questions.map((question) => (
          <Card
            key={question.id}
            className="p-6 hover:shadow-lg transition-shadow cursor-pointer bg-white/80 backdrop-blur-sm"
            onClick={() => setSelectedQuestion(question)}
          >
            <div className="flex items-start gap-4">
              <div className="flex flex-col items-center gap-1 text-center min-w-[60px]">
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" type="button">
                  <ThumbsUp className="w-4 h-4" />
                </Button>
                <span className="font-semibold text-gray-900">{question.votes || 0}</span>
                <span className="text-xs text-gray-500">votes</span>
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{question.title}</h3>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{question.content}</p>

                <div className="flex items-center gap-4 text-sm text-gray-500 mb-3 flex-wrap">
                  <span className="font-medium text-gray-700">{question.userName || 'Anonymous'}</span>
                  <span>•</span>
                  <span>{new Date(question.timestamp).toLocaleDateString()}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <MessageCircle className="w-4 h-4" />
                    {question.answers?.length || 0} answers
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {question.tags?.map((tag: string, index: number) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {questions.length === 0 && (
        <Card className="p-8 text-center text-gray-600">No questions match your search.</Card>
      )}

      <Dialog open={showAskDialog} onOpenChange={setShowAskDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ask a Question</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Input
                placeholder="Question title..."
                value={newQuestion.title}
                onChange={(e) => setNewQuestion({ ...newQuestion, title: e.target.value })}
              />
            </div>
            <div>
              <Textarea
                placeholder="Provide details about your question..."
                value={newQuestion.content}
                onChange={(e) => setNewQuestion({ ...newQuestion, content: e.target.value })}
                rows={6}
              />
            </div>
            <div>
              <Input
                placeholder="Tags (comma-separated): placement, Ranchi, BIT"
                value={newQuestion.tags}
                onChange={(e) => setNewQuestion({ ...newQuestion, tags: e.target.value })}
              />
            </div>
            <Button onClick={handleAskQuestion} className="w-full bg-gradient-to-r from-teal-600 to-cyan-600">
              Post Question
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!selectedQuestion} onOpenChange={() => setSelectedQuestion(null)}>
        <DialogContent className="sm:max-w-3xl max-h-[80vh] overflow-y-auto">
          {selectedQuestion && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">{selectedQuestion.title}</DialogTitle>
              </DialogHeader>

              <div className="space-y-6">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-3 flex-wrap">
                    <span className="font-medium">{selectedQuestion.userName}</span>
                    <span>•</span>
                    <span>{new Date(selectedQuestion.timestamp).toLocaleString()}</span>
                  </div>
                  <p className="text-gray-700">{selectedQuestion.content}</p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {selectedQuestion.tags?.map((tag: string, index: number) => (
                      <Badge key={index} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-4">
                    {selectedQuestion.answers?.length || 0} Answers
                  </h4>
                  <div className="space-y-4">
                    {selectedQuestion.answers?.map((answer: any, index: number) => (
                      <div key={index} className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2 flex-wrap">
                          <span className="font-medium">{answer.userName}</span>
                          <span>•</span>
                          <span>{new Date(answer.timestamp).toLocaleDateString()}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <ThumbsUp className="w-3 h-3" />
                            {answer.votes || 0}
                          </span>
                        </div>
                        <p className="text-gray-700">{answer.answer}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Your Answer</h4>
                  <Textarea
                    placeholder="Share your knowledge..."
                    value={newAnswer}
                    onChange={(e) => setNewAnswer(e.target.value)}
                    rows={4}
                  />
                  <Button onClick={handlePostAnswer} className="mt-3 bg-gradient-to-r from-teal-600 to-cyan-600">
                    Post Answer
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';
import { Progress } from './ui/progress';
import { Brain, CheckCircle2, ArrowRight } from 'lucide-react';
import { buildApiUrl } from '../utils/api';
import * as session from '../utils/session';

interface AptitudeTestProps {
  user: any;
  onShowAuth: () => void;
}

export function AptitudeTest({ user, onShowAuth }: AptitudeTestProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<any>(null);

  const questions = [
    {
      id: 0,
      category: 'Mathematics',
      question: 'If x + 5 = 12, what is the value of 2x?',
      options: ['10', '12', '14', '16'],
      correct: '14'
    },
    {
      id: 1,
      category: 'Mathematics',
      question: 'What is 25% of 80?',
      options: ['15', '20', '25', '30'],
      correct: '20'
    },
    {
      id: 2,
      category: 'Logical Reasoning',
      question: 'Complete the series: 2, 6, 12, 20, __',
      options: ['28', '30', '32', '36'],
      correct: '30'
    },
    {
      id: 3,
      category: 'Logical Reasoning',
      question: 'If all cats are animals and some animals are pets, which statement is definitely true?',
      options: [
        'All cats are pets',
        'Some cats are pets',
        'All pets are cats',
        'Some animals are cats'
      ],
      correct: 'Some animals are cats'
    },
    {
      id: 4,
      category: 'Verbal Ability',
      question: 'Choose the word most similar to "Generous":',
      options: ['Selfish', 'Liberal', 'Greedy', 'Stingy'],
      correct: 'Liberal'
    },
    {
      id: 5,
      category: 'Verbal Ability',
      question: 'Find the error: "She don\'t like going to crowded places."',
      options: ['She', 'don\'t', 'going', 'No error'],
      correct: 'don\'t'
    },
    {
      id: 6,
      category: 'Analytical',
      question: 'A train travels 60 km in 1 hour. How far will it travel in 2.5 hours at the same speed?',
      options: ['120 km', '150 km', '180 km', '200 km'],
      correct: '150 km'
    },
    {
      id: 7,
      category: 'Analytical',
      question: 'If A > B and B > C, which is true?',
      options: ['C > A', 'A > C', 'B > A', 'C = A'],
      correct: 'A > C'
    }
  ];

  const handleAnswer = (value: string) => {
    setAnswers({ ...answers, [currentQuestion]: value });
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      onShowAuth();
      return;
    }

    // Calculate scores
    let mathScore = 0;
    let logicalScore = 0;
    let verbalScore = 0;
    let analyticalScore = 0;

    questions.forEach((q) => {
      if (answers[q.id] === q.correct) {
        if (q.category === 'Mathematics') mathScore += 50;
        if (q.category === 'Logical Reasoning') logicalScore += 50;
        if (q.category === 'Verbal Ability') verbalScore += 50;
        if (q.category === 'Analytical') analyticalScore += 50;
      }
    });

    const totalScore = (mathScore + logicalScore + verbalScore + analyticalScore) / 4;

    // Generate recommendations
    const recommendations = [];
    if (mathScore >= 75 && analyticalScore >= 75) {
      recommendations.push('Data Science', 'Software Engineering', 'Quantitative Analysis');
    } else if (verbalScore >= 75 && logicalScore >= 75) {
      recommendations.push('Content Strategy', 'UX Writing', 'Product Management');
    } else if (logicalScore >= 75) {
      recommendations.push('Software Development', 'Business Analysis', 'Consulting');
    } else {
      recommendations.push('Explore various fields', 'Consider skill development');
    }

    const result = {
      mathScore,
      logicalScore,
      verbalScore,
      analyticalScore,
      totalScore,
      recommendations
    };

    setResults(result);
    setShowResults(true);

    // Save to backend
    try {
      const { data: { session: s } } = await session.getSession();
      if (s?.access_token) {
        await fetch(
          buildApiUrl('aptitude-test'),
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${s.access_token}`,
            },
            body: JSON.stringify({
              answers,
              score: totalScore,
              recommendations
            }),
          }
        );
      }
    } catch (error) {
      console.error('Error saving test results:', error);
    }
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  if (showResults && results) {
    return (
      <Card className="max-w-4xl mx-auto p-8 bg-white/80 backdrop-blur-sm">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Test Completed!</h2>
          <p className="text-gray-600">Here are your results</p>
        </div>

        <div className="space-y-6">
          <div className="text-center p-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl">
            <div className="text-sm text-gray-600 mb-1">Overall Score</div>
            <div className="text-4xl font-bold text-indigo-600">{results.totalScore.toFixed(0)}%</div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Mathematics</div>
              <div className="text-2xl font-bold text-blue-600">{results.mathScore}%</div>
              <Progress value={results.mathScore} className="mt-2" />
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Logical Reasoning</div>
              <div className="text-2xl font-bold text-purple-600">{results.logicalScore}%</div>
              <Progress value={results.logicalScore} className="mt-2" />
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Verbal Ability</div>
              <div className="text-2xl font-bold text-green-600">{results.verbalScore}%</div>
              <Progress value={results.verbalScore} className="mt-2" />
            </div>
            <div className="p-4 bg-orange-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Analytical</div>
              <div className="text-2xl font-bold text-orange-600">{results.analyticalScore}%</div>
              <Progress value={results.analyticalScore} className="mt-2" />
            </div>
          </div>

          <div className="p-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl">
            <h3 className="font-semibold text-gray-900 mb-3">Recommended Career Paths</h3>
            <div className="flex flex-wrap gap-2">
              {results.recommendations.map((rec: string, index: number) => (
                <span key={index} className="px-4 py-2 bg-white rounded-full text-sm font-medium text-indigo-600">
                  {rec}
                </span>
              ))}
            </div>
          </div>

          <Button 
            onClick={() => {
              setShowResults(false);
              setCurrentQuestion(0);
              setAnswers({});
            }}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600"
          >
            Retake Test
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="max-w-4xl mx-auto p-8 bg-white/80 backdrop-blur-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
          <Brain className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Aptitude Test</h2>
          <p className="text-sm text-gray-600">Question {currentQuestion + 1} of {questions.length}</p>
        </div>
      </div>

      <Progress value={progress} className="mb-8" />

      <div className="space-y-6">
        <div>
          <div className="inline-block px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium mb-4">
            {questions[currentQuestion].category}
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-6">
            {questions[currentQuestion].question}
          </h3>
        </div>

        <RadioGroup value={answers[currentQuestion] || ''} onValueChange={handleAnswer}>
          <div className="space-y-3">
            {questions[currentQuestion].options.map((option, index) => (
              <div key={index} className="flex items-center space-x-3 p-4 rounded-lg border-2 border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors cursor-pointer">
                <RadioGroupItem value={option} id={`option-${index}`} />
                <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                  {option}
                </Label>
              </div>
            ))}
          </div>
        </RadioGroup>

        <div className="flex gap-3 pt-6">
          {currentQuestion > 0 && (
            <Button onClick={handlePrevious} variant="outline" className="flex-1">
              Previous
            </Button>
          )}
          {currentQuestion < questions.length - 1 ? (
            <Button 
              onClick={handleNext} 
              className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600"
              disabled={!answers[currentQuestion]}
            >
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button 
              onClick={handleSubmit} 
              className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600"
              disabled={Object.keys(answers).length < questions.length}
            >
              Submit Test
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}

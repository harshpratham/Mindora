import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Slider } from './ui/slider';
import { Heart, CheckCircle2 } from 'lucide-react';
import { buildApiUrl } from '../utils/api';
import * as session from '../utils/session';
//import {useNavigate} from 'react-router-dom';
//const navigate = useNavigate();
//jab test complete ho
const handleSubmit = () => {
  //score logic hamara
  navigate('/result');
};

interface PersonalityTestProps {
  user: any;
  onShowAuth: () => void;
}

export function PersonalityTest({ user, onShowAuth }: PersonalityTestProps) {
  const [responses, setResponses] = useState<Record<string, number>>({});
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<any>(null);

  const questions = [
    { id: 'q1', question: 'I enjoy meeting new people and socializing', trait: 'Extraversion' },
    { id: 'q2', question: 'I prefer working in a team rather than alone', trait: 'TeamOrientation' },
    { id: 'q3', question: 'I am organized and plan things carefully', trait: 'Conscientiousness' },
    { id: 'q4', question: 'I enjoy exploring new ideas and creative solutions', trait: 'Openness' },
    { id: 'q5', question: 'I stay calm under pressure and handle stress well', trait: 'EmotionalStability' },
    { id: 'q6', question: 'I like to take charge and lead projects', trait: 'Leadership' },
    { id: 'q7', question: 'I enjoy helping others and being supportive', trait: 'Agreeableness' },
    { id: 'q8', question: 'I think outside the box and come up with innovative ideas', trait: 'Creativity' }
  ];

  const handleSliderChange = (id: string, value: number[]) => {
    setResponses({ ...responses, [id]: value[0] });
  };

  const handleSubmit = async () => {
    if (!user) {
      onShowAuth();
      return;
    }

    // Calculate personality scores
    const scores = {
      extraversion: Math.round((responses['q1'] || 5) * 10 / 10),
      teamOrientation: Math.round((responses['q2'] || 5) * 10 / 10),
      conscientiousness: Math.round((responses['q3'] || 5) * 10 / 10),
      openness: Math.round((responses['q4'] || 5) * 10 / 10),
      emotionalStability: Math.round((responses['q5'] || 5) * 10 / 10),
      leadership: Math.round((responses['q6'] || 5) * 10 / 10),
      agreeableness: Math.round((responses['q7'] || 5) * 10 / 10),
      creativity: Math.round((responses['q8'] || 5) * 10 / 10)
    };

    // Generate personality type and recommendations
    let personalityType = '';
    const recommendations = [];

    if (scores.leadership >= 7 && scores.conscientiousness >= 7) {
      personalityType = 'The Leader';
      recommendations.push('Project Manager', 'Team Lead', 'Entrepreneur');
    } else if (scores.creativity >= 7 && scores.openness >= 7) {
      personalityType = 'The Innovator';
      recommendations.push('Product Designer', 'Creative Director', 'Research Scientist');
    } else if (scores.teamOrientation >= 7 && scores.agreeableness >= 7) {
      personalityType = 'The Collaborator';
      recommendations.push('HR Professional', 'Customer Success', 'Community Manager');
    } else if (scores.conscientiousness >= 7 && scores.emotionalStability >= 7) {
      personalityType = 'The Analyst';
      recommendations.push('Data Analyst', 'Financial Analyst', 'Quality Assurance');
    } else {
      personalityType = 'The Balanced Professional';
      recommendations.push('Business Analyst', 'Consultant', 'Operations Manager');
    }

    const result = {
      ...scores,
      personalityType,
      recommendations
    };

    setResults(result);
    setShowResults(true);

    // Save to backend
    try {
      const { data: { session: s } } = await session.getSession();
      if (s?.access_token) {
        await fetch(
          buildApiUrl('personality-test'),
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${s.access_token}`,
            },
            body: JSON.stringify(result),
          }
        );
      }
    } catch (error) {
      console.error('Error saving personality test:', error);
    }
  };

  if (showResults && results) {
    return (
      <Card className="max-w-4xl mx-auto p-8 bg-white/80 backdrop-blur-sm">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Your Personality Profile</h2>
          <p className="text-xl text-indigo-600 font-semibold">{results.personalityType}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">Extraversion</div>
            <div className="text-2xl font-bold text-blue-600">{results.extraversion}/10</div>
          </div>
          <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">Team Orientation</div>
            <div className="text-2xl font-bold text-purple-600">{results.teamOrientation}/10</div>
          </div>
          <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">Conscientiousness</div>
            <div className="text-2xl font-bold text-green-600">{results.conscientiousness}/10</div>
          </div>
          <div className="p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">Openness</div>
            <div className="text-2xl font-bold text-orange-600">{results.openness}/10</div>
          </div>
          <div className="p-4 bg-gradient-to-r from-teal-50 to-cyan-50 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">Emotional Stability</div>
            <div className="text-2xl font-bold text-teal-600">{results.emotionalStability}/10</div>
          </div>
          <div className="p-4 bg-gradient-to-r from-violet-50 to-purple-50 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">Leadership</div>
            <div className="text-2xl font-bold text-violet-600">{results.leadership}/10</div>
          </div>
          <div className="p-4 bg-gradient-to-r from-pink-50 to-rose-50 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">Agreeableness</div>
            <div className="text-2xl font-bold text-pink-600">{results.agreeableness}/10</div>
          </div>
          <div className="p-4 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">Creativity</div>
            <div className="text-2xl font-bold text-indigo-600">{results.creativity}/10</div>
          </div>
        </div>

        <div className="p-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl mb-6">
          <h3 className="font-semibold text-gray-900 mb-3">Suitable Career Paths</h3>
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
            setResponses({});
          }}
          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600"
        >
          Retake Test
        </Button>
      </Card>
    );
  }

  return (
    <Card className="max-w-4xl mx-auto p-8 bg-white/80 backdrop-blur-sm">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl flex items-center justify-center">
          <Heart className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Personality Assessment</h2>
          <p className="text-sm text-gray-600">Rate yourself on each statement (1 = Strongly Disagree, 10 = Strongly Agree)</p>
        </div>
      </div>

      <div className="space-y-8">
        {questions.map((q, index) => (
          <div key={q.id} className="space-y-3">
            <div className="flex justify-between items-start">
              <p className="text-gray-900 font-medium">{index + 1}. {q.question}</p>
              <span className="text-2xl font-bold text-indigo-600 ml-4">
                {responses[q.id] || 5}
              </span>
            </div>
            <Slider
              value={[responses[q.id] || 5]}
              onValueChange={(value) => handleSliderChange(q.id, value)}
              min={1}
              max={10}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>Strongly Disagree</span>
              <span>Neutral</span>
              <span>Strongly Agree</span>
            </div>
          </div>
        ))}
      </div>

      <Button 
        onClick={handleSubmit}
        className="w-full mt-8 bg-gradient-to-r from-pink-600 to-rose-600"
      >
        View Results
      </Button>
    </Card>
  );
}

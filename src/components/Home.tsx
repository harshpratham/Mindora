import { Button } from './ui/button';
import { Card } from './ui/card';
import { 
  Brain, 
  Users, 
  BookOpen, 
  FileText, 
  Briefcase, 
  MessageSquare,
  GraduationCap,
  Code,
  Sparkles,
  TrendingUp,
  Award,
  Target
} from 'lucide-react';

interface HomeProps {
  user: any;
  onNavigate: (tab: string) => void;
  onShowAuth: () => void;
}

export function Home({ user, onNavigate, onShowAuth }: HomeProps) {
  const features = [
    {
      icon: Brain,
      title: 'Aptitude Test',
      description: 'Take comprehensive tests to discover your strengths',
      action: 'aptitude',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Users,
      title: 'Career Counselors',
      description: 'Connect with industry experts from top companies',
      action: 'counselors',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: FileText,
      title: 'Resume Builder',
      description: 'Create ATS-optimized resumes with AI assistance',
      action: 'resume',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: BookOpen,
      title: 'English Preparation',
      description: 'Voice chat, grammar games, and writing practice',
      action: 'english',
      color: 'from-orange-500 to-red-500'
    },
    {
      icon: Briefcase,
      title: 'Job Tracker',
      description: 'Track applications and never miss opportunities',
      action: 'jobs',
      color: 'from-indigo-500 to-blue-500'
    },
    {
      icon: MessageSquare,
      title: 'Community Q&A',
      description: 'Learn from peers and share experiences',
      action: 'community',
      color: 'from-teal-500 to-cyan-500'
    },
    {
      icon: GraduationCap,
      title: 'College Search',
      description: 'Find the best colleges for your career path',
      action: 'colleges',
      color: 'from-violet-500 to-purple-500'
    },
    {
      icon: Code,
      title: 'Coding Practice',
      description: 'Daily DSA questions for placement preparation',
      action: 'coding',
      color: 'from-pink-500 to-rose-500'
    }
  ];

  const stats = [
    { label: 'Career Paths', value: '50+', icon: Target },
    { label: 'Expert Counselors', value: '100+', icon: Users },
    { label: 'Success Stories', value: '10K+', icon: Award },
    { label: 'Job Opportunities', value: '500+', icon: TrendingUp }
  ];

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white p-8 md:p-12">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10 max-w-3xl">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-6 h-6" />
            <span className="text-sm font-semibold uppercase tracking-wide">AI-Powered Platform</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Your Journey to the Perfect Career Starts Here
          </h2>
          <p className="text-lg md:text-xl text-white/90 mb-6">
            Mindora uses advanced AI to analyze your aptitude, personality, and aspirations to recommend 
            personalized career paths tailored just for you.
          </p>
          {!user ? (
            <Button 
              onClick={onShowAuth}
              size="lg" 
              className="bg-white text-indigo-600 hover:bg-gray-100"
            >
              Get Started Free
            </Button>
          ) : (
            <Button 
              onClick={() => onNavigate('aptitude')}
              size="lg" 
              className="bg-white text-indigo-600 hover:bg-gray-100"
            >
              Take Aptitude Test
            </Button>
          )}
        </div>
        <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute left-0 bottom-0 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className="p-6 text-center bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <stat.icon className="w-8 h-8 mx-auto mb-2 text-indigo-600" />
            <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
            <div className="text-sm text-gray-600">{stat.label}</div>
          </Card>
        ))}
      </div>

      {/* Features */}
      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-6">Explore Our Features</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="p-6 hover:shadow-xl transition-all cursor-pointer group bg-white/80 backdrop-blur-sm border-0"
              onClick={() => onNavigate(feature.action)}
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">{feature.title}</h4>
              <p className="text-sm text-gray-600">{feature.description}</p>
            </Card>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <Card className="p-8 bg-gradient-to-r from-indigo-50 to-purple-50 border-0">
        <div className="max-w-2xl mx-auto text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            Ready to Find Your Perfect Career Path?
          </h3>
          <p className="text-gray-600 mb-6">
            Join thousands of students and professionals who have found their dream careers with Mindora's AI-powered guidance.
          </p>
          {!user ? (
            <Button 
              onClick={onShowAuth}
              size="lg" 
              className="bg-gradient-to-r from-indigo-600 to-purple-600"
            >
              Start Your Journey
            </Button>
          ) : (
            <div className="flex gap-3 justify-center">
              <Button 
                onClick={() => onNavigate('aptitude')}
                size="lg" 
                className="bg-gradient-to-r from-indigo-600 to-purple-600"
              >
                Take Assessment
              </Button>
              <Button 
                onClick={() => onNavigate('counselors')}
                size="lg" 
                variant="outline"
              >
                Find Counselor
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

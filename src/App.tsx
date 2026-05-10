import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Button } from './components/ui/button';
import { Home } from './components/Home';
import { AptitudeTest } from './components/AptitudeTest';
import { PersonalityTest } from './components/PersonalityTest';
import { Counselors } from './components/Counselors';
import { EnglishPrep } from './components/EnglishPrep';
import { ResumeBuilder } from './components/ResumeBuilder';
import { JobTracker } from './components/JobTracker';
import { Community } from './components/Community';
import { CollegeSearch } from './components/CollegeSearch';
import { CodingIDE } from './components/CodingIDE';
import { JobPostings } from './components/JobPostings';
import { AuthModal } from './components/AuthModal';
import * as session from './utils/session';
import { LogIn, UserCircle } from 'lucide-react';
// import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';

import home from './components/pages/home.tsx';
import Dashboard from './components/pages/Dashboard';
import Result from './components/pages/Result';
import Test from './components/pages/Test'; 

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { session: s } } = await session.getSession();
      if (s?.user) {
        setUser(s.user);
      }
    } catch (error) {
      console.log('Error checking user session:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await session.signOut();
    setUser(null);
    setActiveTab('home');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Mindora...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">M</span>
              </div>
              <div>
                <h1 className="font-bold text-2xl bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Mindora
                </h1>
                <p className="text-xs text-gray-600">AI-Powered Career Guidance</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {user ? (
                <>
                  <div className="flex items-center gap-2 bg-indigo-50 px-4 py-2 rounded-lg">
                    <UserCircle className="w-5 h-5 text-indigo-600" />
                    <span className="text-sm font-medium text-gray-700">
                      {user.user_metadata?.name || user.email}
                    </span>
                  </div>
                  <Button onClick={handleSignOut} variant="outline" size="sm">
                    Sign Out
                  </Button>
                </>
              ) : (
                <Button onClick={() => setShowAuthModal(true)} className="bg-gradient-to-r from-indigo-600 to-purple-600">
                  <LogIn className="w-4 h-4 mr-2" />
                  Sign In
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full overflow-x-auto bg-white shadow-md rounded-lg p-2 sticky top-16 z-40">
            <TabsTrigger value="home"  className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white px-4 py-2 rounded-lg">Home</TabsTrigger>
            <TabsTrigger value="aptitude"  className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white px-4 py-2 rounded-lg">Aptitude Test</TabsTrigger>
            <TabsTrigger value="personality"  className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white px-4 py-2 rounded-lg">Personality</TabsTrigger>
            <TabsTrigger value="counselors"  className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white px-4 py-2 rounded-lg">Career Counselors</TabsTrigger>
            <TabsTrigger value="english"  className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white px-4 py-2 rounded-lg">English Prep</TabsTrigger>
            <TabsTrigger value="resume"  className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white px-4 py-2 rounded-lg">Resume Builder</TabsTrigger>
            <TabsTrigger value="jobs"  className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white px-4 py-2 rounded-lg">Job Tracker</TabsTrigger>
            <TabsTrigger value="community"  className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white px-4 py-2 rounded-lg">Community</TabsTrigger>
            <TabsTrigger value="colleges"  className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white px-4 py-2 rounded-lg">Colleges</TabsTrigger>
            <TabsTrigger value="coding"  className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white px-4 py-2 rounded-lg">Coding IDE</TabsTrigger>
            <TabsTrigger value="postings"  className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white px-4 py-2 rounded-lg">Job Postings</TabsTrigger>
          </TabsList>

          <TabsContent value="home">
            <Home user={user} onNavigate={setActiveTab} onShowAuth={() => setShowAuthModal(true)} />
          </TabsContent>

          <TabsContent value="aptitude">
            <AptitudeTest user={user} onShowAuth={() => setShowAuthModal(true)} />
          </TabsContent>

          <TabsContent value="personality">
            <PersonalityTest user={user} onShowAuth={() => setShowAuthModal(true)} />
          </TabsContent>

          <TabsContent value="counselors">
            <Counselors user={user} onShowAuth={() => setShowAuthModal(true)} />
          </TabsContent>

          <TabsContent value="english">
            <EnglishPrep user={user} onShowAuth={() => setShowAuthModal(true)} />
          </TabsContent>

          <TabsContent value="resume">
            <ResumeBuilder user={user} onShowAuth={() => setShowAuthModal(true)} />
          </TabsContent>

          <TabsContent value="jobs">
            <JobTracker user={user} onShowAuth={() => setShowAuthModal(true)} />
          </TabsContent>

          <TabsContent value="community">
            <Community user={user} onShowAuth={() => setShowAuthModal(true)} />
          </TabsContent>

          <TabsContent value="colleges">
            <CollegeSearch user={user} />
          </TabsContent>

          <TabsContent value="coding">
            <CodingIDE user={user} onShowAuth={() => setShowAuthModal(true)} />
          </TabsContent>

          <TabsContent value="postings">
            <JobPostings />
          </TabsContent>
        </Tabs>
      </div>

      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)}
        onSuccess={(user) => {
          setUser(user);
          setShowAuthModal(false);
        }}
      />
    </div>
  );
}
import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { BookOpen, Mic, Gamepad2, PenTool, Volume2 } from 'lucide-react';

interface EnglishPrepProps {
  user: any;
  onShowAuth: () => void;
}

export function EnglishPrep({ user, onShowAuth }: EnglishPrepProps) {
  const [voiceInput, setVoiceInput] = useState('');
  const [conversation, setConversation] = useState<Array<{role: string, text: string}>>([
    { role: 'assistant', text: 'Hello! I\'m your English practice partner. Let\'s have a conversation! What would you like to talk about today?' }
  ]);
  const [gameScore, setGameScore] = useState(0);
  const [currentFillBlank, setCurrentFillBlank] = useState(0);

  const fillInBlanks = [
    { sentence: 'I ___ to the market yesterday.', answer: 'went', options: ['go', 'went', 'gone', 'going'] },
    { sentence: 'She ___ been studying for three hours.', answer: 'has', options: ['have', 'has', 'had', 'is'] },
    { sentence: 'They ___ playing cricket when it started raining.', answer: 'were', options: ['was', 'were', 'are', 'is'] },
  ];

  const wordGames = [
    { word: 'BEAUTIFUL', scrambled: 'UFLETIUAB', hint: 'Synonym of pretty' },
    { word: 'EXCELLENT', scrambled: 'LLXENECTE', hint: 'Very good' },
    { word: 'ACHIEVE', scrambled: 'VHEACIE', hint: 'To accomplish a goal' },
  ];

  const handleVoiceChat = () => {
    if (!voiceInput.trim()) return;
    
    const newConversation = [
      ...conversation,
      { role: 'user', text: voiceInput },
      { role: 'assistant', text: `That's interesting! You said: "${voiceInput}". Let me help you improve. Try speaking more clearly and using complete sentences. Would you like to discuss anything else?` }
    ];
    setConversation(newConversation);
    setVoiceInput('');
  };

  const handleFillBlank = (answer: string) => {
    if (answer === fillInBlanks[currentFillBlank].answer) {
      setGameScore(gameScore + 10);
      if (currentFillBlank < fillInBlanks.length - 1) {
        setCurrentFillBlank(currentFillBlank + 1);
      } else {
        setCurrentFillBlank(0);
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <Card className="p-6 mb-6 bg-white/80 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">English Preparation</h2>
            <p className="text-sm text-gray-600">Improve your English with interactive practice</p>
          </div>
        </div>
      </Card>

      <Tabs defaultValue="voice" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-white/80">
          <TabsTrigger value="voice">
            <Mic className="w-4 h-4 mr-2" />
            Voice Chat
          </TabsTrigger>
          <TabsTrigger value="grammar">
            <PenTool className="w-4 h-4 mr-2" />
            Grammar
          </TabsTrigger>
          <TabsTrigger value="games">
            <Gamepad2 className="w-4 h-4 mr-2" />
            Word Games
          </TabsTrigger>
          <TabsTrigger value="writing">
            <PenTool className="w-4 h-4 mr-2" />
            Writing
          </TabsTrigger>
        </TabsList>

        <TabsContent value="voice">
          <Card className="p-6 bg-white/80 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-4">
              <Volume2 className="w-5 h-5 text-orange-600" />
              <h3 className="font-semibold text-gray-900">Voice Conversation Practice</h3>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-4 h-96 overflow-y-auto space-y-3">
              {conversation.map((msg, index) => (
                <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] rounded-lg p-3 ${
                    msg.role === 'user' 
                      ? 'bg-indigo-600 text-white' 
                      : 'bg-white border border-gray-200 text-gray-900'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <Input
                placeholder="Type your message here... (Voice input coming soon)"
                value={voiceInput}
                onChange={(e) => setVoiceInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleVoiceChat()}
              />
              <Button onClick={handleVoiceChat} className="bg-gradient-to-r from-orange-600 to-red-600">
                Send
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              💡 Tip: Practice speaking complete sentences and use proper grammar
            </p>
          </Card>
        </TabsContent>

        <TabsContent value="grammar">
          <Card className="p-6 bg-white/80 backdrop-blur-sm">
            <h3 className="font-semibold text-gray-900 mb-4">Fill in the Blanks</h3>
            <div className="space-y-6">
              <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg">
                <p className="text-lg text-gray-900 mb-4">
                  {fillInBlanks[currentFillBlank].sentence}
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {fillInBlanks[currentFillBlank].options.map((option, index) => (
                    <Button
                      key={index}
                      onClick={() => handleFillBlank(option)}
                      variant="outline"
                      className="hover:bg-indigo-50"
                    >
                      {option}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-indigo-600">Score: {gameScore}</p>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="games">
          <Card className="p-6 bg-white/80 backdrop-blur-sm">
            <h3 className="font-semibold text-gray-900 mb-4">Word Scramble Game</h3>
            <div className="space-y-6">
              {wordGames.map((game, index) => (
                <div key={index} className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
                  <div className="text-center mb-4">
                    <p className="text-sm text-gray-600 mb-2">Hint: {game.hint}</p>
                    <p className="text-3xl font-bold tracking-widest text-indigo-600 mb-4">
                      {game.scrambled}
                    </p>
                  </div>
                  <Input 
                    placeholder="Unscramble the word..." 
                    className="text-center"
                  />
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    Try to rearrange the letters to form a meaningful word!
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="writing">
          <Card className="p-6 bg-white/80 backdrop-blur-sm">
            <h3 className="font-semibold text-gray-900 mb-4">Writing Practice</h3>
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Today's Topic</h4>
                <p className="text-gray-700 mb-4">
                  "Write about your career aspirations and why you chose this field. (150-200 words)"
                </p>
                <textarea
                  className="w-full h-48 p-3 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Start writing here..."
                />
              </div>
              <Button className="w-full bg-gradient-to-r from-green-600 to-emerald-600">
                Submit for Review
              </Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

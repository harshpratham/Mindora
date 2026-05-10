import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import * as session from '../utils/session';
import { LogIn, UserPlus } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: any) => void;
}

export function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  if(!isOpen){
    console.log("Auth model closed");
  }
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [captcha,setCaptcha] = useState(Math.floor(1000 + Math.random() * 9000));
  const [captchaInput, setCaptchaInput] = useState('');

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    if(captchaInput != captcha.toString()){
      setError('Captcha is incorrect');
      setLoading(false);
      return;
    }

    try {
      const s = await session.signInWithPassword(email, password);
      alert('Sign in successful!');
      onSuccess(s.user);
    } catch (err: any) {
      console.error('Sign in error:', err);
      setError(err.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    // Password validation
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;

    if (!passwordRegex.test(password)) {
      setError('Password must contain uppercase, lowercase and number');
      setLoading(false);
      return;
    }

    try {
      const s = await session.signUp(email, password, name);
      alert('Signup successful 🎉');
      onSuccess(s.user);
    } catch (err: any) {
      console.error('Sign up error:', err);
      setError(err.message || 'Failed to sign up');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Welcome to Mindora
          </DialogTitle>
        </DialogHeader>

        <Tabs value={isSignUp ? 'signup' : 'signin'} onValueChange={(v) => setIsSignUp(v === 'signup')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value="signin">
            <form onSubmit={handleSignIn} className="space-y-4 mt-4">
              <div>
                <Label htmlFor="signin-email">Email</Label>
                <Input
                  id="signin-email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="signin-password">Password</Label>
                <Input
                  id="signin-password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <div>
                  <Label>Captcha Code: {captcha}</Label>
                  <Input
                    type="text"
                    placeholder="Enter captcha code"
                    value={captchaInput}
                    onChange={(e) => setCaptchaInput(e.target.value)}
                    required
                  />
                </div>
                <Button
                type="button"
                varient="outline"
                onClick={() => setCaptcha(Math.floor(1000 + Math.random() * 9000))}
                >
                  Refresh Captcha 
                
                </Button>
              </div>
              {error && (
                <p className="text-sm text-red-600">{error}</p>
              )}
              <Button type="submit" className="w-full bg-gradient-to-r from-indigo-600 to-purple-600" disabled={loading}>
                <LogIn className="w-4 h-4 mr-2" />
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="signup">
            <form onSubmit={handleSignUp} className="space-y-4 mt-4">
              <div>
                <Label htmlFor="signup-name">Full Name</Label>
                <Input
                  id="signup-name"
                  type="text"
                  placeholder="Your Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="signup-email">Email</Label>
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="signup-password">Password</Label>
                <Input
                  id="signup-password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
                <p className="text-xs text-gray-500">
Password must contain uppercase, lowercase and number
</p>

              </div>
              {error && (
                <p className="text-sm text-red-600">{error}</p>
              )}
              <Button type="submit" className="w-full bg-gradient-to-r from-indigo-600 to-purple-600" disabled={loading}>
                <UserPlus className="w-4 h-4 mr-2" />
                {loading ? 'Creating account...' : 'Create Account'}
              </Button>
              <Button
              type="button"
              varient="link"
              onClick={() => {
                if (!email) {
                  setError('Enter email first');
                  return;
                }
                alert(
                  'Password reset by email is not configured for this self-hosted setup. Reset the password directly in the database or ask an administrator.',
                );
              }}
                 >
                  Forget Password?
                 </Button>
                
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
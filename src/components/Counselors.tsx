import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Users, Star, MapPin, Briefcase, Search, ExternalLink, CheckCircle } from 'lucide-react';
import { buildApiUrl } from '../utils/api';
import * as session from '../utils/session';

interface CounselorsProps {
  user: any;
  onShowAuth: () => void;
}

export function Counselors({ user, onShowAuth }: CounselorsProps) {
  const [counselors, setCounselors] = useState<any[]>([]);
  const [filteredCounselors, setFilteredCounselors] = useState<any[]>([]);
  const [searchField, setSearchField] = useState('');
  const [selectedCounselor, setSelectedCounselor] = useState<any>(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCounselors();
  }, []);

  useEffect(() => {
    if (searchField) {
      const filtered = counselors.filter(c => 
        c.field?.toLowerCase().includes(searchField.toLowerCase()) ||
        c.name?.toLowerCase().includes(searchField.toLowerCase())
      );
      setFilteredCounselors(filtered);
    } else {
      setFilteredCounselors(counselors);
    }
  }, [searchField, counselors]);

  const fetchCounselors = async () => {
    try {
      const response = await fetch(buildApiUrl('counselors'));
      const data = await response.json();
      setCounselors(data.counselors || []);
      setFilteredCounselors(data.counselors || []);
    } catch (error) {
      console.error('Error fetching counselors:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookSession = async (counselor: any) => {
    if (!user) {
      onShowAuth();
      return;
    }

    try {
      const { data: { session: s } } = await session.getSession();
      if (s?.access_token) {
        await fetch(
          buildApiUrl('book-counselor'),
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${s.access_token}`,
            },
            body: JSON.stringify({
              counselorId: counselor.id,
              counselorName: counselor.name,
              timestamp: new Date().toISOString()
            }),
          }
        );
        setBookingSuccess(true);
        setTimeout(() => {
          setSelectedCounselor(null);
          setBookingSuccess(false);
        }, 2000);
      }
    } catch (error) {
      console.error('Error booking session:', error);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto text-center py-12">
        <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Loading counselors...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Card className="p-6 bg-white/80 backdrop-blur-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Career Counselors</h2>
            <p className="text-sm text-gray-600">Connect with industry experts from top companies</p>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            placeholder="Search by field (e.g., Data Science, Software Engineering)"
            value={searchField}
            onChange={(e) => setSearchField(e.target.value)}
            className="pl-10"
          />
        </div>
      </Card>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCounselors.map((counselor) => (
          <Card key={counselor.id} className="p-6 hover:shadow-xl transition-shadow bg-white/80 backdrop-blur-sm">
            <div className="flex items-start gap-4 mb-4">
              <Avatar className="w-16 h-16">
                <AvatarImage src={counselor.image} alt={counselor.name} />
                <AvatarFallback>{counselor.name?.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900">{counselor.name}</h3>
                <p className="text-sm text-gray-600">{counselor.position}</p>
                <div className="flex items-center gap-1 mt-1">
                  {counselor.availability === 'online' ? (
                    <Badge className="bg-green-100 text-green-700">Online</Badge>
                  ) : (
                    <Badge variant="secondary">Offline</Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Briefcase className="w-4 h-4" />
                <span>{counselor.company} • {counselor.experience}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="w-4 h-4" />
                <span>{counselor.field}</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold text-gray-900">{counselor.rating}</span>
                <span className="text-sm text-gray-600">({counselor.reviews} reviews)</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-1 mb-4">
              {counselor.expertise?.slice(0, 3).map((skill: string, index: number) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {skill}
                </Badge>
              ))}
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
              <span className="font-bold text-indigo-600">{counselor.hourlyRate}/hr</span>
              <Button 
                onClick={() => setSelectedCounselor(counselor)}
                size="sm"
                className="bg-gradient-to-r from-purple-600 to-pink-600"
              >
                View Profile
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Counselor Detail Modal */}
      <Dialog open={!!selectedCounselor} onOpenChange={() => setSelectedCounselor(null)}>
        <DialogContent className="sm:max-w-2xl">
          {selectedCounselor && (
            <>
              {bookingSuccess ? (
                <div className="text-center py-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Session Booked!</h3>
                  <p className="text-gray-600">You will receive a confirmation email shortly</p>
                </div>
              ) : (
                <>
                  <DialogHeader>
                    <DialogTitle className="text-2xl">Counselor Profile</DialogTitle>
                  </DialogHeader>

                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <Avatar className="w-20 h-20">
                        <AvatarImage src={selectedCounselor.image} alt={selectedCounselor.name} />
                        <AvatarFallback>{selectedCounselor.name?.slice(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900">{selectedCounselor.name}</h3>
                        <p className="text-gray-600">{selectedCounselor.position}</p>
                        <p className="text-sm text-gray-500">{selectedCounselor.company} • {selectedCounselor.experience}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                          <span className="font-semibold">{selectedCounselor.rating}</span>
                          <span className="text-sm text-gray-600">({selectedCounselor.reviews} reviews)</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">About</h4>
                      <p className="text-gray-600">{selectedCounselor.bio}</p>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Expertise</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedCounselor.expertise?.map((skill: string, index: number) => (
                          <Badge key={index} variant="secondary">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Field</h4>
                      <p className="text-gray-600">{selectedCounselor.field}</p>
                    </div>

                    {selectedCounselor.linkedIn && (
                      <div className="space-y-1">
                        {selectedCounselor.linkedInVanity && (
                          <p className="text-sm text-gray-500">
                            LinkedIn:{' '}
                            <span className="font-mono text-gray-700">
                              /in/{String(selectedCounselor.linkedInVanity)}
                            </span>
                          </p>
                        )}
                        <a
                          href={selectedCounselor.linkedIn}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700"
                        >
                          <ExternalLink className="w-4 h-4" />
                          View LinkedIn Profile
                        </a>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-4 border-t">
                      <div>
                        <p className="text-sm text-gray-600">Session Rate</p>
                        <p className="text-2xl font-bold text-indigo-600">{selectedCounselor.hourlyRate}/hr</p>
                      </div>
                      <Button 
                        onClick={() => handleBookSession(selectedCounselor)}
                        className="bg-gradient-to-r from-purple-600 to-pink-600"
                        disabled={selectedCounselor.availability === 'offline'}
                      >
                        {selectedCounselor.availability === 'online' ? 'Book Session' : 'Unavailable'}
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

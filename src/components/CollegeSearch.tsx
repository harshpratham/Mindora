import { useState, useEffect, useMemo } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { GraduationCap, Search, MapPin, DollarSign, TrendingUp, Star } from 'lucide-react';
import { getSortedLocalColleges, type CollegeRecord } from '../data/colleges';

interface CollegeSearchProps {
  user: any;
}

export function CollegeSearch({ user: _user }: CollegeSearchProps) {
  const colleges = useMemo(() => getSortedLocalColleges(), []);
  const [filteredColleges, setFilteredColleges] = useState<CollegeRecord[]>(colleges);
  const [searchField, setSearchField] = useState('');

  useEffect(() => {
    if (!searchField.trim()) {
      setFilteredColleges(colleges);
      return;
    }
    const q = searchField.toLowerCase();
    const filtered = colleges.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.location.toLowerCase().includes(q) ||
        c.programs.some((p) => p.toLowerCase().includes(q)),
    );
    setFilteredColleges(filtered);
  }, [searchField, colleges]);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Card className="p-6 bg-white/80 backdrop-blur-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-500 rounded-xl flex items-center justify-center">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">College Search</h2>
            <p className="text-sm text-gray-600">
              Top B.Tech & engineering institutes in India — campus photos (Unsplash). Connect API later for live data.
            </p>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            placeholder="Search by college, city, or program (e.g. Computer Science, IIT, NIT)"
            value={searchField}
            onChange={(e) => setSearchField(e.target.value)}
            className="pl-10"
          />
        </div>
      </Card>

      <div className="space-y-6">
        {filteredColleges.map((college) => (
          <Card
            key={college.id}
            className={`overflow-hidden hover:shadow-xl transition-shadow bg-white/80 backdrop-blur-sm ${
              college.featured ? 'ring-2 ring-yellow-400' : ''
            }`}
          >
            {college.featured && (
              <div className="bg-gradient-to-r from-yellow-400 to-orange-400 px-4 py-2 flex items-center gap-2">
                <Star className="w-4 h-4 text-white" />
                <span className="text-sm font-semibold text-white">Featured — strong B.Tech & placements</span>
              </div>
            )}

            <div className="flex flex-col md:flex-row gap-6 p-6">
              <div className="md:w-1/3">
                <img
                  src={college.image}
                  alt={`${college.name} campus`}
                  className="w-full h-48 object-cover rounded-lg bg-gray-100"
                  loading="lazy"
                />
              </div>

              <div className="flex-1">
                <div className="flex items-start justify-between mb-3 flex-wrap gap-2">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">{college.name}</h3>
                    <div className="flex items-center gap-2 text-gray-600 mt-1">
                      <MapPin className="w-4 h-4 shrink-0" />
                      <span className="text-sm">{college.location}</span>
                    </div>
                  </div>
                  <Badge className="bg-indigo-100 text-indigo-700">Rank #{college.ranking}</Badge>
                </div>

                <p className="text-gray-600 mb-4 text-sm leading-relaxed">{college.description}</p>

                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign className="w-4 h-4 text-green-600 shrink-0" />
                    <span className="font-medium">Fees:</span>
                    <span className="text-gray-700">{college.fees}</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <TrendingUp className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <span className="font-medium text-gray-800">{college.placement}</span>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Programs (B.Tech / related)</p>
                  <div className="flex flex-wrap gap-2">
                    {college.programs.map((program, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {program}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="mt-4 flex gap-3">
                  <Button className="bg-gradient-to-r from-violet-600 to-purple-600">View brochure</Button>
                  <Button variant="outline">Compare</Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredColleges.length === 0 && (
        <Card className="p-12 text-center bg-white/80 backdrop-blur-sm">
          <GraduationCap className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-600">No colleges match &quot;{searchField}&quot;. Try IIT, NIT, CS, or a city name.</p>
        </Card>
      )}
    </div>
  );
}

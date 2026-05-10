import { useMemo } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Briefcase, MapPin, Clock, DollarSign, ExternalLink, Building2 } from 'lucide-react';
import { getSortedLocalJobPostings } from '../data/jobPostings';

export function JobPostings() {
  const postings = useMemo(() => getSortedLocalJobPostings(), []);

  const getJobTypeColor = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'full-time':
        return 'bg-green-100 text-green-700';
      case 'internship':
        return 'bg-blue-100 text-blue-700';
      case 'contract':
        return 'bg-orange-100 text-orange-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getExperienceColor = (exp: string) => {
    if (exp?.includes('0')) return 'bg-purple-100 text-purple-700';
    return 'bg-indigo-100 text-indigo-700';
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Card className="p-6 bg-white/80 backdrop-blur-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
            <Briefcase className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Job Postings</h2>
            <p className="text-sm text-gray-600">Sample listings (frontend) — connect API when backend is ready</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{postings.length}</div>
            <div className="text-sm text-gray-600">Active Postings</div>
          </div>
          <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {postings.filter((p) => p.type === 'Full-time').length}
            </div>
            <div className="text-sm text-gray-600">Full-time Jobs</div>
          </div>
          <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {postings.filter((p) => p.type === 'Internship').length}
            </div>
            <div className="text-sm text-gray-600">Internships</div>
          </div>
          <div className="p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">
              {postings.filter((p) => p.experience?.includes('0')).length}
            </div>
            <div className="text-sm text-gray-600">Freshers</div>
          </div>
        </div>
      </Card>

      <div className="space-y-4">
        {postings.map((job, index) => (
          <Card key={job.id || index} className="p-6 hover:shadow-lg transition-shadow bg-white/80 backdrop-blur-sm">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
                  <Building2 className="w-8 h-8 text-white" />
                </div>
              </div>

              <div className="flex-1">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{job.title}</h3>
                    <p className="text-lg text-gray-700">{job.company}</p>
                  </div>
                  <div className="flex gap-2">
                    <Badge className={getJobTypeColor(job.type)}>{job.type}</Badge>
                    <Badge className={getExperienceColor(job.experience)}>{job.experience}</Badge>
                  </div>
                </div>

                <p className="text-gray-600 mb-4">{job.description}</p>

                <div className="grid md:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>{job.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <DollarSign className="w-4 h-4" />
                    <span>{job.salary}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>Posted {new Date(job.postedDate).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Required Skills:</p>
                  <div className="flex flex-wrap gap-2">
                    {job.skills?.map((skill: string, idx: number) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3">
                  {job.applyLink ? (
                    <Button className="bg-gradient-to-r from-indigo-600 to-purple-600" asChild>
                      <a href={job.applyLink} target="_blank" rel="noopener noreferrer">
                        Apply Now
                      </a>
                    </Button>
                  ) : (
                    <Button className="bg-gradient-to-r from-indigo-600 to-purple-600" disabled>
                      Apply Now
                    </Button>
                  )}
                  {job.applyLink && (
                    <Button variant="outline" asChild>
                      <a
                        href={job.applyLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2"
                      >
                        <ExternalLink className="w-4 h-4" />
                        View Details
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {postings.length === 0 && (
        <Card className="p-12 text-center bg-white/80 backdrop-blur-sm">
          <Briefcase className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Job Postings Yet</h3>
          <p className="text-gray-600">Add entries in src/data/jobPostings.ts</p>
        </Card>
      )}
    </div>
  );
}

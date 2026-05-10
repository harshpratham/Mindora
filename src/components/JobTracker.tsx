import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Briefcase, Plus, Mail, ExternalLink } from 'lucide-react';
import { buildApiUrl } from '../utils/api';
import * as session from '../utils/session';

interface JobTrackerProps {
  user: any;
  onShowAuth: () => void;
}

export function JobTracker({ user, onShowAuth }: JobTrackerProps) {
  const [jobs, setJobs] = useState<any[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newJob, setNewJob] = useState({
    company: '',
    position: '',
    appliedDate: '',
    status: 'applied',
    jobLink: '',
    notes: ''
  });

  useEffect(() => {
    if (user) {
      fetchJobs();
    }
  }, [user]);

  const fetchJobs = async () => {
    try {
      const { data: { session: s } } = await session.getSession();
      if (s?.access_token) {
        const response = await fetch(
          buildApiUrl('tracked-jobs'),
          {
            headers: {
              'Authorization': `Bearer ${s.access_token}`,
            },
          }
        );
        const data = await response.json();
        setJobs(data.jobs || []);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
    }
  };

  const handleAddJob = async () => {
    if (!user) {
      onShowAuth();
      return;
    }

    try {
      const { data: { session: s } } = await session.getSession();
      if (s?.access_token) {
        await fetch(
          buildApiUrl('track-job'),
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${s.access_token}`,
            },
            body: JSON.stringify(newJob),
          }
        );
        setShowAddDialog(false);
        setNewJob({ company: '', position: '', appliedDate: '', status: 'applied', jobLink: '', notes: '' });
        fetchJobs();
      }
    } catch (error) {
      console.error('Error adding job:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'applied': return 'bg-blue-100 text-blue-700';
      case 'interview': return 'bg-yellow-100 text-yellow-700';
      case 'offer': return 'bg-green-100 text-green-700';
      case 'rejected': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (!user) {
    return (
      <Card className="max-w-4xl mx-auto p-12 text-center bg-white/80 backdrop-blur-sm">
        <Briefcase className="w-16 h-16 mx-auto mb-4 text-gray-400" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Sign In Required</h3>
        <p className="text-gray-600 mb-6">Please sign in to track your job applications</p>
        <Button onClick={onShowAuth} className="bg-gradient-to-r from-indigo-600 to-purple-600">
          Sign In
        </Button>
      </Card>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Card className="p-6 bg-white/80 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-xl flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Job Application Tracker</h2>
              <p className="text-sm text-gray-600">Never miss an important job update</p>
            </div>
          </div>
          <Button onClick={() => setShowAddDialog(true)} className="bg-gradient-to-r from-indigo-600 to-purple-600">
            <Plus className="w-4 h-4 mr-2" />
            Add Application
          </Button>
        </div>

        <div className="p-4 bg-blue-50 rounded-lg mb-6">
          <div className="flex items-start gap-3">
            <Mail className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Smart Email Filtering</h3>
              <p className="text-sm text-gray-600">
                Mindora automatically filters job-related emails to your dashboard, so you never miss important updates 
                like interview invitations or offer letters.
              </p>
            </div>
          </div>
        </div>
      </Card>

      {jobs.length === 0 ? (
        <Card className="p-12 text-center bg-white/80 backdrop-blur-sm">
          <Briefcase className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Applications Yet</h3>
          <p className="text-gray-600 mb-4">Start tracking your job applications to stay organized</p>
          <Button onClick={() => setShowAddDialog(true)} variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Add Your First Application
          </Button>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job, index) => (
            <Card key={index} className="p-6 hover:shadow-lg transition-shadow bg-white/80 backdrop-blur-sm">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-bold text-gray-900">{job.position}</h3>
                  <p className="text-sm text-gray-600">{job.company}</p>
                </div>
                <Badge className={getStatusColor(job.status)}>
                  {job.status}
                </Badge>
              </div>
              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <p>Applied: {new Date(job.appliedDate || job.timestamp).toLocaleDateString()}</p>
                {job.notes && <p className="italic">"{job.notes}"</p>}
              </div>
              {job.jobLink && (
                <a 
                  href={job.jobLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700"
                >
                  <ExternalLink className="w-4 h-4" />
                  View Job Posting
                </a>
              )}
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Job Application</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="company">Company Name *</Label>
              <Input
                id="company"
                value={newJob.company}
                onChange={(e) => setNewJob({...newJob, company: e.target.value})}
                placeholder="e.g., Google"
              />
            </div>
            <div>
              <Label htmlFor="position">Position *</Label>
              <Input
                id="position"
                value={newJob.position}
                onChange={(e) => setNewJob({...newJob, position: e.target.value})}
                placeholder="e.g., Software Engineer"
              />
            </div>
            <div>
              <Label htmlFor="appliedDate">Applied Date</Label>
              <Input
                id="appliedDate"
                type="date"
                value={newJob.appliedDate}
                onChange={(e) => setNewJob({...newJob, appliedDate: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="jobLink">Job Posting Link</Label>
              <Input
                id="jobLink"
                value={newJob.jobLink}
                onChange={(e) => setNewJob({...newJob, jobLink: e.target.value})}
                placeholder="https://..."
              />
            </div>
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Input
                id="notes"
                value={newJob.notes}
                onChange={(e) => setNewJob({...newJob, notes: e.target.value})}
                placeholder="Any additional notes..."
              />
            </div>
            <Button onClick={handleAddJob} className="w-full bg-gradient-to-r from-indigo-600 to-purple-600">
              Add Application
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

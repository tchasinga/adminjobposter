// app/applicantdetails/[id]/page.tsx
import { fetchApplicantDetails } from '@/services/applicantService';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

type Applicant = {
  _id: string;
  fullname: string;
  email: string;
  phone?: string;
  address?: string;
  resumeUrl?: string;
  coverLetter?: string;
  appliedJobs: string[];
  createdAt: string;
  status: 'pending' | 'reviewed' | 'rejected' | 'hired';
  skills?: string[];
  education?: Array<{
    institution: string;
    degree: string;
    fieldOfStudy: string;
    year: string;
  }>;
  experience?: Array<{
    company: string;
    position: string;
    duration: string;
    responsibilities: string;
  }>;
};

export default async function page({ params }: { params: { id: string } }) {
  const applicant: Applicant = await fetchApplicantDetails(params.id);

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    reviewed: 'bg-blue-100 text-blue-800',
    rejected: 'bg-red-100 text-red-800',
    hired: 'bg-green-100 text-green-800',
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/admin-dashboard?tab=applicants" className="flex items-center gap-2 text-sm">
          <ArrowLeft className="h-4 w-4" />
          Back to Applicants
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Applicant Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-2xl">{applicant.fullname}</CardTitle>
                <Badge className={statusColors[applicant.status]}>
                  {applicant.status.charAt(0).toUpperCase() + applicant.status.slice(1)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-500">Contact Information</h3>
                  <p>Email: {applicant.email}</p>
                  {applicant.phone && <p>Phone: {applicant.phone}</p>}
                  {applicant.address && <p>Address: {applicant.address}</p>}
                </div>

                <div>
                  <h3 className="font-medium text-gray-500">Applied Jobs</h3>
                  <ul className="list-disc pl-5">
                    {applicant.appliedJobs.map((job, index) => (
                      <li key={index}>{job}</li>
                    ))}
                  </ul>
                </div>

                {applicant.coverLetter && (
                  <div>
                    <h3 className="font-medium text-gray-500">Cover Letter</h3>
                    <p className="whitespace-pre-line">{applicant.coverLetter}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Skills Section */}
          {applicant.skills && applicant.skills.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Skills</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {applicant.skills.map((skill, index) => (
                    <Badge key={index} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Education Section */}
          {applicant.education && applicant.education.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Education</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {applicant.education.map((edu, index) => (
                  <div key={index}>
                    <h4 className="font-medium">{edu.institution}</h4>
                    <p>{edu.degree} in {edu.fieldOfStudy}</p>
                    <p className="text-sm text-gray-500">{edu.year}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Experience Section */}
          {applicant.experience && applicant.experience.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Work Experience</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {applicant.experience.map((exp, index) => (
                  <div key={index}>
                    <h4 className="font-medium">{exp.company}</h4>
                    <p>{exp.position} ({exp.duration})</p>
                    <p className="whitespace-pre-line">{exp.responsibilities}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar Actions */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Application Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p><span className="font-medium">Applied:</span> {formatDate(applicant.createdAt)}</p>
                {applicant.resumeUrl && (
                  <Button asChild variant="outline" className="w-full">
                    <a href={applicant.resumeUrl} target="_blank" rel="noopener noreferrer">
                      View Resume
                    </a>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="default" className="w-full">
                Mark as Reviewed
              </Button>
              <Button variant="secondary" className="w-full">
                Schedule Interview
              </Button>
              <Button variant="destructive" className="w-full">
                Reject Application
              </Button>
              <Button variant="success" className="w-full">
                Hire Candidate
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <textarea
                className="w-full h-32 p-2 border rounded"
                placeholder="Add private notes about this applicant..."
              />
              <Button className="mt-2 w-full">Save Notes</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
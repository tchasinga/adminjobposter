import { notFound } from 'next/navigation';
import { Skeleton } from "@/components/ui/skeleton";
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { FileText, ArrowLeft } from 'lucide-react';
import { ResumeActions } from '@/components/resume-actions';

interface Applicant {
  _id: string;
  fullname: string;
  country: string;
  email: string;
  telegramUsername: string;
  appliedJobs: string[];
  salaryExpectation: number;
  experienceLevel: string;
  validedPhonenumber: string;
  uploadResume: string;
  casinoExperience: boolean;
  strokeIgaming: boolean;
  previousCompany: string;
  previousAchievements: string[];
  availability: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

async function getApplicantDetails(id: string): Promise<Applicant | null> {
  try {
    const res = await fetch(`/api/applicants/${id}`, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      console.error(`API Error: ${res.status} ${res.statusText}`);
      return null;
    }

    const data = await res.json();
    return data.applicant;
  } catch (error) {
    console.error('Fetch Error:', error);
    return null;
  }
}

export default async function ApplicantDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const applicant = await getApplicantDetails(params.id);
  
  if (!applicant) {
    return notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-6">
        <Link href="/dashboard">
          <Button variant="outline" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Applicants
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
        {/* Header Section is good for view*/}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-5 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="bg-white p-2 rounded-lg shadow-sm border border-gray-200">
                <div className="bg-blue-100 text-blue-600 p-3 rounded-md">
                  <FileText className="h-6 w-6" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">{applicant.fullname}</h1>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <span className="text-gray-600 text-sm flex items-center">
                    {applicant.email}
                  </span>
                  <span className="text-gray-400">•</span>
                  <span className="text-gray-600 text-sm">
                    {applicant.country}
                  </span>
                </div>
              </div>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              applicant.status === 'hired' 
                ? 'bg-green-100 text-green-800' 
                : applicant.status === 'rejected'
                ? 'bg-red-100 text-red-800'
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {applicant.status.charAt(0).toUpperCase() + applicant.status.slice(1)}
            </span>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Job Information */}
              <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">Job Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Applied For</p>
                    <p className="font-medium mt-1">
                      {applicant.appliedJobs?.length ? applicant.appliedJobs.join(', ') : 'Not specified'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Experience Level</p>
                    <p className="font-medium mt-1">
                      {applicant.experienceLevel || 'Not specified'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Salary Expectation</p>
                    <p className="font-medium mt-1">
                      {applicant.salaryExpectation ? `$${applicant.salaryExpectation.toLocaleString()}` : 'Not specified'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Availability</p>
                    <p className="font-medium mt-1">
                      {applicant.availability || 'Not specified'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Professional Background */}
              <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">Professional Background</h2>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Previous Company</p>
                    <p className="font-medium mt-1">
                      {applicant.previousCompany || 'Not specified'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Industry Experience</p>
                    <p className="font-medium mt-1">
                      {applicant.casinoExperience ? 'Casino' : ''}
                      {applicant.casinoExperience && applicant.strokeIgaming ? ', ' : ''}
                      {applicant.strokeIgaming ? 'iGaming' : ''}
                      {!applicant.casinoExperience && !applicant.strokeIgaming ? 'Not specified' : ''}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Previous Achievements</p>
                    {applicant.previousAchievements?.length ? (
                      <ul className="mt-1 space-y-2">
                        {applicant.previousAchievements.map((achievement, index) => (
                          <li key={index} className="flex items-start">
                            <span className="inline-block h-1.5 w-1.5 rounded-full bg-blue-500 mt-2 mr-2"></span>
                            <span className="font-medium">{achievement}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="font-medium mt-1 text-gray-400">Not specified</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Contact Information */}
              <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">Contact Information</h2>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium mt-1">
                      {applicant.email || 'Not specified'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Telegram</p>
                    <p className="font-medium mt-1">
                      {applicant.telegramUsername ? `@${applicant.telegramUsername}` : 'Not specified'}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">WhatSapp number</p>
                    <p className="font-medium mt-1">
                      {applicant.validedPhonenumber ? `${applicant.validedPhonenumber}` : 'Phone number no specified'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Resume Section */}
              <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">Resume</h2>
                {applicant.uploadResume ? (
                  <ResumeActions 
                    resumeUrl={applicant.uploadResume} 
                    applicantName={applicant.fullname} 
                  />
                ) : (
                  <div className="text-center py-6">
                    <div className="mx-auto bg-gray-100 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-3">
                      <FileText className="h-5 w-5 text-gray-400" />
                    </div>
                    <p className="text-gray-500">No resume uploaded</p>
                  </div>
                )}
              </div>

              {/* Timeline */}
              <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">Timeline</h2>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Applied on</p>
                    <p className="font-medium mt-1">
                      {new Date(applicant.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Last updated</p>
                    <p className="font-medium mt-1">
                      {new Date(applicant.updatedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Skeleton Loading Component
export function ApplicantDetailsSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-6">
        <Skeleton className="h-10 w-32" />
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
        {/* Header Skeleton */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-5 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-start gap-4">
              <Skeleton className="w-12 h-12 rounded-lg" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-64" />
              </div>
            </div>
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
        </div>

        {/* Main Content Skeleton */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column Skeleton */}
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-64 w-full rounded-lg" />
              <Skeleton className="h-64 w-full rounded-lg" />
            </div>

            {/* Right Column Skeleton */}
            <div className="space-y-6">
              <Skeleton className="h-48 w-full rounded-lg" />
              <Skeleton className="h-48 w-full rounded-lg" />
              <Skeleton className="h-48 w-full rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
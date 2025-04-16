// src/components/admin-dashboard/types.ts
export type JobPosting = {
    id: string;
    title: string;
    typeOfCareer: string;
    typeOfWork: string;
    typeOfSystem: string;
    country: string;
    salary: string;
    contractTerm: string;
    postedDate: string;
    status: "active" | "closed";
    projectdescription?: string;
    jobrequirementskills?: string;
    jobresponsibilities?: string;
  };
  
  export type Applicant = {
    id: string;
    name: string;
    email: string;
    jobTitle: string;
    appliedDate: string;
    status: "pending" | "reviewed" | "rejected" | "hired";
    resumeUrl: string;
  };
  
  export type DashboardStats = {
    totalJobs: number;
    activeJobs: number;
    totalApplicants: number;
    newApplicants: number;
  };
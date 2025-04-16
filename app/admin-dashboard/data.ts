// src/components/admin-dashboard/data.ts
import { JobPosting, Applicant, DashboardStats } from './types'

export const dummyJobs: JobPosting[] = Array.from({ length: 10 }, (_, i) => ({
  id: `job-${i + 1}`,
  title: ["Software Engineer", "Product Manager", "UX Designer", "Data Scientist"][i % 4],
  typeOfCareer: ["Full-time", "Part-time", "Contract"][i % 3],
  typeOfWork: ["Remote", "Hybrid", "On-site"][i % 3],
  typeOfSystem: ["Web", "Mobile", "Desktop"][i % 3],
  country: ["USA", "Canada", "UK", "Germany", "Australia"][i % 5],
  salary: [`$${(i + 5) * 10}K`, `$${(i + 7) * 10}K`, `$${(i + 6) * 10}K`][i % 3],
  contractTerm: ["1 year", "6 months", "Permanent"][i % 3],
  postedDate: new Date(Date.now() - i * 86400000).toLocaleDateString(),
  status: i % 4 === 0 ? "closed" : "active",
}));

export const dummyApplicants: Applicant[] = Array.from({ length: 30 }, (_, i) => ({
  id: `app-${i + 1}`,
  name: [`John Doe`, "Jane Smith", "Robert Johnson", "Emily Davis"][i % 4] + ` ${i + 1}`,
  email: `user${i + 1}@example.com`,
  jobTitle: ["Software Engineer", "Product Manager", "UX Designer", "Data Scientist"][i % 4],
  appliedDate: new Date(Date.now() - i * 43200000).toLocaleDateString(),
  status: ["pending", "reviewed", "rejected", "hired"][i % 4],
  resumeUrl: "#",
}));

export const dashboardStats: DashboardStats = {
  totalJobs: 24,
  activeJobs: 18,
  totalApplicants: 156,
  newApplicants: 12,
};
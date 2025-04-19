// services/dashboardService.ts

export const fetchDashboardStats = async () => {
  const res = await fetch('/api/dashboard/stats');
  if (!res.ok) throw new Error('Failed to fetch dashboard stats');
  const data = await res.json();
  return {
    totalJobs: data.data.overview.totalJobs,
    activeJobs: data.data.overview.activeJobs,
    totalApplicants: data.data.overview.totalApplicants,
    newApplicants: data.data.overview.applicantsThisMonth
  };
};

export const fetchApplicantsChartData = async ({ months = 6, groupBy = 'month' }: { months?: number; groupBy?: string }) => {
  const res = await fetch(`/api/dashboard/applicants-chart?months=${months}&groupBy=${groupBy}`);
  if (!res.ok) throw new Error('Failed to fetch applicants chart data');
  const data = await res.json();
  
  // Transform the backend data to match the frontend chart format
  return data.data.labels.map((label: string, index: number) => ({
    name: label,
    applicants: data.data.datasets.total[index],
    pending: data.data.datasets.pending[index],
    reviewed: data.data.datasets.reviewed[index],
    hired: data.data.datasets.hired[index],
    rejected: data.data.datasets.rejected[index]
  }));
};

export const fetchJobsChartData = async () => {
  const response = await fetch('/api/dashboard/jobs-chart');
  if (!response.ok) {
    throw new Error('Failed to fetch jobs chart data');
  }
  return response.json();
};
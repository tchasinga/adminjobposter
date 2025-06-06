/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import StatCard from "../Page/StatCard";
import { IconBrandTabler, IconBriefcase, IconUserBolt, IconUsers } from "@tabler/icons-react";
import { 
  fetchDashboardStats, 
  fetchApplicantsChartData,
  fetchJobsChartData 
} from "../../services/dashboardService";

import Link from "next/link";
import { fetchApplicants } from "../../services/applicantService";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from 'next/navigation'

type DashboardStats = {
  totalJobs: number;
  activeJobs: number;
  totalApplicants: number;
  newApplicants: number;
};

type Applicant = {
  _id: string;
  fullname: string;
  email: string;
  appliedJobs: string[];
  createdAt: string;
  status: "pending" | "reviewed" | "rejected" | "hired";
};

type JobsChartData = {
  byType: { _id: string; count: number }[];
  byCareer: { _id: string; count: number }[];
  bySystem: { _id: string; count: number }[];
};

export const AdminDashboard = () => {
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalJobs: 0,
    activeJobs: 0,
    totalApplicants: 0,
    newApplicants: 0
  });

  const router = useRouter();


  const [monthlyApplicantsData, setMonthlyApplicantsData] = useState<any[]>([]);
  const [recentApplicants, setRecentApplicants] = useState<Applicant[]>([]);
  const [jobsChartData, setJobsChartData] = useState<JobsChartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const POLLING_INTERVAL = 1800000;
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  const normalizeApplicants = (data: any): Applicant[] => {
    if (!Array.isArray(data)) {
      if (data?.data && Array.isArray(data.data)) {
        data = data.data;
      } else if (data?.applicants && Array.isArray(data.applicants)) {
        data = data.applicants;
      } else {
        return [];
      }
    }

    return data.map((item: any) => ({
      _id: item._id || `temp-${Math.random().toString(36).substr(2, 9)}`,
      fullname: item.fullname || 'Unknown Applicant',
      email: item.email || 'no-email@example.com',
      appliedJobs: Array.isArray(item.appliedJobs) ? item.appliedJobs : ['Not specified'],
      createdAt: item.createdAt || new Date().toISOString(),
      status: ["pending", "reviewed", "rejected", "hired"].includes(item.status) 
        ? item.status 
        : "pending"
    }));
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [stats, applicantsChart, applicants, jobsChart] = await Promise.all([
        fetchDashboardStats(),
        fetchApplicantsChartData({ months: 6, groupBy: 'month' }),
        fetchApplicants({ limit: 5, sort: '-createdAt' }),
        fetchJobsChartData()
      ]);

      if (stats) {
        setDashboardStats({
          totalJobs: stats.totalJobs || 0,
          activeJobs: stats.activeJobs || 0,
          totalApplicants: stats.totalApplicants || 0,
          newApplicants: stats.newApplicants || 0
        });
      }

      setMonthlyApplicantsData(Array.isArray(applicantsChart) ? applicantsChart : []);
      
      const normalized = normalizeApplicants(applicants);
      setRecentApplicants(normalized);

      if (jobsChart?.success) {
        setJobsChartData(jobsChart.data);
      }

    } catch (error) {
      console.error("Error in dashboard data fetch:", error);
      setError("Failed to load dashboard data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const intervalId = setInterval(fetchData, POLLING_INTERVAL);
    return () => clearInterval(intervalId);
  }, []);

  if (loading) {
    return (
      <div className="flex flex-1 flex-col p-6 space-y-6">
        <Skeleton className="h-8 w-1/4 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-lg" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-lg" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-lg" />
        <Skeleton className="h-64 rounded-lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="text-center space-y-2">
          <h2 className="text-xl font-semibold text-red-500">{error}</h2>
          <Button onClick={fetchData}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col overflow-y-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard 
          title="Total Jobs" 
          value={dashboardStats.totalJobs} 
          icon={<IconBriefcase className="h-6 w-6" />}
        />

        <StatCard 
          title="Active Jobs" 
          value={dashboardStats.activeJobs} 
          icon={<IconBrandTabler className="h-6 w-6" />}
        />
        <StatCard 
          title="Total Applicants" 
          value={dashboardStats.totalApplicants} 
          icon={<IconUsers className="h-6 w-6" />}
        />
        <StatCard 
          title="New Applicants" 
          value={dashboardStats.newApplicants} 
          icon={<IconUserBolt className="h-6 w-6" />}
        />
      </div>
      
      {/* Jobs Distribution Charts */}
      <div className="flex flex-wrap gap-4 mb-8">
        {/* Jobs by Type Chart */}
        <div className="flex-1 bg-white p-4 rounded-lg shadow dark:bg-neutral-800">
          <h3 className="text-lg font-semibold mb-4">Jobs by Type</h3>
          <div className="flex items-center gap-4">
            <div className="flex-1 h-64">
              {jobsChartData?.byType?.length ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={jobsChartData.byType}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      innerRadius={40}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {jobsChartData.byType.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500">
                  No job type data available
                </div>
              )}
            </div>
            <ul className="flex-1 text-sm space-y-2">
              {jobsChartData?.byType?.map((type, index) => (
                <li key={type._id} className="flex justify-between">
                  <span>{type._id}</span>
                  <span className="font-medium">{type.count}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Jobs by Career Chart */}
        <div className="flex-1 bg-white p-4 rounded-lg shadow dark:bg-neutral-800">
          <h3 className="text-lg font-semibold mb-4">Jobs by Career</h3>
          <div className="flex items-center gap-4">
            <div className="flex-1 h-64">
              {jobsChartData?.byCareer?.length ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={jobsChartData.byCareer}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      innerRadius={40}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {jobsChartData.byCareer.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500">
                  No career data available
                </div>
              )}
            </div>
            <ul className="flex-1 text-sm space-y-2">
              {jobsChartData?.byCareer?.map((career, index) => (
                <li key={career._id} className="flex justify-between">
                  <span>{career._id}</span>
                  <span className="font-medium">{career.count}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Jobs by System Chart */}
        <div className="flex-1 bg-white p-4 rounded-lg shadow dark:bg-neutral-800">
          <h3 className="text-lg font-semibold mb-4">Jobs by System</h3>
          <div className="flex items-center gap-4">
            <div className="flex-1 h-64">
              {jobsChartData?.bySystem?.length ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={jobsChartData.bySystem}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      innerRadius={40}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {jobsChartData.bySystem.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500">
                  No system data available
                </div>
              )}
            </div>
            <ul className="flex-1 text-sm space-y-2">
              {jobsChartData?.bySystem?.map((system, index) => (
                <li key={system._id} className="flex justify-between">
                  <span>{system._id}</span>
                  <span className="font-medium">{system.count}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      
      {/* Monthly Applicants Chart */}
      <div className="bg-white p-4 rounded-lg shadow dark:bg-neutral-800 mb-8">
        <h3 className="text-lg font-semibold mb-4">Monthly Applicants</h3>
        <div className="h-64">
          {monthlyApplicantsData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyApplicantsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="applicants" name="Total Applicants" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">
              No applicant data available
            </div>
          )}
        </div>
      </div>
      
       {/* Recent Applicants */}
       <div className="bg-white p-4 rounded-lg shadow dark:bg-neutral-800">
        <h3 className="text-lg font-semibold mb-4">Recent Applicants</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Job Title</TableHead>
              <TableHead>Applied Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentApplicants.length > 0 ? (
              recentApplicants.map((applicant) => (
                <TableRow key={applicant._id}>
                  <TableCell className="font-medium">{applicant.fullname}</TableCell>
                  <TableCell>{applicant.email}</TableCell>
                  <TableCell>{applicant.appliedJobs[0]}</TableCell>
                  <TableCell>{new Date(applicant.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      applicant.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                      applicant.status === "reviewed" ? "bg-blue-100 text-blue-800" :
                      applicant.status === "rejected" ? "bg-red-100 text-red-800" :
                      "bg-green-100 text-green-800"
                    }`}>
                      {applicant.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Link href={`/applicantdetails/${applicant._id}`}>
<Button 
  variant="outline" 
  size="sm"
>
  View
</Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <div className="space-y-2">
                    <p className="text-gray-500">No recent applicants found</p>
                    <Button variant="ghost" size="sm" onClick={fetchData}>
                      Refresh Data
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
"use client"
import { Button } from "@/components/ui/button";
import { IconBriefcase, IconChartBar, IconFileAnalytics } from "@tabler/icons-react";
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useState, useEffect } from "react";
import { fetchApplicantsChartData, fetchJobsChartData } from "@/services/dashboardService";
import { fetchApplicants,fetchJobs } from "@/services/applicantService";

const ReportsSection = () => {
    const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];
    
    const [monthlyData, setMonthlyData] = useState([]);
    const [jobTypeData, setJobTypeData] = useState([]);
    const [applicantSources, setApplicantSources] = useState([]);
    const [loading, setLoading] = useState(true);

    // Polling interval in milliseconds
    const POLLING_INTERVAL = 30000;

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [monthlyChart, jobsChart, applicantsData] = await Promise.all([
                    fetchApplicantsChartData({ months: 6, groupBy: 'month' }),
                    fetchJobsChartData(),
                    fetchApplicants()
                ]);

                // Transform monthly data to include both jobs and applicants
                const transformedMonthlyData = monthlyChart.map(item => ({
                    name: item.name,
                    applicants: item.applicants,
                    jobs: jobsChart.find(job => job.name === item.name)?.value || 0
                }));

                setMonthlyData(transformedMonthlyData);
                setJobTypeData(jobsChart);

                // Simulate applicant sources data (this would normally come from an API)
                const sources = [
                    { name: "LinkedIn", value: Math.floor(Math.random() * 100) },
                    { name: "Indeed", value: Math.floor(Math.random() * 50) },
                    { name: "Company Website", value: Math.floor(Math.random() * 40) },
                    { name: "Referrals", value: Math.floor(Math.random() * 30) },
                ];
                setApplicantSources(sources);
            } catch (error) {
                console.error("Error fetching reports data:", error);
            } finally {
                setLoading(false);
            }
        };

        // Initial fetch
        fetchData();

        // Set up polling
        const intervalId = setInterval(fetchData, POLLING_INTERVAL);

        // Clean up interval on unmount
        return () => clearInterval(intervalId);
    }, []);

    if (loading) {
        return <div className="flex flex-1 items-center justify-center">Loading reports...</div>;
    }

    return (
        <div className="flex flex-1 flex-col overflow-y-auto p-6">
            <h1 className="text-2xl font-bold mb-6">Reports & Analytics</h1>
            
            {/* Combined Chart */}
            <div className="bg-white p-4 rounded-lg shadow mb-6 dark:bg-neutral-800">
                <h3 className="text-lg font-semibold mb-4">Jobs vs Applicants (Last 6 Months)</h3>
                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={monthlyData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                            <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                            <Tooltip />
                            <Legend />
                            <Bar yAxisId="left" dataKey="jobs" fill="#8884d8" name="Jobs Posted" />
                            <Bar yAxisId="right" dataKey="applicants" fill="#82ca9d" name="Applicants" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
            
            {/* Two smaller charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-4 rounded-lg shadow dark:bg-neutral-800">
                    <h3 className="text-lg font-semibold mb-4">Job Types Distribution</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={jobTypeData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                >
                                    {jobTypeData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                
                <div className="bg-white p-4 rounded-lg shadow dark:bg-neutral-800">
                    <h3 className="text-lg font-semibold mb-4">Applicant Sources</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={applicantSources}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                >
                                    {COLORS.map((color, index) => (
                                        <Cell key={`cell-${index}`} fill={color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
            
            {/* Export Options */}
            <div className="bg-white p-4 rounded-lg shadow mt-6 dark:bg-neutral-800">
                <h3 className="text-lg font-semibold mb-4">Export Reports</h3>
                <div className="flex gap-4">
                    <Button variant="outline">
                        <IconFileAnalytics className="mr-2 h-4 w-4" />
                        Export Applicants Data
                    </Button>
                    <Button variant="outline">
                        <IconBriefcase className="mr-2 h-4 w-4" />
                        Export Jobs Data
                    </Button>
                    <Button variant="outline">
                        <IconChartBar className="mr-2 h-4 w-4" />
                        Export Analytics
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ReportsSection;
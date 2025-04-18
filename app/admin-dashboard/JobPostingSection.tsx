"use client"
import { useState, useEffect } from "react";
import { JobPosting } from "../admin-dashboard/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { fetchJobs, createJob, updateJob, closeOrDeleteJob } from "@/services/jobService";

export const JobPostingSection = () => {
    const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

    const [isCreatingJob, setIsCreatingJob] = useState(false);
    const [jobs, setJobs] = useState<JobPosting[]>([]);
    const [loading, setLoading] = useState(true);
    const [newJob, setNewJob] = useState<Partial<JobPosting>>({
        title: "",
        typeOfCareer: "",
        typeOfWork: "",
        typeOfSystem: "",
        country: "",
        salary: "",
        contractTerm: "",
    });

    // Polling interval in milliseconds
    const POLLING_INTERVAL = 30000;

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await fetchJobs(true); // Enable polling
                setJobs(data);
            } catch (error) {
                console.error("Error fetching jobs:", error);
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

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setNewJob(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (name: string, value: string) => {
        setNewJob(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const createdJob = await createJob(newJob);
            setJobs(prev => [createdJob, ...prev]);
            setIsCreatingJob(false);
            setNewJob({
                title: "",
                typeOfCareer: "",
                typeOfWork: "",
                typeOfSystem: "",
                country: "",
                salary: "",
                contractTerm: "",
            });
        } catch (error) {
            console.error("Error creating job:", error);
        }
    };

    const handleCloseJob = async (id: string) => {
        try {
            await closeOrDeleteJob(id, 'close');
            setJobs(prev => prev.map(job => 
                job._id === id ? { ...job, status: 'closed' } : job
            ));
        } catch (error) {
            console.error("Error closing job:", error);
        }
    };

    const handleDeleteJob = async (id: string) => {
        try {
            await closeOrDeleteJob(id, 'delete');
            setJobs(prev => prev.filter(job => job._id !== id));
        } catch (error) {
            console.error("Error deleting job:", error);
        }
    };

    const jobTypeData = [
        { name: "Full-time", value: jobs.filter(job => job.typeOfCareer === "Full-time").length },
        { name: "Part-time", value: jobs.filter(job => job.typeOfCareer === "Part-time").length },
        { name: "Contract", value: jobs.filter(job => job.typeOfCareer === "Contract").length },
    ];

    if (loading) {
        return <div className="flex flex-1 items-center justify-center">Loading jobs...</div>;
    }

    return (
        <div className="flex flex-1 flex-col overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Job Postings</h1>
                <Button onClick={() => setIsCreatingJob(true)}>Create New Job</Button>
            </div>
            
            {isCreatingJob && (
                <div className="bg-white p-6 rounded-lg shadow mb-6 dark:bg-neutral-800">
                    <h2 className="text-xl font-semibold mb-4">Create New Job Posting</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Form fields remain the same as in your original code */}
                        {/* ... */}
                    </form>
                </div>
            )}
            
            {/* Job Postings Table */}
            <div className="bg-white p-4 rounded-lg shadow dark:bg-neutral-800">
                <h3 className="text-lg font-semibold mb-4">Active Job Postings</h3>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Work</TableHead>
                            <TableHead>Country</TableHead>
                            <TableHead>Salary</TableHead>
                            <TableHead>Posted Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {jobs.map((job) => (
                            <TableRow key={job._id}>
                                <TableCell className="font-medium">{job.title}</TableCell>
                                <TableCell>{job.typeOfCareer}</TableCell>
                                <TableCell>{job.typeOfWork}</TableCell>
                                <TableCell>{job.country}</TableCell>
                                <TableCell>{job.salary}</TableCell>
                                <TableCell>{new Date(job.createdAt).toLocaleDateString()}</TableCell>
                                <TableCell>
                                    <span className={`px-2 py-1 rounded-full text-xs ${
                                        job.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                                    }`}>
                                        {job.status}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm">Edit</Button>
                                        {job.status === 'active' ? (
                                            <Button 
                                                variant="destructive" 
                                                size="sm"
                                                onClick={() => handleCloseJob(job._id)}
                                            >
                                                Close
                                            </Button>
                                        ) : (
                                            <Button 
                                                variant="destructive" 
                                                size="sm"
                                                onClick={() => handleDeleteJob(job._id)}
                                            >
                                                Delete
                                            </Button>
                                        )}
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
            
            {/* Job Type Distribution Chart */}
            <div className="bg-white p-4 rounded-lg shadow mt-6 dark:bg-neutral-800">
                <h3 className="text-lg font-semibold mb-4">Job Type Distribution</h3>
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
        </div>
    );
};
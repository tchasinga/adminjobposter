// src/components/admin-dashboard/JobPostingSection.tsx
import { useState } from "react";
import { dummyJobs } from "../admin-dashboard/data";
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

export const JobPostingSection = () => {

    const jobTypeData = [
        { name: "Full-time", value: 12 },
        { name: "Part-time", value: 6 },
        { name: "Contract", value: 6 },
      ];

      const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];


 const [isCreatingJob, setIsCreatingJob] = useState(false);
  const [newJob, setNewJob] = useState<Partial<JobPosting>>({
    title: "",
    typeOfCareer: "",
    typeOfWork: "",
    typeOfSystem: "",
    country: "",
    salary: "",
    contractTerm: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewJob(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setNewJob(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send the data to your API
    console.log("New job:", newJob);
    setIsCreatingJob(false);
    // Reset form
    setNewJob({
      title: "",
      typeOfCareer: "",
      typeOfWork: "",
      typeOfSystem: "",
      country: "",
      salary: "",
      contractTerm: "",
    });
  };

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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Job Title</label>
                <Input
                  name="title"
                  value={newJob.title}
                  onChange={handleInputChange}
                  placeholder="Software Engineer"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Type of Career</label>
                <Select
                  value={newJob.typeOfCareer}
                  onValueChange={(value) => handleSelectChange("typeOfCareer", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select career type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Full-time">Full-time</SelectItem>
                    <SelectItem value="Part-time">Part-time</SelectItem>
                    <SelectItem value="Contract">Contract</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Type of Work</label>
                <Select
                  value={newJob.typeOfWork}
                  onValueChange={(value) => handleSelectChange("typeOfWork", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select work type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Remote">Remote</SelectItem>
                    <SelectItem value="Hybrid">Hybrid</SelectItem>
                    <SelectItem value="On-site">On-site</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Type of System</label>
                <Select
                  value={newJob.typeOfSystem}
                  onValueChange={(value) => handleSelectChange("typeOfSystem", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select system type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Web">Web</SelectItem>
                    <SelectItem value="Mobile">Mobile</SelectItem>
                    <SelectItem value="Desktop">Desktop</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Country</label>
                <Input
                  name="country"
                  value={newJob.country}
                  onChange={handleInputChange}
                  placeholder="Country"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Salary</label>
                <Input
                  name="salary"
                  value={newJob.salary}
                  onChange={handleInputChange}
                  placeholder="$80K - $100K"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Contract Term</label>
                <Select
                  value={newJob.contractTerm}
                  onValueChange={(value) => handleSelectChange("contractTerm", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select contract term" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1 year">1 year</SelectItem>
                    <SelectItem value="6 months">6 months</SelectItem>
                    <SelectItem value="Permanent">Permanent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Job Description</label>
              <Textarea
                name="projectdescription"
                value={newJob.projectdescription || ""}
                onChange={handleInputChange}
                placeholder="Detailed job description..."
                rows={4}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Job Requirements</label>
              <Textarea
                name="jobrequirementskills"
                value={newJob.jobrequirementskills || ""}
                onChange={handleInputChange}
                placeholder="Required skills and qualifications..."
                rows={4}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Job Responsibilities</label>
              <Textarea
                name="jobresponsibilities"
                value={newJob.jobresponsibilities || ""}
                onChange={handleInputChange}
                placeholder="Key responsibilities..."
                rows={4}
              />
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsCreatingJob(false)}>
                Cancel
              </Button>
              <Button type="submit">Create Job</Button>
            </div>
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
            {dummyJobs.map((job) => (
              <TableRow key={job.id}>
                <TableCell className="font-medium">{job.title}</TableCell>
                <TableCell>{job.typeOfCareer}</TableCell>
                <TableCell>{job.typeOfWork}</TableCell>
                <TableCell>{job.country}</TableCell>
                <TableCell>{job.salary}</TableCell>
                <TableCell>{job.postedDate}</TableCell>
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
                    <Button variant="destructive" size="sm">Close</Button>
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

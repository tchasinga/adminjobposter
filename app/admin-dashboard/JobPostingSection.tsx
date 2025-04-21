"use client";

import React, { useState, useEffect } from "react";
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from "firebase/storage";
import app from "../firebase";
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { closeOrDeleteJob } from "@/services/jobService";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import toast from "react-hot-toast";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const storage = getStorage(app);

const INITIAL_FORM_STATE = {
  title: "",
  typeofcarees: "",
  typeofworks: "",
  typeofsystem: "",
  questionone: "",
  questiontwo: "",
  country: "",
  salary: "",
  description: "",
  cardImgIcon: "",
  bgdetailspage: "",
  projectdescription: "",
  jobrequirementskills: "",
  jobresponsibilities: "",
  contractTerm: "",
};

export default function JobPostingForm() {
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [cardImgFile, setCardImgFile] = useState<File | null>(null);
  const [bgImgFile, setBgImgFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [jobs, setJobs] = useState<{ _id: string; title: string; typeofworks: string; country: string; salary: string; status: string }[]>([]);
  const [filter, setFilter] = useState("all");
  const [loadingJobs, setLoadingJobs] = useState(true);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoadingJobs(true);
      const response = await fetch("https://kuvoshadmin.vercel.app/api/jobs");
      const data = await response.json();
      setJobs(data.jobs || []);
    } catch (error) {
      console.error("Error fetching jobs:", error);
      toast.error("Failed to load jobs");
    } finally {
      setLoadingJobs(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: "cardImgIcon" | "bgdetailspage") => {
    const file = e.target.files?.[0] || null;
    if (type === "cardImgIcon") setCardImgFile(file);
    if (type === "bgdetailspage") setBgImgFile(file);
  };

  const uploadImage = async (file: File, folder: string): Promise<string> => {
    const storageRef = ref(storage, `${folder}/${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);
    
    return new Promise((resolve, reject) => {
      uploadTask.on(
        "state_changed",
        null,
        reject,
        () => getDownloadURL(uploadTask.snapshot.ref).then(resolve).catch(reject)
      );
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const [cardImgIconUrl, bgdetailspageUrl] = await Promise.all([
        cardImgFile ? uploadImage(cardImgFile, "cardIcons") : "",
        bgImgFile ? uploadImage(bgImgFile, "bgImages") : "",
      ]);

      const response = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          cardImgIcon: cardImgIconUrl,
          bgdetailspage: bgdetailspageUrl,
        }),
      });

      if (!response.ok) throw new Error("Failed to create job");

      toast.success("Job created successfully!");
      setFormData(INITIAL_FORM_STATE);
      setCardImgFile(null);
      setBgImgFile(null);
      setShowForm(false);
      await fetchJobs();
    } catch (error) {
      console.error(error);
      toast.error("Error creating job. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleJobAction = async (id: string, action: 'close' | 'delete') => {
    try {
      await closeOrDeleteJob(id, action);
      toast.success(`Job ${action}d successfully`);
      await fetchJobs();
    } catch (error) {
      console.error(`Error ${action}ing job:`, error);
      toast.error(`Failed to ${action} job`);
    }
  };

  const filteredJobs = jobs.filter(job => {
    if (filter === "all") return true;
    if (filter === "active") return job.status === "active";
    if (filter === "closed") return job.status === "closed";
    return true;
  });

  const activeJobsCount = jobs.filter(job => job.status === "active").length;
  const closedJobsCount = jobs.filter(job => job.status === "closed").length;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Total Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{jobs.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Active Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{activeJobsCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Closed Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{closedJobsCount}</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter Jobs" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Jobs</SelectItem>
              <SelectItem value="active">Active Only</SelectItem>
              <SelectItem value="closed">Closed Only</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "Create New Job"}
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="space-y-4 mb-8 p-6 border rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input name="title" placeholder="Job Title" value={formData.title} onChange={handleInputChange} required />
            <Input name="typeofcarees" placeholder="Type of Career" value={formData.typeofcarees} onChange={handleInputChange} required />
            <Input name="typeofworks" placeholder="Type of Work" value={formData.typeofworks} onChange={handleInputChange} required />
            <Input name="typeofsystem" placeholder="Type of System" value={formData.typeofsystem} onChange={handleInputChange} required />
            <Input name="country" placeholder="Country" value={formData.country} onChange={handleInputChange} required />
            <Input name="salary" placeholder="Salary" value={formData.salary} onChange={handleInputChange} required />
            <Input name="contractTerm" placeholder="Contract Term" value={formData.contractTerm} onChange={handleInputChange} required />
          </div>

          <Textarea name="description" placeholder="Description" value={formData.description} onChange={handleInputChange} required />
          <Textarea name="projectdescription" placeholder="Project Description" value={formData.projectdescription} onChange={handleInputChange} required />
          <Textarea name="jobrequirementskills" placeholder="Job Requirements & Skills" value={formData.jobrequirementskills} onChange={handleInputChange} required />
          <Textarea name="jobresponsibilities" placeholder="Job Responsibilities" value={formData.jobresponsibilities} onChange={handleInputChange} required />
          <Textarea name="questionone" placeholder="Question One" value={formData.questionone} onChange={handleInputChange} required />
          <Textarea name="questiontwo" placeholder="Question Two" value={formData.questiontwo} onChange={handleInputChange} required />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-2">Card Image Icon</label>
              <Input type="file" onChange={(e) => handleFileChange(e, "cardImgIcon")} required />
            </div>
            <div>
              <label className="block mb-2">Background Image</label>
              <Input type="file" onChange={(e) => handleFileChange(e, "bgdetailspage")} required />
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Job"}
            </Button>
          </div>
        </form>
      )}

      {loadingJobs ? (
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Salary</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredJobs.map((job) => (
              <TableRow key={job._id}>
                <TableCell>{job.title}</TableCell>
                <TableCell>{job.typeofworks}</TableCell>
                <TableCell>{job.country}</TableCell>
                <TableCell>{job.salary}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    job.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                  }`}>
                    {job.status}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    {job.status === "active" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleJobAction(job._id, 'close')}
                      >
                        Close
                      </Button>
                    )}
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleJobAction(job._id, 'delete')}
                    >
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
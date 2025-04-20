/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react'
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from "firebase/storage";
import { createJob, fetchJobs, closeOrDeleteJob } from '../../services/jobService';
import app from '../firebase'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import toast from "react-hot-toast";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const jobFormSchema = z.object({
  title: z.string().min(2, {
    message: "Title must be at least 2 characters.",
  }),
  typeofcarees: z.string({
    required_error: "Please select a career type.",
  }),
  typeofworks: z.string({
    required_error: "Please select a work type.",
  }),
  typeofsystem: z.string({
    required_error: "Please select a system type.",
  }),
  questionone: z.string().min(10, {
    message: "Question must be at least 10 characters.",
  }),
  questiontwo: z.string().min(10, {
    message: "Question must be at least 10 characters.",
  }),
  country: z.string().min(2, {
    message: "Country must be at least 2 characters.",
  }),
  salary: z.string().min(2, {
    message: "Salary must be provided.",
  }),
  description: z.string().min(20, {
    message: "Description must be at least 20 characters.",
  }),
  projectdescription: z.string().min(20, {
    message: "Project description must be at least 20 characters.",
  }),
  jobrequirementskills: z.string().min(10, {
    message: "Skills must be at least 10 characters.",
  }),
  jobresponsibilities: z.string().min(10, {
    message: "Responsibilities must be at least 10 characters.",
  }),
  contractTerm: z.string({
    required_error: "Please select a contract term.",
  }),
})

type JobFormValues = z.infer<typeof jobFormSchema> & {
  cardImgIcon?: FileList
  bgdetailspage?: FileList
}

export default function JobPostingSection() {
  const [isLoading, setIsLoading] = useState(false)
  const [jobs, setJobs] = useState<any[]>([])
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [filter, setFilter] = useState<'all' | 'active' | 'closed'>('all')
  const storage = getStorage(app)

  const defaultValues: Partial<JobFormValues> = {
    title: "",
    description: "",
    projectdescription: "",
    jobrequirementskills: "",
    jobresponsibilities: "",
    questionone: "",
    questiontwo: "",
    country: "",
    salary: "",
  }

  const form = useForm<JobFormValues>({
    resolver: zodResolver(jobFormSchema),
    defaultValues,
  })

  React.useEffect(() => {
    const loadJobs = async () => {
      try {
        const data = await fetchJobs()
        setJobs(data.jobs || [])
      } catch (error) {
        console.error("Failed to fetch jobs:", error)
      }
    }
    loadJobs()
  }, [])

  const uploadFile = async (file: File, path: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const storageRef = ref(storage, path)
      const uploadTask = uploadBytesResumable(storageRef, file)

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          console.log('Upload is ' + progress + '% done')
        },
        (error) => {
          reject(error)
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            resolve(downloadURL)
          })
        }
      )
    })
  }

  const handleJobAction = async (id: string, action: 'close' | 'delete') => {
    try {
      await closeOrDeleteJob(id, action)
      if (action === 'delete') {
        setJobs(jobs.filter(job => job._id !== id))
      } else {
        setJobs(jobs.map(job => 
          job._id === id ? { ...job, status: 'closed' } : job
        ))
      }
      toast.success(`Job ${action === 'delete' ? 'deleted' : 'closed'} successfully`)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      toast.error(`Failed to ${action} job: ${errorMessage}`)
    }
  }

  const onSubmit = async (data: JobFormValues) => {
    setIsLoading(true)
    try {
      let cardImgIconUrl = ""
      let bgdetailspageUrl = ""

      if (data.cardImgIcon && data.cardImgIcon.length > 0) {
        cardImgIconUrl = await uploadFile(
          data.cardImgIcon[0],
          `job-images/${Date.now()}-${data.cardImgIcon[0].name}`
        )
      }

      if (data.bgdetailspage && data.bgdetailspage.length > 0) {
        bgdetailspageUrl = await uploadFile(
          data.bgdetailspage[0],
          `job-bg-images/${Date.now()}-${data.bgdetailspage[0].name}`
        )
      }

      const jobData = {
        ...data,
        cardImgIcon: cardImgIconUrl,
        bgdetailspage: bgdetailspageUrl,
        status: 'active'
      }

      const newJob = await createJob(jobData)
      setJobs([...jobs, newJob])
      toast.success("Job created successfully")
      form.reset()
      setShowCreateForm(false)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      toast.error(`Failed to create job: ${errorMessage}`)
    } finally {
      setIsLoading(false)
    }
  }

  const activeJobsCount = jobs.filter(job => job.status !== 'closed').length
  const closedJobsCount = jobs.filter(job => job.status === 'closed').length

  const filteredJobs = jobs.filter(job => {
    if (filter === 'all') return true
    if (filter === 'active') return job.status !== 'closed'
    if (filter === 'closed') return job.status === 'closed'
    return true
  })

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Job Posting</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{jobs.length}</div>
            <p className="text-xs text-muted-foreground">All jobs posted</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeJobsCount}</div>
            <p className="text-xs text-muted-foreground">Currently available</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Closed Jobs</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M15 9l-6 6" />
              <path d="M9 9l6 6" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{closedJobsCount}</div>
            <p className="text-xs text-muted-foreground">No longer available</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {showCreateForm && (
          <div className="bg-white p-6 rounded-lg shadow-md lg:w-1/2">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Create New Job</h2>
              <Button 
                variant="ghost" 
                onClick={() => {
                  setShowCreateForm(false)
                  form.reset()
                }}
              >
                Cancel
              </Button>
            </div>
            
            <div className="max-h-[calc(100vh-300px)] overflow-y-auto pr-4">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Job Title</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Cloud Engineer" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="typeofcarees"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Career Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select career type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Technology">Technology</SelectItem>
                            <SelectItem value="Healthcare">Healthcare</SelectItem>
                            <SelectItem value="Finance">Finance</SelectItem>
                            <SelectItem value="Education">Education</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="typeofworks"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Work Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select work type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Full-time">Full-time</SelectItem>
                              <SelectItem value="Part-time">Part-time</SelectItem>
                              <SelectItem value="Contract">Contract</SelectItem>
                              <SelectItem value="Freelance">Freelance</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="typeofsystem"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>System Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select system type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Remote">Remote</SelectItem>
                              <SelectItem value="Hybrid">Hybrid</SelectItem>
                              <SelectItem value="On-site">On-site</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Country</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. USA" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="salary"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Salary</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. $100,000" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="contractTerm"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contract Term</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select contract term" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Permanent">Permanent</SelectItem>
                            <SelectItem value="Temporary">Temporary</SelectItem>
                            <SelectItem value="Fixed-term">Fixed-term</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Job Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Brief description of the job..."
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="projectdescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Project Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Details about the project..."
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="jobrequirementskills"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Required Skills</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="List of required skills..."
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="jobresponsibilities"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Responsibilities</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="List of job responsibilities..."
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="questionone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Interview Question 1</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="First interview question..."
                            className="min-h-[60px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="questiontwo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Interview Question 2</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Second interview question..."
                            className="min-h-[60px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="cardImgIcon"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Card Image Icon</FormLabel>
                        <FormControl>
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={(e) => field.onChange(e.target.files)}
                          />
                        </FormControl>
                        <FormDescription>
                          This image will be displayed on the job card.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="bgdetailspage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Background Image for Details Page</FormLabel>
                        <FormControl>
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={(e) => field.onChange(e.target.files)}
                          />
                        </FormControl>
                        <FormDescription>
                          This image will be used as background on the job details page.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Creating..." : "Create Job"}
                  </Button>
                </form>
              </Form>
            </div>
          </div>
        )}

        <div className={`bg-white p-6 rounded-lg shadow-md ${showCreateForm ? 'lg:w-1/2' : 'w-full'}`}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Current Jobs</h2>
            <div className="flex space-x-2">
              <Select value={filter} onValueChange={(value: 'all' | 'active' | 'closed') => setFilter(value)}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Jobs</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={() => setShowCreateForm(true)}>
                Create Job
              </Button>
            </div>
          </div>

          {filteredJobs.length === 0 ? (
            <p className="text-gray-500">No jobs found.</p>
          ) : (
            <div className="max-h-[calc(100vh-300px)] overflow-y-auto">
              <Table>
                <TableHeader className="sticky top-0 bg-white">
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredJobs.map((job) => (
                    <TableRow key={job._id}>
                      <TableCell className="font-medium">{job.title}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span>{job.typeofworks}</span>
                          <span className="text-sm text-gray-500">{job.typeofsystem}</span>
                        </div>
                      </TableCell>
                      <TableCell>{job.country}</TableCell>
                      <TableCell>
                        <Badge variant={job.status === 'closed' ? 'destructive' : 'default'}>
                          {job.status === 'closed' ? 'Closed' : 'Active'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          {job.status !== 'closed' && (
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
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
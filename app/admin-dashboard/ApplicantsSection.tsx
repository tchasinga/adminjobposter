/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  fetchApplicants,
  updateApplicantStatus,
  exportApplicants,
} from "../../services/applicantService";
import Link from "next/link";

interface Applicant {
  _id: string;
  fullname: string;
  email: string;
  appliedJobs: string[];
  createdAt: string;
  status: "pending" | "reviewed" | "rejected" | "hired";
  country?: string;
  salaryExpectation?: number;
  [key: string]: any;
}

const ApplicantsSection = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);

  const POLLING_INTERVAL = 30000;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const params: any = {};
        if (searchTerm) params.search = searchTerm;
        if (statusFilter !== "all") params.status = statusFilter;

        const data = await fetchApplicants(params);
        console.log("Fetched applicants raw data:", data);

        // Handle different response structures
        let validArray: any[] = [];
        if (Array.isArray(data)) {
          validArray = data;
        } else if (data && Array.isArray(data.data)) {
          validArray = data.data;
        } else if (data && Array.isArray(data.applicants)) {
          validArray = data.applicants;
        } else {
          console.warn("Unexpected API response structure", data);
        }

        // Normalize applicant data with defaults
        const normalizedApplicants = validArray.map((applicant: any) => ({
          _id: applicant._id || '',
          fullname: applicant.fullname || 'Unknown',
          email: applicant.email || '',
          appliedJobs: applicant.appliedJobs || [],
          createdAt: applicant.createdAt || new Date().toISOString(),
          status: applicant.status || "pending",
          country: applicant.country,
          salaryExpectation: applicant.salaryExpectation,
          ...applicant // Spread remaining properties
        }));

        console.log("Normalized applicants:", normalizedApplicants);
        setApplicants(normalizedApplicants);
      } catch (error) {
        console.error("Error fetching applicants:", error);
        setApplicants([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const intervalId = setInterval(fetchData, POLLING_INTERVAL);
    return () => clearInterval(intervalId);
  }, [searchTerm, statusFilter]);

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      await updateApplicantStatus(id, newStatus);
      setApplicants((prev) =>
        prev.map((applicant) =>
          applicant._id === id
            ? { ...applicant, status: newStatus as Applicant["status"] }
            : applicant
        )
      );
    } catch (error) {
      console.error("Error updating applicant status:", error);
    }
  };

  const handleExport = async (format: string) => {
    try {
      const data = await exportApplicants(format);
      const blob = new Blob([data], {
        type: format === "pdf" ? "application/pdf" : "text/csv",
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `applicants.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting applicants:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        Loading applicants...
      </div>
    );
  }

  // Debug render
  console.log("Current applicants state:", applicants);

  return (
    <div className="flex flex-1 flex-col overflow-y-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Applicants</h1>
        <div className="flex gap-2">
          <Input
            placeholder="Search applicants..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
          />
          <Select
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value)}
          >
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="reviewed">Reviewed</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="hired">Hired</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Applicants Table */}
      <div className="bg-white p-4 rounded-lg shadow dark:bg-neutral-800">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Job Title</TableHead>
              <TableHead>Applied Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {applicants.length > 0 ? (
              applicants.map((applicant) => (
                <TableRow key={applicant._id}>
                  <TableCell className="font-medium">
                    {applicant.fullname}
                  </TableCell>
                  <TableCell>{applicant.email}</TableCell>
                  <TableCell>
                    {applicant.appliedJobs?.join(", ") || "N/A"}
                  </TableCell>
                  <TableCell>
                    {new Date(applicant.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Select
                      value={applicant.status}
                      onValueChange={(value) =>
                        handleStatusUpdate(applicant._id, value)
                      }
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="reviewed">Reviewed</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                        <SelectItem value="hired">Hired</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Link href={`/applicantdetails/${applicant._id}`}>
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                      </Link>
                      <Button variant="outline" size="sm">
                        Download CV
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  {loading ? "Loading..." : "No applicants found"}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Applicant Status Chart */}
      <div className="bg-white p-4 rounded-lg shadow mt-6 dark:bg-neutral-800">
        <h3 className="text-lg font-semibold mb-4">
          Applicant Status Distribution
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={[
                {
                  name: "Pending",
                  value: applicants.filter((a) => a.status === "pending").length,
                },
                {
                  name: "Reviewed",
                  value: applicants.filter((a) => a.status === "reviewed")
                    .length,
                },
                {
                  name: "Rejected",
                  value: applicants.filter((a) => a.status === "rejected")
                    .length,
                },
                {
                  name: "Hired",
                  value: applicants.filter((a) => a.status === "hired").length,
                },
              ]}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Export Section */}
      <div className="bg-white p-4 rounded-lg shadow mt-6 dark:bg-neutral-800">
        <h3 className="text-lg font-semibold mb-4">Export Applicants</h3>
        <div className="flex gap-4">
          <Button variant="outline" onClick={() => handleExport("csv")}>
            Export to CSV
          </Button>
          <Button variant="outline" onClick={() => handleExport("pdf")}>
            Export to PDF
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ApplicantsSection;
// src/components/admin-dashboard/AdminDashboard.tsx
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import StatCard from "../Page/StatCard"
import { dashboardStats, dummyApplicants } from "./data";
import { IconBrandTabler, IconBriefcase, IconUserBolt, IconUsers } from "@tabler/icons-react";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

export const AdminDashboard = () => {
  const monthlyApplicantsData = [
    { name: "Jan", applicants: 20 },
    { name: "Feb", applicants: 35 },
    { name: "Mar", applicants: 28 },
    { name: "Apr", applicants: 42 },
    { name: "May", applicants: 31 },
    { name: "Jun", applicants: 45 },
  ];

  const applicantStatusData = [
    { name: "Pending", value: 45 },
    { name: "Reviewed", value: 30 },
    { name: "Rejected", value: 15 },
    { name: "Hired", value: 10 },
  ];

  return (
    <div className="flex flex-1 flex-col overflow-y-auto p-6">
         <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
         
         {/* Stats Cards */}
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
           <StatCard 
             title="Total Jobs" 
             value={dashboardStats.totalJobs} 
             icon={<IconBriefcase className="h-6 w-6" />}
             trend="up"
             percentage="12%"
           />
           <StatCard 
             title="Active Jobs" 
             value={dashboardStats.activeJobs} 
             icon={<IconBrandTabler className="h-6 w-6" />}
             trend="up"
             percentage="5%"
           />
           <StatCard 
             title="Total Applicants" 
             value={dashboardStats.totalApplicants} 
             icon={<IconUsers className="h-6 w-6" />}
             trend="up"
             percentage="24%"
           />
           <StatCard 
             title="New Applicants" 
             value={dashboardStats.newApplicants} 
             icon={<IconUserBolt className="h-6 w-6" />}
             trend="down"
             percentage="3%"
           />
         </div>
         
         {/* Charts */}
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
           <div className="bg-white p-4 rounded-lg shadow dark:bg-neutral-800">
             <h3 className="text-lg font-semibold mb-4">Monthly Applicants</h3>
             <div className="h-64">
               <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={monthlyApplicantsData}>
                   <CartesianGrid strokeDasharray="3 3" />
                   <XAxis dataKey="name" />
                   <YAxis />
                   <Tooltip />
                   <Legend />
                   <Bar dataKey="applicants" fill="#8884d8" />
                 </BarChart>
               </ResponsiveContainer>
             </div>
           </div>
           
           <div className="bg-white p-4 rounded-lg shadow dark:bg-neutral-800">
             <h3 className="text-lg font-semibold mb-4">Applicant Status</h3>
             <div className="h-64">
               <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                   <Pie
                     data={applicantStatusData}
                     cx="50%"
                     cy="50%"
                     labelLine={false}
                     outerRadius={80}
                     fill="#8884d8"
                     dataKey="value"
                     label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                   >
                     {applicantStatusData.map((entry, index) => (
                       <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                     ))}
                   </Pie>
                   <Tooltip />
                 </PieChart>
               </ResponsiveContainer>
             </div>
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
               {dummyApplicants.slice(0, 5).map((applicant) => (
                 <TableRow key={applicant.id}>
                   <TableCell className="font-medium">{applicant.name}</TableCell>
                   <TableCell>{applicant.email}</TableCell>
                   <TableCell>{applicant.jobTitle}</TableCell>
                   <TableCell>{applicant.appliedDate}</TableCell>
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
                     <Button variant="outline" size="sm">View</Button>
                   </TableCell>
                 </TableRow>
               ))}
             </TableBody>
           </Table>
         </div>
       </div>
     );
   };
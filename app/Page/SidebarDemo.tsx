/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
"use client";
import React, {useState, useEffect } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import {
  IconBrandTabler,
  IconBriefcase,
  IconUsers,
  IconFileAnalytics,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";



import { LogOutIcon, LogsIcon } from "lucide-react";
import { AdminDashboard } from "../admin-dashboard/AdminDashboard";
import JobPostingSection from "../admin-dashboard/JobPostingSection";
import ApplicantsSection from "../admin-dashboard/ApplicantsSection";
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation'

// Main Component
export function SidebarDemo() {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");

   const currentUser = useSelector(
      (state: any) => state.user?.user?.currentUser
    );
  
    const router = useRouter()
  
    useEffect(() => {
      if (!currentUser) {
        router.push("/login")
      }
    }, [currentUser, router])
  
    if (!currentUser) {
      return <div>Loading...</div> // Show loading state while checking auth
    }

  const links = [
    {
      label: "Dashboard",
      href: "#",
      icon: (
        <IconBrandTabler className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
      onClick: () => setActiveTab("dashboard"),
    },
    {
      label: "Job Postings",
      href: "#",
      icon: (
        <IconBriefcase className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
      onClick: () => setActiveTab("jobpostings"),
    },
    {
      label: "Applicants",
      href: "#",
      icon: (
        <IconUsers className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
      onClick: () => setActiveTab("applicants"),
    },
    {
      label: "Reports",
      href: "#",
      icon: (
        <IconFileAnalytics className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
      onClick: () => setActiveTab("reports"),
    }
    
  ];

  return (
    <div
      className={cn(
        "flex min-h-full flex-1 flex-col overflow-hidden border-neutral-200 bg-gray-100 md:flex-row ",
      )}
    >
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="justify-between gap-10">
          <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
            {open ? <LogsIcon /> : <LogOutIcon />}
            <div className="mt-8 flex flex-col gap-2">
              {links.map((link, idx) => (
                <SidebarLink 
                  key={idx} 
                  link={link} 
                  onClick={link.onClick}
                  isActive={activeTab === link.label.toLowerCase()}
                />
              ))}
            </div>
          </div>
          <div>
            <SidebarLink
              link={{
                label: "Admin User now",
                href: "#",
                icon: (
                  <img
                    src="https://assets.aceternity.com/manu.png"
                    className="h-7 w-7 shrink-0 rounded-full"
                    width={50}
                    height={50}
                    alt="Avatar"
                  />
                ),
              }}
            />
          </div>
        </SidebarBody>
      </Sidebar>
      
      <div className="flex flex-1 overflow-hidden">
        {activeTab === "dashboard" && <AdminDashboard />}
        {activeTab === "jobpostings" && <JobPostingSection />}
        {activeTab === "applicants" && <ApplicantsSection />}      
      </div>
    </div>
  );
}


   


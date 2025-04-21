/* eslint-disable @typescript-eslint/no-explicit-any */
 
"use client";
import React, { useState, useEffect } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import {
  IconBrandTabler,
  IconBriefcase,
  IconUsers,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { LogOutIcon, LogsIcon } from "lucide-react";
import { AdminDashboard } from "../admin-dashboard/AdminDashboard";
import JobPostingSection from "../admin-dashboard/JobPostingSection";
import ApplicantsSection from "../admin-dashboard/ApplicantsSection";
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import { signOutUserStart, signOutUserSuccess, signOutUserFailure } from "@/redux/user/userSlice";

// Main Component
export function SidebarDemo() {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const dispatch = useDispatch();
  const router = useRouter();
  
  const currentUser = useSelector((state: any) => state.user?.user?.currentUser);
  const { loading, error } = useSelector((state: any) => state.user);
  
  useEffect(() => {
    if (!currentUser) {
      router.push("/login");
    } else {
      router.push('/dashboard');
    }
  }, [currentUser, router]);

  const handleLogout = async () => {
    try {
      dispatch(signOutUserStart());
      
      const response = await fetch('/api/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        dispatch(signOutUserSuccess());
        router.push('/login');
      } else {
        const errorData = await response.json();
        dispatch(signOutUserFailure(errorData.error || 'Logout failed'));
      }
    } catch (error) {
      if (error instanceof Error) {
        dispatch(signOutUserFailure(error.message || 'Something went wrong'));
      } else {
        dispatch(signOutUserFailure('Something went wrong'));
      }
    }
  };

  if (!currentUser) {
    return <div>Loading...</div>; // Show loading state while checking auth
  }

  // Format dates
  const joinedDate = new Date(currentUser?.createdAt).toLocaleDateString();

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
          <div className="space-y-2">
            <SidebarLink
              link={{
                label: (
                  <div className="flex flex-col space-y-1">
                    <span className="text-xs text-neutral-500">{currentUser?.username}</span>
                    <span className="text-xs text-neutral-400">
                      Joined since: {joinedDate}
                    </span>
                  </div>
                ),
                href: "#",
                icon: (
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-500 text-white">
                    {currentUser?.username?.charAt(0).toUpperCase()}
                  </div>
                ),
              }}
            />
            <button
              onClick={handleLogout}
              disabled={loading}
              className={cn(
                "flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                "hover:bg-neutral-200 dark:hover:bg-neutral-800",
                "text-neutral-700 dark:text-neutral-200",
                loading && "opacity-50 cursor-not-allowed"
              )}
            >
              <LogOutIcon className="h-5 w-5 shrink-0" />
              <span>{loading ? "Logging out..." : ""}</span>
            </button>
            {error && (
              <p className="text-xs text-red-500 px-3">{error}</p>
            )}
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
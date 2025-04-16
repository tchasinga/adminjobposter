/* eslint-disable @next/next/no-img-element */
"use client";
import React, { useState } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import {
  IconArrowLeft,
  IconBrandTabler,
  IconSettings,
  IconBriefcase,
  IconUsers,
  IconFileAnalytics,
} from "@tabler/icons-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";


import { LogOutIcon, LogsIcon } from "lucide-react";
import { AdminDashboard } from "../admin-dashboard/AdminDashboard";
import { JobPostingSection } from "../admin-dashboard/JobPostingSection";
import ApplicantsSection from "../admin-dashboard/ApplicantsSection";
import ReportsSection from "../admin-dashboard/ReportsSection";
import SettingsSection from "../admin-dashboard/SettingsSection";

// Main Component
export function SidebarDemo() {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");

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
    },
    {
      label: "Settings",
      href: "#",
      icon: (
        <IconSettings className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
      onClick: () => setActiveTab("settings"),
    },
    {
      label: "Logout",
      href: "#",
      icon: (
        <IconArrowLeft className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
    },
  ];

  return (
    <div
      className={cn(
        "mx-auto flex w-full max-w-screen min-h-full flex-1 flex-col overflow-hidden rounded-md border border-neutral-200 bg-gray-100 md:flex-row dark:border-neutral-700 dark:bg-neutral-800",
        "h-[90vh]",
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
                label: "Admin User",
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
        {activeTab === "reports" && <ReportsSection />}
        {activeTab === "settings" && <SettingsSection />}
      </div>
    </div>
  );
}


   


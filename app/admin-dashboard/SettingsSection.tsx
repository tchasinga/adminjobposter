"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Settings Component
const SettingsSection = () => {
    const [notifications, setNotifications] = useState({
      email: true,
      push: false,
      weeklyReport: true,
    });
  
    const handleNotificationChange = (key: keyof typeof notifications) => {
      setNotifications(prev => ({
        ...prev,
        [key]: !prev[key]
      }));
    };
  
    return (
      <div className="flex flex-1 flex-col overflow-y-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Settings</h1>
        
        <div className="bg-white p-6 rounded-lg shadow dark:bg-neutral-800">
          <h2 className="text-xl font-semibold mb-4">Profile Settings</h2>
          
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <img
                src="https://assets.aceternity.com/manu.png"
                className="h-16 w-16 rounded-full"
                alt="Profile"
              />
              <div>
                <Button variant="outline" className="mr-2">Change Photo</Button>
                <Button variant="outline">Remove</Button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">First Name</label>
                <Input placeholder="John" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Last Name</label>
                <Input placeholder="Doe" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <Input placeholder="john.doe@example.com" type="email" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone</label>
                <Input placeholder="+1 (555) 123-4567" type="tel" />
              </div>
            </div>
            
            <div>
              <Button>Update Profile</Button>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow mt-6 dark:bg-neutral-800">
          <h2 className="text-xl font-semibold mb-4">Notification Preferences</h2>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Email Notifications</h4>
                <p className="text-sm text-gray-500">Receive notifications via email</p>
              </div>
              <Button
                variant={notifications.email ? "default" : "outline"}
                onClick={() => handleNotificationChange("email")}
              >
                {notifications.email ? "Enabled" : "Disabled"}
              </Button>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Push Notifications</h4>
                <p className="text-sm text-gray-500">Receive push notifications</p>
              </div>
              <Button
                variant={notifications.push ? "default" : "outline"}
                onClick={() => handleNotificationChange("push")}
              >
                {notifications.push ? "Enabled" : "Disabled"}
              </Button>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Weekly Reports</h4>
                <p className="text-sm text-gray-500">Receive weekly summary reports</p>
              </div>
              <Button
                variant={notifications.weeklyReport ? "default" : "outline"}
                onClick={() => handleNotificationChange("weeklyReport")}
              >
                {notifications.weeklyReport ? "Enabled" : "Disabled"}
              </Button>
            </div>
          </div>
        </div>
      </div>
      )}

export default SettingsSection; // Exporting the SettingsSection component
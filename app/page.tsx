/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { useSelector } from "react-redux";

export default function Home() {
  const currentUser = useSelector((state: any) => state.user?.user?.currentUser);
  const router = useRouter();

  useEffect(() => {
    if (!currentUser) {
      router.push("/login");
    } else {
      router.push("/dashboard");
    }
  }, [currentUser, router]);

  if (!currentUser) {
    return <div className="flex items-center justify-center min-h-screen text-xl">Loading...</div>;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-10">
      <h1 className="text-4xl font-bold text-center">
        {currentUser?.username} Welcome to the Home Page
      </h1>
      <p className="mt-4 text-lg">This is the home page of your application.</p>
      <p className="mt-2 text-lg">You can navigate to the dashboard from here.</p>
      <Link href="/dashboard">
        <Button className="mt-6">Go to Dashboard</Button>
      </Link>
    </div>
  );
}

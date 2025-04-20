/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/rules-of-hooks */
"use client";
import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation'
import { SidebarDemo } from '../Page/SidebarDemo';


export default function Dashboard() {
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


  return (
    <div className="">
     <SidebarDemo />
    </div>
  );
}

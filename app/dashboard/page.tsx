/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/rules-of-hooks */
"use client";
import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { SidebarDemo } from '../Page/SidebarDemo';


export default function Dashboard() {
 const currentUser = useSelector((state: any) => state.user?.user?.currentUser);
   

  const router = useRouter()

  useEffect(() => {
    if (!currentUser) {
      router.push("/login")
    }else{
      router.push('/dashboard')
    }
  }, [currentUser, router])

  if (!currentUser) {
    return <div className='flex flex-col min-h-screen justify-center items-center'>Loading...</div> // Show loading state while checking auth
  }


  return (
    <div className="border-neutral-200 bg-gray-100">
     <SidebarDemo />
    </div>
  );
}

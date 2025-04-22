/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Job from "@/app/models/jobs.models";

// https://kuvosh.vercel.app

// CORS headers configuration
const corsHeaders = {
  "Access-Control-Allow-Origin": "http://localhost:3001",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// POST handler (existing)
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    
    // Verify Content-Type header
    const contentType = request.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      return NextResponse.json(
        { error: 'Content-Type must be application/json' },
        { status: 415, headers: corsHeaders }
      );
    }

    // Safely parse JSON
    let body;
    try {
      body = await request.json();
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid JSON payload' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Validate required fields
    const requiredFields = [
      'title', 'typeofcarees', 'typeofworks', 'typeofsystem',
      'questionone', 'questiontwo', 'country', 'salary',
      'description', 'projectdescription',
      'jobrequirementskills', 'jobresponsibilities',
      'contractTerm'
    ];

    const missingFields = requiredFields.filter(field => !body[field]);
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400, headers: corsHeaders }
      );
    }

    // Create job with explicit field mapping (avoid ...body)
    const newJob = new Job({
      title: body.title,
      typeofcarees: body.typeofcarees,
      typeofworks: body.typeofworks,
      typeofsystem: body.typeofsystem,
      questionone: body.questionone,
      questiontwo: body.questiontwo,
      country: body.country,
      status: body.status || 'active',
      salary: body.salary,
      description: body.description,
      cardImgIcon: body.cardImgIcon || null,  // Handle optional files
      bgdetailspage: body.bgdetailspage || null,
      projectdescription: body.projectdescription,
      jobrequirementskills: body.jobrequirementskills,
      jobresponsibilities: body.jobresponsibilities,
      contractTerm: body.contractTerm
    });

    const savedJob = await newJob.save();

    return NextResponse.json(
      { message: "Job created successfully", job: savedJob },
      { status: 201, headers: corsHeaders }
    );

  } catch (error) {
    console.error("Error creating job:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500, headers: corsHeaders }
    );
  }
}


export async function GET(request: NextRequest) {
    try {
      await connectToDatabase();
      
      const { searchParams } = new URL(request.url);
      
      // Polling parameters
      const poll = searchParams.get('poll');
      const interval = parseInt(searchParams.get('interval') || '2000');
      const maxAttempts = parseInt(searchParams.get('maxAttempts') || '10');
      
      // Filter parameters
      const title = searchParams.get('title');
      const typeofcarees = searchParams.get('typeofcarees');
      const typeofworks = searchParams.get('typeofworks');
      const country = searchParams.get('country');
      const salaryMin = searchParams.get('salaryMin');
      const salaryMax = searchParams.get('salaryMax');
      const contractTerm = searchParams.get('contractTerm');
      
      let lastUpdated = null;
      let attempts = 0;
      let jobs = [];
  
      do {
        // Get the most recent update timestamp first
        const mostRecent = await Job.findOne().sort({ updatedAt: -1 });
        const currentLastUpdated = mostRecent?.updatedAt || null;
        
        // Build filter object
        const filter: any = {};
        
        if (title) filter.title = { $regex: title, $options: 'i' };
        if (typeofcarees) filter.typeofcarees = typeofcarees;
        if (typeofworks) filter.typeofworks = typeofworks;
        if (country) filter.country = country;
        if (contractTerm) filter.contractTerm = contractTerm;
        
        if (salaryMin || salaryMax) {
          filter.salary = {};
          if (salaryMin) filter.salary.$gte = salaryMin;
          if (salaryMax) filter.salary.$lte = salaryMax;
        }
        
        // If this is the first attempt or data has changed
        if (!lastUpdated || (currentLastUpdated && currentLastUpdated > lastUpdated)) {
          jobs = await Job.find(filter).sort({ createdAt: -1 });
          lastUpdated = currentLastUpdated;
          
          // If not polling, return immediately
          if (poll !== 'true') {
            return NextResponse.json(
              { 
                jobs, 
                lastUpdated: lastUpdated?.toISOString(),
                filters: {
                  title,
                  typeofcarees,
                  typeofworks,
                  country,
                  salaryMin,
                  salaryMax,
                  contractTerm
                }
              },
              { status: 200, headers: corsHeaders }
            );
          }
        }
        
        attempts++;
        if (attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, interval));
        }
      } while (poll === 'true' && attempts < maxAttempts);
  
      return NextResponse.json(
        { 
          jobs, 
          lastUpdated: lastUpdated?.toISOString(),
          filters: {
            title,
            typeofcarees,
            typeofworks,
            country,
            salaryMin,
            salaryMax,
            contractTerm
          },
          message: attempts >= maxAttempts ? 'Reached max polling attempts' : 'Data updated'
        },
        { status: 200, headers: corsHeaders }
      );
  
    } catch (error) {
      console.error("Error fetching jobs:", error);
      return NextResponse.json(
        { error: "Failed to fetch jobs" },
        { status: 500, headers: corsHeaders }
      );
    }
}

// Handle OPTIONS requests for CORS preflight
export async function OPTIONS() {
  return NextResponse.json(
    {},
    { 
      status: 200,
      headers: corsHeaders
    }
  );
}
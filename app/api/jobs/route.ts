/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Job from "@/app/models/jobs.models";

// POST handler (existing)
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    const body = await request.json();

    const requiredFields = [
      'title', 'typeofcarees', 'typeofworks', 'typeofsystem', 
      'questionone', 'questiontwo', 'cardImgIcon', 'country', 'salary', 
      'description', 'bgdetailspage', 'projectdescription', 
      'jobrequirementskills', 'jobresponsibilities', 'contractTerm'
    ];

    const missingFields = requiredFields.filter(field => !body[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    const newJob = new Job({
      title: body.title,
      typeofcarees: body.typeofcarees,
      typeofworks: body.typeofworks,
      typeofsystem: body.typeofsystem,
      questionone: body.questionone,
      questiontwo: body.questiontwo,
      country: body.country,
      ...body,
       status: body.status || 'active',
      salary: body.salary,
      description: body.description,
      cardImgIcon: body.cardImgIcon,
      bgdetailspage: body.bgdetailspage,
      projectdescription: body.projectdescription,
      jobrequirementskills: body.jobrequirementskills,
      jobresponsibilities: body.jobresponsibilities,
      contractTerm: body.contractTerm
    });

    const savedJob = await newJob.save();

    return NextResponse.json(
      { message: "Job created successfully", job: savedJob },
      { status: 201 }
    );

  } catch (error) {
    console.error("Error creating job:", error);
    return NextResponse.json(
      { error: "Failed to create job" },
      { status: 500 }
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
              { status: 200 }
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
        { status: 200 }
      );
  
    } catch (error) {
      console.error("Error fetching jobs:", error);
      return NextResponse.json(
        { error: "Failed to fetch jobs" },
        { status: 500 }
      );
    }
  }

  
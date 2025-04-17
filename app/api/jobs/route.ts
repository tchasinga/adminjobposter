import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Job from "@/app/models/jobs.models";

export async function POST(request: NextRequest) {
  try {
    // Connect to MongoDB
    await connectToDatabase();

    // Parse the request body
    const body = await request.json();

    // Validate required fields
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

    // Create a new job
    const newJob = new Job({
      title: body.title,
      typeofcarees: body.typeofcarees,
      typeofworks: body.typeofworks,
      typeofsystem: body.typeofsystem,
      questionone: body.questionone,
      questiontwo: body.questiontwo,
      country: body.country,
      salary: body.salary,
      description: body.description,
      cardImgIcon: body.cardImgIcon,
      bgdetailspage: body.bgdetailspage,
      projectdescription: body.projectdescription,
      jobrequirementskills: body.jobrequirementskills,
      jobresponsibilities: body.jobresponsibilities,
      contractTerm: body.contractTerm
    });

    // Save the job to the database
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
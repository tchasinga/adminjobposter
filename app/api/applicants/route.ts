/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Applicant from "@/app/models/applicants.models";

export async function POST(request: NextRequest) {
  try {
    // Connect to MongoDB
    await connectToDatabase();

    // Parse the request body
    const body = await request.json();

    // Validate required fields
    const requiredFields = [
      'fullname',
      'country',
      'email',
      'salaryExpectation',
      'experienceLevel',
      'availability'
    ];

    const missingFields = requiredFields.filter(field => !body[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Validate status if provided
    if (body.status && !['pending', 'reviewed', 'rejected', 'hired'].includes(body.status)) {
      return NextResponse.json(
        { error: "Invalid status value" },
        { status: 400 }
      );
    }

    // Create new applicant
    const newApplicant = new Applicant({
      fullname: body.fullname,
      country: body.country,
      email: body.email,
      telegramUsername: body.telegramUsername || '',
      appliedJobs: body.appliedJobs || [],
      salaryExpectation: Number(body.salaryExpectation),
      experienceLevel: body.experienceLevel,
      uploadResume: body.uploadResume || '',
      casinoExperience: Boolean(body.casinoExperience) || false,
      strokeIgaming: Boolean(body.strokeIgaming) || false,
      previousCompany: body.previousCompany || '',
      previousAchievements: body.previousAchievements || [],
      availability: body.availability,
      status: body.status || 'pending' // Default to 'pending' if not provided
    });

    // Save to database
    const savedApplicant = await newApplicant.save();

    return NextResponse.json(
      { 
        message: "Applicant created successfully",
        applicant: savedApplicant 
      },
      { status: 201 }
    );

  } catch (error: any) {
    console.error("Error creating applicant:", error);
    
    // Handle duplicate email error
    if (error.code === 11000 && error.keyPattern?.email) {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 409 }
      );
    }

    // Handle validation errors
    if (error.name === 'ValidationError') {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create applicant" },
      { status: 500 }
    );
  }
}
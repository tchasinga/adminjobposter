/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Applicant from "@/app/models/applicants.models";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Connect to MongoDB
    await connectToDatabase();

    // Get the applicant ID from route parameters
    const { id } = params;

    // Validate ID parameter
    if (!id) {
      return NextResponse.json(
        { error: "Applicant ID is required" },
        { status: 400 }
      );
    }

    // Parse the request body
    const body = await request.json();
    const { status } = body;

    // Validate status field
    if (!status) {
      return NextResponse.json(
        { error: "Status is required" },
        { status: 400 }
      );
    }

    // Check if status is valid
    const validStatuses = ['pending', 'reviewed', 'rejected', 'hired'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid status value" },
        { status: 400 }
      );
    }

    // Find and update the applicant's status
    const updatedApplicant = await Applicant.findByIdAndUpdate(
      id,
      { 
        status,
        updatedAt: new Date() // Update the timestamp
      },
      { new: true } // Return the updated document
    );

    // If applicant not found, return 404
    if (!updatedApplicant) {
      return NextResponse.json(
        { error: "Applicant not found" },
        { status: 404 }
      );
    }

    // Return success response with updated applicant
    return NextResponse.json(
      {
        message: "Applicant status updated successfully",
        applicant: updatedApplicant
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error("Error updating applicant status:", error);
    
    // Handle specific error types
    if (error.name === 'CastError') {
      return NextResponse.json(
        { error: "Invalid applicant ID format" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
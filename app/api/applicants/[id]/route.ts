import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Applicant from "@/app/models/applicants.models";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Connect to MongoDB
    await connectToDatabase();

    // Get the applicant ID from the request parameters
    const { id } = params;

    // Validate ID parameter
    if (!id) {
      return NextResponse.json(
        { error: "Applicant ID is required" },
        { status: 400 }
      );
    }

    // Find the applicant by ID
    const applicant = await Applicant.findById(id);

    // If applicant not found, return 404
    if (!applicant) {
      return NextResponse.json(
        { error: "Applicant not found" },
        { status: 404 }
      );
    }

    // Return the applicant data with success message
    return NextResponse.json(
      { 
        message: "Applicant retrieved successfully",
        applicant 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error fetching applicant:", error);
    
    // Handle specific MongoDB CastError (invalid ID format)
    if (error instanceof Error && error.name === 'CastError') {
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
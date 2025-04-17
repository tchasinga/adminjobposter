import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Job from "@/app/models/jobs.models";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { deletebyid: string } }
) {
  try {
    // Connect to MongoDB
    await connectToDatabase();

    // Get the job ID from the dynamic route parameter
    const jobId = params.deletebyid;

    if (!jobId) {
      return NextResponse.json(
        { error: "Job ID is required" },
        { status: 400 }
      );
    }

    // Find and delete the job using _id
    const deletedJob = await Job.findOneAndDelete({ _id: jobId });

    if (!deletedJob) {
      return NextResponse.json(
        { error: "Job not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { 
        message: "Job deleted successfully",
        deletedJob: {
          id: deletedJob._id,
          title: deletedJob.title,
          // include other fields you want to return
        }
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error deleting job:", error);
    return NextResponse.json(
      { error: "Failed to delete job" },
      { status: 500 }
    );
  }
}
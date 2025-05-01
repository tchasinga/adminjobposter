/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Job from "@/app/models/jobs.models";

// Helper function to add CORS headers to responses
const addCorsHeaders = (response: NextResponse) => {
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return response;
};

export async function DELETE(
  request: NextRequest,
  { params }: { params: { deletebyid: string } }
) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action') || 'delete'; // 'close' or 'delete'

  try {
    await connectToDatabase();
    const jobId = params.deletebyid;

    if (!jobId) {
      const response = NextResponse.json(
        { error: "Job ID is required" },
        { status: 400 }
      );
      return addCorsHeaders(response);
    }

    let result;
    
    if (action === 'close') {
      // Soft delete/close the job
      result = await Job.findByIdAndUpdate(
        jobId,
        { 
          status: 'closed',
          closedAt: new Date() 
        },
        { new: true }
      );
    } else {
      // Hard delete the job
      result = await Job.findOneAndDelete({ _id: jobId });
    }

    if (!result) {
      const response = NextResponse.json(
        { error: "Job not found" },
        { status: 404 }
      );
      return addCorsHeaders(response);
    }

    const response = NextResponse.json(
      { 
        message: action === 'close' 
          ? "Job closed successfully" 
          : "Job deleted permanently",
        job: {
          id: result._id,
          title: result.title,
          status: action === 'close' ? 'closed' : 'deleted',
          ...(action === 'close' && { closedAt: result.closedAt })
        }
      },
      { status: 200 }
    );
    return addCorsHeaders(response);

  } catch (error) {
    console.error("Error processing job:", error);
    const response = NextResponse.json(
      { error: `Failed to ${searchParams.get('action') === 'close' ? 'close' : 'delete'} job` },
      { status: 500 }
    );
    return addCorsHeaders(response);
  }
}

// GET data by id
export async function GET(
  request: NextRequest,
  { params }: { params: { deletebyid: string } }
) {
  try {
    await connectToDatabase();
    const jobId = params.deletebyid;

    if (!jobId) {
      const response = NextResponse.json(
        { error: "Job ID is required" },
        { status: 400 }
      );
      return addCorsHeaders(response);
    }

    const job = await Job.findById(jobId);

    if (!job) {
      const response = NextResponse.json(
        { error: "Job not found" },
        { status: 404 }
      );
      return addCorsHeaders(response);
    }

    const response = NextResponse.json(
      { job },
      { status: 200 }
    );
    return addCorsHeaders(response);

  } catch (error) {
    console.error("Error fetching job:", error);
    const response = NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
    return addCorsHeaders(response);
  }
}

// Handle OPTIONS requests for CORS preflight
export async function OPTIONS() {
  const response = new NextResponse(null, { status: 204 });
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return response;
}
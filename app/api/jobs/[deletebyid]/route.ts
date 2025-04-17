/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Job from "@/app/models/jobs.models";

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
      return NextResponse.json(
        { error: "Job ID is required" },
        { status: 400 }
      );
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
      return NextResponse.json(
        { error: "Job not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
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

  } catch (error) {
    console.error("Error processing job:", error);
    return NextResponse.json(
      { error: `Failed to ${searchParams.get('action') === 'close' ? 'close' : 'delete'} job` },
      { status: 500 }
    );
  }
}



// PUT request handler for data updated
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
  ) {
    try {
      console.log("Params:", params); // Log for debugging
      const jobId = params.id;
  
      if (!jobId) {
        return NextResponse.json(
          { error: "Job ID is required for the update" }, // Fixed typo
          { status: 400 }
        );
      }
  
      await connectToDatabase();
  
      const body = await request.json();
      const updatableFields = [
        'title',
        'typeofcarees',
        'typeofworks',
        'typeofsystem',
        'questionone',
        'questiontwo',
        'country',
        'salary',
        'description',
        'cardImgIcon',
        'bgdetailspage',
        'projectdescription',
        'jobrequirementskills',
        'jobresponsibilities',
        'contractTerm',
        'status',
      ];
  
      const updateData: Record<string, any> = {};
      for (const field of updatableFields) {
        if (body[field] !== undefined) {
          updateData[field] = body[field];
        }
      }
      updateData.updatedAt = new Date();
  
      const updatedJob = await Job.findOneAndUpdate(
        { _id: jobId },
        { $set: updateData },
        { new: true, runValidators: true }
      );
  
      if (!updatedJob) {
        return NextResponse.json(
          { error: "Job not found" },
          { status: 404 }
        );
      }
  
      return NextResponse.json(
        { 
          message: "Job updated successfully",
          job: updatedJob 
        },
        { status: 200 }
      );
    } catch (error: any) {
      console.error("Error updating job:", error);
  
      if (error.name === 'ValidationError') {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        );
      }
  
      if (error.name === 'CastError') {
        return NextResponse.json(
          { error: "Invalid Job ID format" },
          { status: 400 }
        );
      }
  
      return NextResponse.json(
        { error: "Failed to update job" },
        { status: 500 }
      );
    }
  }
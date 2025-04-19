// api/dashboard/jobs-chart/route.ts
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Job from "@/app/models/jobs.models";

export async function GET() {
  try {
    await connectToDatabase();

    // Get job counts by different categories
    const jobTypes = await Job.aggregate([
      {
        $group: {
          _id: "$typeofworks",
          count: { $sum: 1 }
        }
      }
    ]);

    const jobCareers = await Job.aggregate([
      {
        $group: {
          _id: "$typeofcarees",
          count: { $sum: 1 }
        }
      }
    ]);

    const jobSystems = await Job.aggregate([
      {
        $group: {
          _id: "$typeofsystem",
          count: { $sum: 1 }
        }
      }
    ]);

    return NextResponse.json({
      success: true,
      data: {
        byType: jobTypes,
        byCareer: jobCareers,
        bySystem: jobSystems
      }
    });
  } catch (error) {
    console.error("Error fetching jobs chart data:", error);
    return NextResponse.json(
      { success: false, message: "Error fetching jobs chart data" },
      { status: 500 }
    );
  }
}
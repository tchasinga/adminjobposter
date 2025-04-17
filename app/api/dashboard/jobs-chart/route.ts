/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Job from "@/app/models/jobs.models";

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    // Aggregate job data by type
    const jobDistribution = await Job.aggregate([
      {
        $group: {
          _id: "$typeofcarees", // Group by job type
          count: { $sum: 1 },    // Count jobs in each category
          avgSalary: { $avg: { $toDouble: { $substr: ["$salary", 1, -1] } } } // Extract numeric salary and average
        }
      },
      {
        $project: {
          type: "$_id",
          count: 1,
          avgSalary: { $round: ["$avgSalary", 2] }, // Round to 2 decimal places
          percentage: { 
            $multiply: [
              { 
                $divide: [
                  "$count",
                  { $sum: "$count" } // Calculate percentage of total
                ]
              },
              100
            ]
          }
        }
      },
      {
        $sort: { count: -1 } // Sort by count descending
      }
    ]);

    // Transform data for charting
    const chartData = {
      labels: jobDistribution.map(job => job.type),
      datasets: [
        {
          label: "Job Distribution",
          data: jobDistribution.map(job => job.count),
          percentages: jobDistribution.map(job => job.percentage.toFixed(1)),
          avgSalaries: jobDistribution.map(job => job.avgSalary),
          backgroundColor: generateChartColors(jobDistribution.length)
        }
      ],
      totalJobs: jobDistribution.reduce((sum, job) => sum + job.count, 0)
    };

    return NextResponse.json({
      success: true,
      data: chartData
    });

  } catch (error) {
    console.error("Jobs chart error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch job distribution data" },
      { status: 500 }
    );
  }
}

// Helper function to generate chart colors
function generateChartColors(count: number) {
  const baseColors = [
    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', 
    '#9966FF', '#FF9F40', '#8AC249', '#EA5545'
  ];
  
  const colors = [];
  for (let i = 0; i < count; i++) {
    colors.push(baseColors[i % baseColors.length]);
  }
  return colors;
}
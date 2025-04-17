/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Job from "@/app/models/jobs.models";
import Applicant from "@/app/models/applicants.models";

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    // Fetch all data in parallel for better performance
    const [
      totalJobs,
      activeJobs,
      jobsByType,
      totalApplicants,
      applicantsByStatus,
      applicantsByExperience,
      recentApplicants,
      popularJobCategories
    ] = await Promise.all([
      // Job Statistics
      Job.countDocuments(),
      Job.countDocuments({ status: 'active' }),
      Job.aggregate([
        { $group: { _id: '$typeofcarees', count: { $sum: 1 } } }
      ]),
      
      // Applicant Statistics
      Applicant.countDocuments(),
      Applicant.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      Applicant.aggregate([
        { $group: { _id: '$experienceLevel', count: { $sum: 1 } } }
      ]),
      
      // Recent Activity
      Applicant.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select('fullname email status createdAt')
        .lean(),
      
      // Popular Categories
      Applicant.aggregate([
        { $unwind: '$appliedJobs' },
        { $group: { _id: '$appliedJobs', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 }
      ])
    ]);

    // Transform data for better client consumption
    const stats = {
      overview: {
        totalJobs,
        activeJobs,
        totalApplicants,
        applicantsThisMonth: await Applicant.countDocuments({
          createdAt: { $gte: new Date(new Date().setDate(1)) }
        })
      },
      jobs: {
        byType: jobsByType.reduce((acc: Record<string, number>, curr) => {
          acc[curr._id] = curr.count;
          return acc;
        }, {})
      },
      applicants: {
        byStatus: applicantsByStatus.reduce((acc: Record<string, number>, curr) => {
          acc[curr._id] = curr.count;
          return acc;
        }, {}),
        byExperience: applicantsByExperience.reduce((acc: Record<string, number>, curr) => {
          acc[curr._id] = curr.count;
          return acc;
        }, {})
      },
      recentActivity: {
        newApplicants: recentApplicants,
        popularCategories: popularJobCategories
      },
      trends: {
        jobsLast30Days: await get30DayTrend(Job),
        applicantsLast30Days: await get30DayTrend(Applicant)
      }
    };

    return NextResponse.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch dashboard stats" },
      { status: 500 }
    );
  }
}

// Helper function to get 30-day trend data
async function get30DayTrend(model: any) {
  const date = new Date();
  date.setDate(date.getDate() - 30);

  return model.aggregate([
    {
      $match: {
        createdAt: { $gte: date }
      }
    },
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
        },
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);
}
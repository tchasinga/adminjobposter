/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import Applicant from "@/app/models/applicants.models";
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const months = parseInt(searchParams.get('months') || '12'); // Default to 12 months
    const groupBy = searchParams.get('groupBy') || 'month'; // month/week/day

    // Validate input
    if (months < 1 || months > 24) {
      return NextResponse.json(
        { error: "Months parameter must be between 1 and 24" },
        { status: 400 }
      );
    }

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    // Determine date format based on grouping
    let dateFormat;
    switch (groupBy) {
      case 'week':
        dateFormat = '%Y-%U'; // Year-Week
        break;
      case 'day':
        dateFormat = '%Y-%m-%d'; // Year-Month-Day
        break;
      case 'month':
      default:
        dateFormat = '%Y-%m'; // Year-Month
    }

    // Aggregate applicant data
    const pipeline = [
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: dateFormat, date: "$createdAt" } },
            status: "$status" // Group by status for breakdown
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { "_id.date": 1 as 1 | -1 }
      }
    ];

    const rawData = await Applicant.aggregate(pipeline);

    // Transform data for charting
    const result = transformChartData(rawData, groupBy, startDate, endDate);

    return NextResponse.json({
      success: true,
      data: result,
      meta: {
        startDate,
        endDate,
        groupBy,
        totalMonths: months
      }
    });

  } catch (error) {
    console.error("Applicants chart error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch chart data" },
      { status: 500 }
    );
  }
}

// Helper function to transform raw aggregation data
function transformChartData(rawData: any[], groupBy: string, startDate: Date, endDate: Date) {
  // Initialize result structure
  const result: any = {
    labels: [],
    datasets: {
      pending: [],
      reviewed: [],
      hired: [],
      rejected: [],
      total: []
    }
  };

  // Create date map for all periods in range
  const dateMap = new Map();
  const currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    let key;
    switch (groupBy) {
      case 'week':
        key = `${currentDate.getFullYear()}-${getWeekNumber(currentDate)}`;
        break;
      case 'day':
        key = currentDate.toISOString().split('T')[0];
        break;
      case 'month':
      default:
        key = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
    }

    if (!dateMap.has(key)) {
      dateMap.set(key, {
        pending: 0,
        reviewed: 0,
        hired: 0,
        rejected: 0,
        total: 0
      });
      result.labels.push(formatLabel(key, groupBy));
    }

    // Move to next period
    groupBy === 'day' 
      ? currentDate.setDate(currentDate.getDate() + 1)
      : groupBy === 'week'
        ? currentDate.setDate(currentDate.getDate() + 7)
        : currentDate.setMonth(currentDate.getMonth() + 1);
  }

  // Populate with actual data
  rawData.forEach(item => {
    const { date, status } = item._id;
    if (dateMap.has(date)) {
      dateMap.get(date)[status] = item.count;
      dateMap.get(date).total += item.count;
    }
  });

  // Convert map to chart datasets
  dateMap.forEach((values, date) => {
    result.datasets.pending.push(values.pending);
    result.datasets.reviewed.push(values.reviewed);
    result.datasets.hired.push(values.hired);
    result.datasets.rejected.push(values.rejected);
    result.datasets.total.push(values.total);
  });

  return result;
}

// Helper to format labels based on grouping
function formatLabel(dateKey: string, groupBy: string) {
  if (groupBy === 'month') {
    const [year, month] = dateKey.split('-');
    return new Date(parseInt(year), parseInt(month) - 1, 1).toLocaleString('default', { month: 'short', year: '2-digit' });
  }
  if (groupBy === 'week') {
    const [year, week] = dateKey.split('-');
    return `W${week} ${year}`;
  }
  return dateKey; // For day grouping
}

// Helper to get week number
function getWeekNumber(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7);
  const week1 = new Date(d.getFullYear(), 0, 4);
  return String(1 + Math.round(((d.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7)).padStart(2, '0');
}
// api/dashboard/jobs-chart/route.ts
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Job from "@/app/models/jobs.models";

export async function GET() {
  try {
    const { db } = await connectToDatabase();
    if (!db) throw new Error("Database connection failed");

    // 1. Get all active jobs
    const activeJobs = await Job.find({ status: "active" }).lean();
    
    // 2. Analyze job distribution by type
    const typeAnalysis = activeJobs.reduce((acc, job) => {
      const type = job.typeofcarees || "Other";
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // 3. Calculate salary statistics
    const salaryAnalysis = activeJobs.reduce((acc, job) => {
      const salary = parseInt(job.salary.replace(/[^0-9]/g, '')) || 0;
      const type = job.typeofcarees || "Other";
      
      if (!acc[type]) {
        acc[type] = {
          total: salary,
          count: 1,
          min: salary,
          max: salary
        };
      } else {
        acc[type].total += salary;
        acc[type].count += 1;
        acc[type].min = Math.min(acc[type].min, salary);
        acc[type].max = Math.max(acc[type].max, salary);
      }
      return acc;
    }, {} as Record<string, { total: number; count: number; min: number; max: number }>);

    // 4. Prepare chart data
    const totalJobs = activeJobs.length;
    const chartData = Object.entries(typeAnalysis).map(([type, count]) => {
      const salaryData = salaryAnalysis[type] || { total: 0, count: 0 };
      return {
        type,
        count,
        percentage: ((count / totalJobs) * 100).toFixed(1) + "%",
        avgSalary: Math.round(salaryData.total / (salaryData.count || 1)),
        minSalary: salaryData.min,
        maxSalary: salaryData.max
      };
    }).sort((a, b) => b.count - a.count);

    return NextResponse.json({
      success: true,
      data: {
        labels: chartData.map(item => item.type),
        datasets: [{
          label: "Job Distribution",
          data: chartData.map(item => item.count),
          percentages: chartData.map(item => item.percentage),
          avgSalaries: chartData.map(item => item.avgSalary),
          minSalaries: chartData.map(item => item.minSalary),
          maxSalaries: chartData.map(item => item.maxSalary),
          backgroundColor: [
            '#0088FE', '#00C49F', '#FFBB28', '#FF8042', 
            '#A28DFF', '#FF6B6B', '#4CAF50', '#9C27B0'
          ]
        }],
        totalJobs,
        lastUpdated: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error("Jobs chart error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate job distribution" },
      { status: 500 }
    );
  }
}
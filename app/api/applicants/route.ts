/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Applicant from "@/app/models/applicants.models";


// POST /api/applicants for creating new applies
export async function POST(request: NextRequest) {
  try {
    // Connect to MongoDB
    await connectToDatabase();

    // Parse the request body
    const body = await request.json();

    // Validate required fields
    const requiredFields = [
      'fullname',
      'country',
      'email',
      'salaryExpectation',
      'experienceLevel',
      'availability'
    ];

    const missingFields = requiredFields.filter(field => !body[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Validate status if provided
    if (body.status && !['pending', 'reviewed', 'rejected', 'hired'].includes(body.status)) {
      return NextResponse.json(
        { error: "Invalid status value" },
        { status: 400 }
      );
    }

    // Create new applicant
    const newApplicant = new Applicant({
      fullname: body.fullname,
      country: body.country,
      email: body.email,
      telegramUsername: body.telegramUsername || '',
      appliedJobs: body.appliedJobs || [],
      salaryExpectation: Number(body.salaryExpectation),
      experienceLevel: body.experienceLevel,
      uploadResume: body.uploadResume || '',
      validedPhonenumber: body.validedPhonenumber || '',
      casinoExperience: Boolean(body.casinoExperience) || false,
      strokeIgaming: Boolean(body.strokeIgaming) || false,
      previousCompany: body.previousCompany || '',
      previousAchievements: body.previousAchievements || [],
      availability: body.availability,
      status: body.status || 'pending' // Default to 'pending' if not provided
    });

    // Save to database
    const savedApplicant = await newApplicant.save();

    return NextResponse.json(
      { 
        message: "Applicant created successfully",
        applicant: savedApplicant 
      },
      { status: 201 }
    );

  } catch (error: any) {
    console.error("Error creating applicant:", error);
    
    // Handle duplicate email error
    if (error.code === 11000 && error.keyPattern?.email) {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 409 }
      );
    }

    // Handle validation errors
    if (error.name === 'ValidationError') {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create applicant" },
      { status: 500 }
    );
  }
}


// GET /api/applicants for getting all applicants and List applicants (search/filter support)

// GET /api/applicants - Get all applicants with optional filtering
export async function GET(request: NextRequest) {
  try {
    // Connect to MongoDB
    await connectToDatabase();

    // Get query parameters
    const { searchParams } = new URL(request.url);
    
    // Pagination parameters (optional)
    const page = parseInt(searchParams.get('page') || '0');
    const limit = parseInt(searchParams.get('limit') || '0');
    const skip = page > 0 ? (page - 1) * limit : 0;

    // Filter parameters (all optional)
    const status = searchParams.get('status');
    const country = searchParams.get('country');
    const experienceLevel = searchParams.get('experienceLevel');
    const minSalary = searchParams.get('minSalary');
    const maxSalary = searchParams.get('maxSalary');
    const searchQuery = searchParams.get('search');
    const hasCasinoExperience = searchParams.get('casinoExperience');
    const hasIgamingExperience = searchParams.get('igamingExperience');
    const availability = searchParams.get('availability');

    // Build filter object (empty by default to get all applicants)
    const filter: Record<string, any> = {};
    
    // Apply filters only if parameters are provided
    if (status) filter.status = status;
    if (country) filter.country = { $regex: country, $options: 'i' };
    if (experienceLevel) filter.experienceLevel = experienceLevel;
    if (availability) filter.availability = availability;
    
    // Salary range filter
    if (minSalary || maxSalary) {
      filter.salaryExpectation = {};
      if (minSalary) filter.salaryExpectation.$gte = Number(minSalary);
      if (maxSalary) filter.salaryExpectation.$lte = Number(maxSalary);
    }

    // Experience filters
    if (hasCasinoExperience) filter.casinoExperience = hasCasinoExperience === 'true';
    if (hasIgamingExperience) filter.strokeIgaming = hasIgamingExperience === 'true';

    // Full-text search across multiple fields
    if (searchQuery) {
      filter.$or = [
        { fullname: { $regex: searchQuery, $options: 'i' } },
        { email: { $regex: searchQuery, $options: 'i' } },
        { previousCompany: { $regex: searchQuery, $options: 'i' } },
        { telegramUsername: { $regex: searchQuery, $options: 'i' } }
      ];
    }

    // Get applicants (with optional pagination)
    let query = Applicant.find(filter).sort({ createdAt: -1 });
    
    // Apply pagination only if requested
    if (page > 0 && limit > 0) {
      query = query.skip(skip).limit(limit);
    }

    const applicants = await query.exec();

    // Get total count (for pagination info)
    const total = page > 0 ? await Applicant.countDocuments(filter) : applicants.length;

    return NextResponse.json({
      success: true,
      data: applicants,
      ...(page > 0 && { // Only include pagination info if pagination was requested
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
          hasNextPage: page * limit < total,
          hasPreviousPage: page > 1
        }
      }),
      filters: {
        status,
        country,
        experienceLevel,
        minSalary,
        maxSalary,
        searchQuery,
        hasCasinoExperience,
        hasIgamingExperience,
        availability
      }
    }, { status: 200 });

  } catch (error: any) {
    console.error("Error fetching applicants:", error);
    return NextResponse.json(
      { 
        success: false,
        error: "Failed to fetch applicants",
        details: error.message 
      },
      { status: 500 }
    );
  }
}
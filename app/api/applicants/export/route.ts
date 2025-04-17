
/* eslint-disable @typescript-eslint/no-explicit-any *//* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Applicant from "@/app/models/applicants.models";
import  {json2csv}  from "json-2-csv";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    // Get export format from query params
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'csv'; // Default to CSV
    
    // Get all applicants (or filtered applicants if needed)
    const applicants = await Applicant.find({}).lean();

    if (applicants.length === 0) {
      return NextResponse.json(
        { error: "No applicants found to export" },
        { status: 404 }
      );
    }

    // Process based on requested format
    switch (format.toLowerCase()) {
      case 'csv':
        return exportToCSV(applicants);
      case 'pdf':
        return await exportToPDF(applicants);
      default:
        return NextResponse.json(
          { error: "Unsupported export format. Use 'csv' or 'pdf'" },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json(
      { error: "Failed to export applicants" },
      { status: 500 }
    );
  }
}

// CSV Export Function
function exportToCSV(applicants: any[]) {
  try {
    // Convert to CSV
    const csv = json2csv(applicants, {
      excludeKeys: ['_id', '__v'], // Exclude MongoDB internal fields
      emptyFieldValue: '' // Handle empty values
    });

    // Create response with CSV file
    const response = new NextResponse(csv);
    response.headers.set('Content-Type', 'text/csv');
    response.headers.set('Content-Disposition', 'attachment; filename=applicants.csv');
    return response;

  } catch (error) {
    throw new Error("CSV conversion failed");
  }
}

// PDF Export Function
async function exportToPDF(applicants: any[]) {
  try {
    // Create a new PDF document
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([600, 800]);
    const { width, height } = page.getSize();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // Add title
    page.drawText('Applicants Export', {
      x: 50,
      y: height - 50,
      size: 20,
      font,
      color: rgb(0, 0, 0)
    });

    // Add applicant data
    let yPosition = height - 80;
    const lineHeight = 15;
    const fontSize = 10;

    applicants.forEach((applicant, index) => {
      // Add applicant header
      page.drawText(`${index + 1}. ${applicant.fullname} (${applicant.email})`, {
        x: 50,
        y: yPosition,
        size: fontSize,
        font,
        color: rgb(0, 0, 0)
      });
      yPosition -= lineHeight;

      // Add details
      const details = [
        `Country: ${applicant.country}`,
        `Status: ${applicant.status}`,
        `Experience: ${applicant.experienceLevel}`,
        `Salary Expectation: ${applicant.salaryExpectation}`
      ];

      details.forEach(detail => {
        page.drawText(detail, {
          x: 60,
          y: yPosition,
          size: fontSize - 2,
          font,
          color: rgb(0.3, 0.3, 0.3)
        });
        yPosition -= lineHeight;
      });

      // Add space between applicants
      yPosition -= lineHeight;

      // Add new page if running out of space
      if (yPosition < 50) {
        yPosition = height - 50;
        pdfDoc.addPage([600, 800]);
      }
    });

    // Save and return the PDF
    const pdfBytes = await pdfDoc.save();
    const response = new NextResponse(pdfBytes);
    response.headers.set('Content-Type', 'application/pdf');
    response.headers.set('Content-Disposition', 'attachment; filename=applicants.pdf');
    return response;

  } catch (error) {
    throw new Error("PDF generation failed");
  }
}
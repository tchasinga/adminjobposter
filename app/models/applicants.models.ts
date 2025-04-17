import { Schema, model, models, Document } from "mongoose";

interface IApplicant extends Document {
    fullname: string;
    country: string;
    email: string;
    telegramUsername: string;
    appliedJobs: string[];
    salaryExpectation: number;
    experienceLevel: string;
    uploadResume: string; // Assuming this will be a URL or file path
    casinoExperience: boolean;
    strokeIgaming: boolean;
    previousCompany: string;
    previousAchievements: string[];
    availability: string; // Assuming availability is a string (e.g., "Full-time", "Part-time")
}

const ApplicantSchema = new Schema<IApplicant>({
    fullname: { type: String, required: true },
    country: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    telegramUsername: { type: String },
    appliedJobs: { type: [String], default: [] },
    salaryExpectation: { type: Number, required: true },
    experienceLevel: { type: String, required: true },
    uploadResume: { type: String },
    casinoExperience: { type: Boolean, default: false },
    strokeIgaming: { type: Boolean, default: false },
    previousCompany: { type: String },
    previousAchievements: { type: [String], default: [] },
    availability: { type: String, required: true },
});

const Applicant =
    models.Applicant || model<IApplicant>("Applicant", ApplicantSchema);

export default Applicant;

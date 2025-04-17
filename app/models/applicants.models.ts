import { Schema, model, models, Document } from "mongoose";

interface IApplicant extends Document {
    fullname: string;
    country: string;
    email: string;
    telegramUsername: string;
    appliedJobs: string[];
    salaryExpectation: number;
    experienceLevel: string;
    uploadResume: string;
    casinoExperience: boolean;
    strokeIgaming: boolean;
    previousCompany: string;
    previousAchievements: string[];
    availability: string;
    status: 'pending' | 'reviewed' | 'rejected' | 'hired';
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
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'rejected', 'hired'],
      default: 'pending'
    }
});

const Applicant = models.Applicant || model<IApplicant>("Applicant", ApplicantSchema);

export default Applicant;
import { Schema, model, models, Document } from 'mongoose';

// Interface for Job document
interface IJob extends Document {
    title: string;
    typeofcarees: string;
    typeofworks: string;
    typeofsystem: string;
    questionone: string;
    questiontwo: string;
    country: string;
    salary: string;
    description: string;
    bgdetailspage: string;
    projectdescription: string;
    jobrequirementskills : string;
    jobresponsibilities : string;
    contractTerm : string;
    createdAt: Date;
    updatedAt: Date;
}



const JobSchema = new Schema<IJob>({
    title: {
        type: String,
        required: [true, 'Title is required'],
    },
    typeofcarees: {
        type: String,
        required: [true, 'Type of careers is required'],
    },
    typeofworks: {
        type: String,
        required: [true, 'Type of works is required'],
    },
    typeofsystem: {
        type: String,
        required: [true, 'Type of system is required'],
    },
    questionone: {
        type: String,
        required: [true, 'Question one is required'],
    },
    questiontwo: {
        type: String,
        required: [true, 'Question two is required'],
    },
    country: {
        type: String,
        required: [true, 'Country is required'],
    },
    salary: {
        type: String,
        required: [true, 'Salary is required'],
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
    },
    bgdetailspage: {
        type: String,
        required: [true, 'Background details page is required'],
    },
    projectdescription: {
        type: String,
        required: [true, 'Project description is required'],
    },
    jobrequirementskills: {
        type: String,
        required: [true, 'Job requirement skills are required'],
    },
    jobresponsibilities: {
        type: String,
        required: [true, 'Job responsibilities are required'],
    },
    contractTerm: {
        type: String,
        required: [true, 'Contract term is required'],
    },
}, { timestamps: true });

const Job = (models.Job || model<IJob>('Job', JobSchema));

export { Job };
export default Job;
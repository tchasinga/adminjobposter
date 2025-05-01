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
    cardImgIcon : string;
    bgdetailspage: string;
    projectdescription: string;
    jobrequirementskills : string;
    jobresponsibilities : string;
    contractTerm : string;
    status: string;
    createdAt: Date;
    updatedAt: Date;
    closedAt?: Date;
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

    cardImgIcon: {
        type: String,
    },

    bgdetailspage: {
        type: String,
    },
    projectdescription: {
        type: String,
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
    status: {
        type: String,
        enum: ['active', 'closed'],
        default: 'active'
      },
      closedAt: {
        type: Date
      }
}, { timestamps: true });

const Job = (models.Job || model<IJob>('Job', JobSchema));

export { Job };
export default Job;
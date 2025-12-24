import mongoose, { Schema, Document } from 'mongoose';

export interface IJob extends Document {
  title: string;
  description: string;
  requirements: string[];
  salaryMin?: number;
  salaryMax?: number;
  currency: string;
  employmentType: 'full-time' | 'part-time' | 'contract' | 'internship';
  location: string;
  remote: boolean;
  status: 'draft' | 'published' | 'closed';
  company: mongoose.Types.ObjectId;
  category: string;
  experienceLevel: 'junior' | 'middle' | 'senior' | 'lead';
  skills: string[];
  applicationsCount: number;
  viewsCount: number;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const JobSchema = new Schema<IJob>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 5,
      maxlength: 100,
      index: true,
    },
    description: {
      type: String,
      required: true,
      minlength: 100,
      maxlength: 5000,
    },
    requirements: {
      type: [String],
      required: true,
      minlength: 1,
    },
    salaryMin: {
      type: Number,
      min: 0,
    },
    salaryMax: {
      type: Number,
      min: 0,
    },
    currency: {
      type: String,
      default: 'USD',
      uppercase: true,
    },
    employmentType: {
      type: String,
      enum: ['full-time', 'part-time', 'contract', 'internship'],
      required: true,
      index: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    remote: {
      type: Boolean,
      default: false,
      index: true,
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'closed'],
      default: 'draft',
      index: true,
    },
    company: {
      type: Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
      index: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    experienceLevel: {
      type: String,
      enum: ['junior', 'middle', 'senior', 'lead'],
      required: true,
      index: true,
    },
    skills: {
      type: [String],
      default: [],
      index: true,
    },
    applicationsCount: {
      type: Number,
      default: 0,
    },
    viewsCount: {
      type: Number,
      default: 0,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

JobSchema.index({ company: 1, status: 1, isDeleted: 1 });
JobSchema.index({ category: 1, location: 1, status: 1, isDeleted: 1 });
JobSchema.index({ skills: 1, status: 1, isDeleted: 1 });
JobSchema.index({ createdAt: -1 });

export const Job = mongoose.model<IJob>('Job', JobSchema);


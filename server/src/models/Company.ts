import mongoose, { Schema, Document } from 'mongoose';

export interface ICompany extends Document {
  name: string;
  description: string;
  website?: string;
  logo?: string;
  industry: string;
  size: 'startup' | 'small' | 'medium' | 'large' | 'enterprise';
  location: string;
  foundedYear?: number;
  owner: mongoose.Types.ObjectId;
  employees?: mongoose.Types.ObjectId[];
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CompanySchema = new Schema<ICompany>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
      index: true,
    },
    description: {
      type: String,
      required: true,
      minlength: 50,
      maxlength: 2000,
    },
    website: {
      type: String,
      trim: true,
    },
    logo: {
      type: String,
    },
    industry: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    size: {
      type: String,
      enum: ['startup', 'small', 'medium', 'large', 'enterprise'],
      required: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    foundedYear: {
      type: Number,
      min: 1800,
      max: new Date().getFullYear(),
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    employees: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
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

CompanySchema.index({ owner: 1, isDeleted: 1 });
CompanySchema.index({ industry: 1, location: 1, isDeleted: 1 });

export const Company = mongoose.model<ICompany>('Company', CompanySchema);


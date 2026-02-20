import mongoose, { Schema, Document } from 'mongoose';

export interface ISource extends Document {
    name: string;
    phoneNumber: string;
    role: 'Trader' | 'Official' | 'Enumerator';
    reliabilityScore: number;
    status: 'active' | 'inactive' | 'suspended';
    submissionCount: number;
    lastSubmission?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const SourceSchema = new Schema<ISource>(
    {
        name: {
            type: String,
            required: [true, 'Source name is required'],
            trim: true,
        },
        phoneNumber: {
            type: String,
            required: [true, 'Phone number is required'],
            unique: true,
            trim: true,
        },
        role: {
            type: String,
            enum: ['Trader', 'Official', 'Enumerator'],
            required: [true, 'Role is required'],
        },
        reliabilityScore: {
            type: Number,
            default: 0.5,
            min: 0,
            max: 1,
        },
        status: {
            type: String,
            enum: ['active', 'inactive', 'suspended'],
            default: 'active',
        },
        submissionCount: {
            type: Number,
            default: 0,
        },
        lastSubmission: {
            type: Date,
        },
    },
    { timestamps: true }
);

SourceSchema.index({ phoneNumber: 1 });
SourceSchema.index({ role: 1, status: 1 });

export default mongoose.model<ISource>('Source', SourceSchema);

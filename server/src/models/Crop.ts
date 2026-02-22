import mongoose, { Schema, Document } from 'mongoose';

export interface ICrop extends Document {
    name: string;
    nameSwahili: string;
    unit: string;
    category: string;
    createdAt: Date;
    updatedAt: Date;
}

const CropSchema = new Schema<ICrop>(
    {
        name: {
            type: String,
            required: [true, 'Crop name is required'],
            unique: true,
            trim: true,
        },
        nameSwahili: {
            type: String,
            required: [true, 'Swahili name is required'],
            trim: true,
        },
        unit: {
            type: String,
            required: [true, 'Unit is required'],
            default: '90kg bag',
        },
        category: {
            type: String,
            enum: ['cereals', 'legumes', 'tubers', 'vegetables', 'fruits', 'other'],
            default: 'cereals',
        },
    },
    { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// Virtual 'code' field derived from crop name
CropSchema.virtual('code').get(function () {
    return this.name?.toLowerCase().replace(/\s+/g, '_');
});

CropSchema.index({ name: 1 });

export default mongoose.model<ICrop>('Crop', CropSchema);

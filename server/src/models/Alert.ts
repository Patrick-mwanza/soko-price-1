import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IAlert extends Document {
    phoneNumber: string;
    cropId: Types.ObjectId;
    marketId: Types.ObjectId;
    targetPrice: number;
    direction: 'above' | 'below';
    active: boolean;
    lastTriggered?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const AlertSchema = new Schema<IAlert>(
    {
        phoneNumber: {
            type: String,
            required: [true, 'Phone number is required'],
            trim: true,
        },
        cropId: {
            type: Schema.Types.ObjectId,
            ref: 'Crop',
            required: [true, 'Crop ID is required'],
        },
        marketId: {
            type: Schema.Types.ObjectId,
            ref: 'Market',
            required: [true, 'Market ID is required'],
        },
        targetPrice: {
            type: Number,
            required: [true, 'Target price is required'],
            min: [0, 'Target price must be positive'],
        },
        direction: {
            type: String,
            enum: ['above', 'below'],
            default: 'above',
        },
        active: {
            type: Boolean,
            default: true,
        },
        lastTriggered: {
            type: Date,
        },
    },
    { timestamps: true }
);

AlertSchema.index({ phoneNumber: 1 });
AlertSchema.index({ cropId: 1, marketId: 1 });
AlertSchema.index({ active: 1 });

export default mongoose.model<IAlert>('Alert', AlertSchema);

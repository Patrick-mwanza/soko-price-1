import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IPrice extends Document {
    cropId: Types.ObjectId;
    marketId: Types.ObjectId;
    price: number;
    date: Date;
    confidenceScore: number;
    approved: boolean;
    sourceId: Types.ObjectId;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}

const PriceSchema = new Schema<IPrice>(
    {
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
        price: {
            type: Number,
            required: [true, 'Price is required'],
            min: [0, 'Price must be positive'],
        },
        date: {
            type: Date,
            default: Date.now,
        },
        confidenceScore: {
            type: Number,
            default: 0.5,
            min: 0,
            max: 1,
        },
        approved: {
            type: Boolean,
            default: false,
        },
        sourceId: {
            type: Schema.Types.ObjectId,
            ref: 'Source',
            required: [true, 'Source ID is required'],
        },
        notes: {
            type: String,
            trim: true,
        },
    },
    { timestamps: true }
);

PriceSchema.index({ cropId: 1, marketId: 1, date: -1 });
PriceSchema.index({ approved: 1 });
PriceSchema.index({ date: -1 });

export default mongoose.model<IPrice>('Price', PriceSchema);

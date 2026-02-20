import mongoose, { Schema, Document } from 'mongoose';

export interface IMarket extends Document {
    name: string;
    county: string;
    region: string;
    coordinates?: {
        lat: number;
        lng: number;
    };
    active: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const MarketSchema = new Schema<IMarket>(
    {
        name: {
            type: String,
            required: [true, 'Market name is required'],
            unique: true,
            trim: true,
        },
        county: {
            type: String,
            required: [true, 'County is required'],
            trim: true,
        },
        region: {
            type: String,
            required: [true, 'Region is required'],
            trim: true,
        },
        coordinates: {
            lat: Number,
            lng: Number,
        },
        active: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

MarketSchema.index({ name: 1 });
MarketSchema.index({ county: 1 });

export default mongoose.model<IMarket>('Market', MarketSchema);

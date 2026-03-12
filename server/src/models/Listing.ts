import mongoose, { Schema, Document } from 'mongoose';

export interface IListing extends Document {
    cropId: mongoose.Types.ObjectId;
    sellerId: mongoose.Types.ObjectId;
    quantity: number;
    unit: string;
    price: number;
    location: string;
    phoneNumber: string;
    notes?: string;
    status: 'active' | 'sold';
    createdAt: Date;
    updatedAt: Date;
}

const ListingSchema = new Schema<IListing>(
    {
        cropId: {
            type: Schema.Types.ObjectId,
            ref: 'Crop',
            required: [true, 'Crop is required'],
        },
        sellerId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Seller is required'],
        },
        quantity: {
            type: Number,
            required: [true, 'Quantity is required'],
            min: [1, 'Quantity must be at least 1'],
        },
        unit: {
            type: String,
            required: [true, 'Unit is required'],
            trim: true,
        },
        price: {
            type: Number,
            required: [true, 'Price is required'],
            min: [0, 'Price must be positive'],
        },
        location: {
            type: String,
            required: [true, 'Location is required'],
            trim: true,
        },
        phoneNumber: {
            type: String,
            required: [true, 'Phone number is required'],
            trim: true,
        },
        notes: {
            type: String,
            trim: true,
            maxlength: 500,
        },
        status: {
            type: String,
            enum: ['active', 'sold'],
            default: 'active',
        },
    },
    { timestamps: true }
);

ListingSchema.index({ cropId: 1 });
ListingSchema.index({ sellerId: 1 });
ListingSchema.index({ status: 1 });
ListingSchema.index({ location: 1 });
ListingSchema.index({ price: 1 });

export default mongoose.model<IListing>('Listing', ListingSchema);

import { Response } from 'express';
import Listing from '../models/Listing';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth';

// Create a new listing (Farmer/Trader)
export const createListing = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { cropId, quantity, unit, price, location, phoneNumber, notes } = req.body;
        const listing = await Listing.create({
            cropId,
            sellerId: req.user!._id,
            quantity,
            unit,
            price,
            location,
            phoneNumber,
            notes,
        });
        res.status(201).json(listing);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// Get all listings with filters (public)
export const getListings = async (req: any, res: Response): Promise<void> => {
    try {
        const { cropId, location, minPrice, maxPrice, status } = req.query;
        const filter: any = { status: status || 'active' };

        if (cropId) filter.cropId = cropId;
        if (location) filter.location = { $regex: location, $options: 'i' };
        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice) filter.price.$gte = Number(minPrice);
            if (maxPrice) filter.price.$lte = Number(maxPrice);
        }

        const listings = await Listing.find(filter)
            .populate('cropId', 'name unit')
            .populate('sellerId', 'name phoneNumber')
            .sort({ createdAt: -1 })
            .limit(100);

        res.json(listings);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// Get single listing
export const getListingById = async (req: any, res: Response): Promise<void> => {
    try {
        const listing = await Listing.findById(req.params.id)
            .populate('cropId', 'name unit')
            .populate('sellerId', 'name phoneNumber');

        if (!listing) {
            res.status(404).json({ message: 'Listing not found' });
            return;
        }
        res.json(listing);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// Update listing status (owner only)
export const updateListingStatus = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const listing = await Listing.findById(req.params.id);
        if (!listing) {
            res.status(404).json({ message: 'Listing not found' });
            return;
        }
        if (listing.sellerId.toString() !== (req.user!._id as any).toString()) {
            res.status(403).json({ message: 'Not authorized to update this listing' });
            return;
        }

        listing.status = req.body.status;
        await listing.save();
        res.json(listing);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// Delete listing (owner or admin)
export const deleteListing = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const listing = await Listing.findById(req.params.id);
        if (!listing) {
            res.status(404).json({ message: 'Listing not found' });
            return;
        }

        const isOwner = listing.sellerId.toString() === (req.user!._id as any).toString();
        const isAdmin = req.user!.role === 'Admin';

        if (!isOwner && !isAdmin) {
            res.status(403).json({ message: 'Not authorized to delete this listing' });
            return;
        }

        await Listing.findByIdAndDelete(req.params.id);
        res.json({ message: 'Listing removed' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// Mark listing as interested (Buyer/Trader)
export const markInterested = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const listing = await Listing.findById(req.params.id)
            .populate('sellerId', 'name phoneNumber');
        if (!listing) {
            res.status(404).json({ message: 'Listing not found' });
            return;
        }
        // Return seller contact info
        res.json({
            message: 'Interest registered',
            sellerContact: {
                name: (listing.sellerId as any).name,
                phoneNumber: (listing.sellerId as any).phoneNumber || listing.phoneNumber,
            },
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// Get my listings (authenticated user)
export const getMyListings = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const listings = await Listing.find({ sellerId: req.user!._id })
            .populate('cropId', 'name unit')
            .sort({ createdAt: -1 });
        res.json(listings);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// ====== ADMIN ENDPOINTS ======

// Admin: Get all listings
export const adminGetAllListings = async (_req: any, res: Response): Promise<void> => {
    try {
        const listings = await Listing.find()
            .populate('cropId', 'name unit')
            .populate('sellerId', 'name email phoneNumber role active')
            .sort({ createdAt: -1 });
        res.json(listings);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// Admin: Remove listing
export const adminRemoveListing = async (req: any, res: Response): Promise<void> => {
    try {
        const listing = await Listing.findByIdAndDelete(req.params.id);
        if (!listing) {
            res.status(404).json({ message: 'Listing not found' });
            return;
        }
        res.json({ message: 'Listing removed by admin' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// Admin: Suspend/activate user
export const suspendUser = async (req: any, res: Response): Promise<void> => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        if (user.role === 'Admin') {
            res.status(403).json({ message: 'Cannot suspend admin users' });
            return;
        }
        user.active = req.body.active !== undefined ? req.body.active : !user.active;
        await user.save();
        res.json({ message: `User ${user.active ? 'activated' : 'suspended'}`, user: { id: user._id, name: user.name, active: user.active } });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

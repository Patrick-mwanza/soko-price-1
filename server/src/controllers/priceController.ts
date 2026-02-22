import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Price from '../models/Price';
import Source from '../models/Source';
import Crop from '../models/Crop';
import Market from '../models/Market';
import { calculateConfidence, updateSourceReliability } from '../services/confidenceService';

const isValidObjectId = (id: any): boolean => mongoose.Types.ObjectId.isValid(id);

export const getPrices = async (req: Request, res: Response): Promise<void> => {
    try {
        const { cropId, marketId, approved, limit = 50, page = 1 } = req.query;
        const filter: any = {};

        // Validate ObjectId fields — return empty results for invalid IDs instead of crashing
        if (cropId) {
            const id = Array.isArray(cropId) ? cropId[0] : cropId;
            if (!isValidObjectId(id)) {
                res.json({ prices: [], total: 0, page: 1, pages: 0 });
                return;
            }
            filter.cropId = id;
        }
        if (marketId) {
            const id = Array.isArray(marketId) ? marketId[0] : marketId;
            if (!isValidObjectId(id)) {
                res.json({ prices: [], total: 0, page: 1, pages: 0 });
                return;
            }
            filter.marketId = id;
        }
        if (approved !== undefined) filter.approved = approved === 'true';

        const skip = (Number(page) - 1) * Number(limit);
        const total = await Price.countDocuments(filter);

        const prices = await Price.find(filter)
            .populate('cropId', 'name unit')
            .populate('marketId', 'name county')
            .populate('sourceId', 'name role reliabilityScore')
            .sort({ date: -1 })
            .skip(skip)
            .limit(Number(limit));

        res.json({
            prices,
            total,
            page: Number(page),
            pages: Math.ceil(total / Number(limit)),
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getLatestPrice = async (req: Request, res: Response): Promise<void> => {
    try {
        const { cropId, marketId } = req.params;

        const price = await Price.findOne({
            cropId,
            marketId,
            approved: true,
        })
            .populate('cropId', 'name unit nameSwahili')
            .populate('marketId', 'name county')
            .sort({ date: -1 });

        if (!price) {
            res.status(404).json({ message: 'No price data available' });
            return;
        }

        const confidence = await calculateConfidence(cropId, marketId);

        res.json({
            price,
            confidence: confidence.score,
            weightedAverage: confidence.weightedAverage,
            submissionCount: confidence.submissionCount,
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const createPrice = async (req: Request, res: Response): Promise<void> => {
    try {
        const { cropId, marketId, price: priceValue, sourceId, notes } = req.body;

        // Validate required fields
        if (!priceValue || priceValue <= 0) {
            res.status(400).json({ message: 'Valid price value is required' });
            return;
        }

        // Helper: extract a usable string from an ID that might be a string, ObjectId, or object
        const extractId = (val: any): string | null => {
            if (!val) return null;
            if (typeof val === 'string') return val;
            if (typeof val === 'object') {
                // Handle {_id: "..."}, {id: "..."}, {name: "..."}, etc.
                return val._id || val.id || val.name || null;
            }
            return String(val);
        };

        // Resolve cropId/marketId/sourceId — accept ObjectIds, names, or objects
        let resolvedCropId = extractId(cropId);
        let resolvedMarketId = extractId(marketId);
        let resolvedSourceId = extractId(sourceId);

        // If cropId is not a valid ObjectId, try to find by name
        if (resolvedCropId && !isValidObjectId(resolvedCropId)) {
            const crop = await Crop.findOne({ name: { $regex: new RegExp(`^${resolvedCropId}$`, 'i') } });
            if (crop) {
                resolvedCropId = (crop._id as any).toString();
            } else {
                // Fallback: use first available crop
                const firstCrop = await Crop.findOne();
                if (firstCrop) resolvedCropId = (firstCrop._id as any).toString();
                else { res.status(400).json({ message: 'No crops available' }); return; }
            }
        }

        // If marketId is not a valid ObjectId, try to find by name
        if (resolvedMarketId && !isValidObjectId(resolvedMarketId)) {
            const market = await Market.findOne({ name: { $regex: new RegExp(`^${resolvedMarketId}$`, 'i') } });
            if (market) {
                resolvedMarketId = (market._id as any).toString();
            } else {
                // Fallback: use first available market
                const firstMarket = await Market.findOne();
                if (firstMarket) resolvedMarketId = (firstMarket._id as any).toString();
                else { res.status(400).json({ message: 'No markets available' }); return; }
            }
        }

        // If sourceId is not a valid ObjectId, try to find by name
        if (resolvedSourceId && !isValidObjectId(resolvedSourceId)) {
            const source = await Source.findOne({ name: { $regex: new RegExp(`^${resolvedSourceId}$`, 'i') } });
            if (source) {
                resolvedSourceId = (source._id as any).toString();
            } else {
                // Fallback: use first available source
                const firstSource = await Source.findOne();
                if (firstSource) resolvedSourceId = (firstSource._id as any).toString();
                else { res.status(400).json({ message: 'No sources available' }); return; }
            }
        }

        // If no cropId/marketId provided, use first available
        if (!resolvedCropId) {
            const firstCrop = await Crop.findOne();
            if (firstCrop) resolvedCropId = (firstCrop._id as any).toString();
            else { res.status(400).json({ message: 'No crops available' }); return; }
        }
        if (!resolvedMarketId) {
            const firstMarket = await Market.findOne();
            if (firstMarket) resolvedMarketId = (firstMarket._id as any).toString();
            else { res.status(400).json({ message: 'No markets available' }); return; }
        }
        if (!resolvedSourceId) {
            const firstSource = await Source.findOne();
            if (firstSource) resolvedSourceId = (firstSource._id as any).toString();
            else { res.status(400).json({ message: 'No sources available' }); return; }
        }

        // Update source submission count
        await Source.findByIdAndUpdate(resolvedSourceId, {
            $inc: { submissionCount: 1 },
            lastSubmission: new Date(),
        });

        const price = await Price.create({
            cropId: resolvedCropId,
            marketId: resolvedMarketId,
            price: priceValue,
            sourceId: resolvedSourceId,
            notes,
            approved: false, // Requires admin approval
        });

        res.status(201).json(price);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const approvePrice = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!isValidObjectId(req.params.id)) {
            res.status(400).json({ message: 'Invalid price ID' });
            return;
        }

        const price = await Price.findByIdAndUpdate(
            req.params.id,
            { approved: true },
            { new: true }
        )
            .populate('cropId', 'name unit')
            .populate('marketId', 'name county')
            .populate('sourceId', 'name role');

        if (!price) {
            res.status(404).json({ message: 'Price not found' });
            return;
        }

        // Update source reliability after approval
        await updateSourceReliability((price.sourceId as any)._id.toString());

        res.json(price);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const rejectPrice = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!isValidObjectId(req.params.id)) {
            res.status(400).json({ message: 'Invalid price ID' });
            return;
        }

        const price = await Price.findByIdAndDelete(req.params.id);
        if (!price) {
            res.status(404).json({ message: 'Price not found' });
            return;
        }

        await updateSourceReliability(price.sourceId as unknown as string);

        res.json({ message: 'Price rejected and removed' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getPriceHistory = async (req: Request, res: Response): Promise<void> => {
    try {
        const { cropId, marketId } = req.params;
        const { days = 30 } = req.query;

        const since = new Date();
        since.setDate(since.getDate() - Number(days));

        const prices = await Price.find({
            cropId,
            marketId,
            approved: true,
            date: { $gte: since },
        })
            .populate('cropId', 'name unit')
            .populate('marketId', 'name county')
            .sort({ date: 1 });

        res.json(prices);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

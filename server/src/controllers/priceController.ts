import { Request, Response } from 'express';
import Price from '../models/Price';
import Source from '../models/Source';
import { calculateConfidence, updateSourceReliability } from '../services/confidenceService';

export const getPrices = async (req: Request, res: Response): Promise<void> => {
    try {
        const { cropId, marketId, approved, limit = 50, page = 1 } = req.query;
        const filter: any = {};

        if (cropId) filter.cropId = cropId;
        if (marketId) filter.marketId = marketId;
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

        // Update source submission count
        await Source.findByIdAndUpdate(sourceId, {
            $inc: { submissionCount: 1 },
            lastSubmission: new Date(),
        });

        const price = await Price.create({
            cropId,
            marketId,
            price: priceValue,
            sourceId,
            notes,
            approved: false, // Requires admin approval
        });

        await price.populate('cropId', 'name unit');
        await price.populate('marketId', 'name county');

        res.status(201).json(price);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const approvePrice = async (req: Request, res: Response): Promise<void> => {
    try {
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

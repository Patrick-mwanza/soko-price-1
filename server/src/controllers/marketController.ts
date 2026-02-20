import { Request, Response } from 'express';
import Market from '../models/Market';

export const getMarkets = async (_req: Request, res: Response): Promise<void> => {
    try {
        const markets = await Market.find({ active: true }).sort({ name: 1 });
        res.json(markets);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getMarket = async (req: Request, res: Response): Promise<void> => {
    try {
        const market = await Market.findById(req.params.id);
        if (!market) {
            res.status(404).json({ message: 'Market not found' });
            return;
        }
        res.json(market);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const createMarket = async (req: Request, res: Response): Promise<void> => {
    try {
        const market = await Market.create(req.body);
        res.status(201).json(market);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const updateMarket = async (req: Request, res: Response): Promise<void> => {
    try {
        const market = await Market.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!market) {
            res.status(404).json({ message: 'Market not found' });
            return;
        }
        res.json(market);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteMarket = async (req: Request, res: Response): Promise<void> => {
    try {
        const market = await Market.findByIdAndDelete(req.params.id);
        if (!market) {
            res.status(404).json({ message: 'Market not found' });
            return;
        }
        res.json({ message: 'Market deleted' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

import { Request, Response } from 'express';
import Crop from '../models/Crop';

export const getCrops = async (_req: Request, res: Response): Promise<void> => {
    try {
        const crops = await Crop.find().sort({ name: 1 });
        res.json(crops);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getCrop = async (req: Request, res: Response): Promise<void> => {
    try {
        const crop = await Crop.findById(req.params.id);
        if (!crop) {
            res.status(404).json({ message: 'Crop not found' });
            return;
        }
        res.json(crop);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const createCrop = async (req: Request, res: Response): Promise<void> => {
    try {
        const crop = await Crop.create(req.body);
        res.status(201).json(crop);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const updateCrop = async (req: Request, res: Response): Promise<void> => {
    try {
        const crop = await Crop.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!crop) {
            res.status(404).json({ message: 'Crop not found' });
            return;
        }
        res.json(crop);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteCrop = async (req: Request, res: Response): Promise<void> => {
    try {
        const crop = await Crop.findByIdAndDelete(req.params.id);
        if (!crop) {
            res.status(404).json({ message: 'Crop not found' });
            return;
        }
        res.json({ message: 'Crop deleted' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

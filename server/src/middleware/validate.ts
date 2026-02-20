import { Request, Response, NextFunction } from 'express';

export const validateRequired = (fields: string[]) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        const missing: string[] = [];
        for (const field of fields) {
            if (!req.body[field] && req.body[field] !== 0) {
                missing.push(field);
            }
        }
        if (missing.length > 0) {
            res.status(400).json({
                message: `Missing required fields: ${missing.join(', ')}`,
            });
            return;
        }
        next();
    };
};

export const sanitizePhone = (phone: string): string => {
    let cleaned = phone.replace(/\s+/g, '').replace(/-/g, '');
    if (cleaned.startsWith('0')) {
        cleaned = '+254' + cleaned.substring(1);
    } else if (cleaned.startsWith('254')) {
        cleaned = '+' + cleaned;
    } else if (!cleaned.startsWith('+')) {
        cleaned = '+254' + cleaned;
    }
    return cleaned;
};

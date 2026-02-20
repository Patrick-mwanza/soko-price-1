import dotenv from 'dotenv';
dotenv.config();

interface EnvConfig {
    PORT: number;
    NODE_ENV: string;
    MONGODB_URI: string;
    JWT_SECRET: string;
    JWT_EXPIRES_IN: string;
    AT_API_KEY: string;
    AT_USERNAME: string;
    AT_SENDER_ID: string;
    USSD_SERVICE_CODE: string;
    CLIENT_URL: string;
    ADMIN_EMAIL: string;
    ADMIN_PASSWORD: string;
    ADMIN_PHONE: string;
}

export const env: EnvConfig = {
    PORT: parseInt(process.env.PORT || '5000', 10),
    NODE_ENV: process.env.NODE_ENV || 'development',
    MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/sokoprice',
    JWT_SECRET: process.env.JWT_SECRET || 'default-dev-secret',
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
    AT_API_KEY: process.env.AT_API_KEY || '',
    AT_USERNAME: process.env.AT_USERNAME || 'sandbox',
    AT_SENDER_ID: process.env.AT_SENDER_ID || 'SokoPrice',
    USSD_SERVICE_CODE: process.env.USSD_SERVICE_CODE || '*789#',
    CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
    ADMIN_EMAIL: process.env.ADMIN_EMAIL || 'admin@sokoprice.co.ke',
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || 'Admin@123456',
    ADMIN_PHONE: process.env.ADMIN_PHONE || '+254700000000',
};

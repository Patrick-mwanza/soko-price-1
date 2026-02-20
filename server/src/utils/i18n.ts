type Language = 'en' | 'sw';

interface Messages {
    [key: string]: {
        en: string;
        sw: string;
    };
}

const messages: Messages = {
    welcome: {
        en: 'Welcome to SokoPrice 🌾\n1. Check market prices\n2. Submit today\'s price\n3. Language (Lugha)',
        sw: 'Karibu SokoPrice 🌾\n1. Angalia bei za soko\n2. Tuma bei ya leo\n3. Language (Lugha)',
    },
    selectCrop: {
        en: 'Select crop:\n1. Maize\n2. Beans\n3. Rice\n4. Potatoes\n5. Wheat\n6. Tomatoes',
        sw: 'Chagua mazao:\n1. Mahindi\n2. Maharage\n3. Mchele\n4. Viazi\n5. Ngano\n6. Nyanya',
    },
    selectMarket: {
        en: 'Select market:\n1. Wakulima (Nairobi)\n2. Eldoret\n3. Kisumu\n4. Nakuru\n5. Mombasa',
        sw: 'Chagua soko:\n1. Wakulima (Nairobi)\n2. Eldoret\n3. Kisumu\n4. Nakuru\n5. Mombasa',
    },
    enterPrice: {
        en: 'Enter price in KSh:',
        sw: 'Ingiza bei kwa KSh:',
    },
    confirmSubmission: {
        en: 'Confirm submission?\n1. Yes\n2. No',
        sw: 'Thibitisha kutuma?\n1. Ndio\n2. Hapana',
    },
    submissionSuccess: {
        en: 'Thank you! Price submitted for review.',
        sw: 'Asante! Bei imetumwa kwa ukaguzi.',
    },
    submissionCancelled: {
        en: 'Submission cancelled.',
        sw: 'Utumaji umesitishwa.',
    },
    selectLanguage: {
        en: 'Select language:\n1. English\n2. Kiswahili',
        sw: 'Chagua lugha:\n1. English\n2. Kiswahili',
    },
    languageSet: {
        en: 'Language set to English',
        sw: 'Lugha imewekwa Kiswahili',
    },
    invalidInput: {
        en: 'Invalid selection. Please try again.',
        sw: 'Chaguo batili. Tafadhali jaribu tena.',
    },
    noPriceData: {
        en: 'No price data available for this selection.',
        sw: 'Hakuna data ya bei kwa chaguo hili.',
    },
    getSMS: {
        en: '\n1. Get SMS copy\n0. Back',
        sw: '\n1. Pata nakala ya SMS\n0. Rudi',
    },
    smsSent: {
        en: 'SMS sent to your phone!',
        sw: 'SMS imetumwa kwa simu yako!',
    },
    confidence: {
        en: 'Confidence',
        sw: 'Uhakika',
    },
    updated: {
        en: 'Updated',
        sw: 'Imesasishwa',
    },
    per: {
        en: 'per',
        sw: 'kwa',
    },
};

export const t = (key: string, lang: Language = 'en'): string => {
    if (messages[key]) {
        return messages[key][lang] || messages[key]['en'];
    }
    return key;
};

export const getConfidenceLabel = (score: number, lang: Language = 'en'): string => {
    if (score >= 0.8) return lang === 'sw' ? 'Juu' : 'High';
    if (score >= 0.5) return lang === 'sw' ? 'Wastani' : 'Medium';
    return lang === 'sw' ? 'Chini' : 'Low';
};

export const formatPrice = (price: number): string => {
    return `KSh ${price.toLocaleString('en-KE')}`;
};

export const formatDate = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (hours < 1) return 'Just now';
    if (hours < 24) return `Today ${date.toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' })}`;
    return date.toLocaleDateString('en-KE', { month: 'short', day: 'numeric' });
};

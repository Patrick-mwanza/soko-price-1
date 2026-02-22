# SokoPrice 🌾

**Real-time Agricultural Market Price Platform for Kenya**

SokoPrice enables Kenyan farmers to check crop prices via USSD (basic phones), receive SMS alerts, and provides web dashboards for admins and buyers/NGOs.

---

## 🏗️ Architecture

```
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│  USSD Users  │   │  Web Admin   │   │  Buyer/NGO   │
│  (Basic      │   │  Dashboard   │   │  Dashboard   │
│   Phones)    │   │  (React)     │   │  (React)     │
└──────┬───────┘   └──────┬───────┘   └──────┬───────┘
       │                  │                  │
       ▼                  ▼                  ▼
┌─────────────────────────────────────────────────────┐
│              Express.js REST API (TypeScript)       │
│  ┌─────────┐ ┌──────┐ ┌──────┐ ┌─────────────────┐ │
│  │  USSD   │ │ Auth │ │ CRUD │ │  Confidence     │ │
│  │Controller│ │ JWT  │ │ APIs │ │  Scoring Engine │ │
│  └─────────┘ └──────┘ └──────┘ └─────────────────┘ │
│  ┌──────────┐ ┌────────────┐ ┌────────────────────┐ │
│  │ SMS Svc  │ │ Alert Svc  │ │ Africa's Talking  │ │
│  └──────────┘ └────────────┘ └────────────────────┘ │
└──────────────────────┬──────────────────────────────┘
                       │
                       ▼
              ┌──────────────┐
              │   MongoDB    │
              └──────────────┘
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- npm

### 1. Clone & Setup

```bash
# Copy environment variables
cp .env.example server/.env

# Edit server/.env with your settings
```

### 2. Backend

```bash
cd server
npm install
npm run seed    # Seed database with sample data
npm run dev     # Start dev server on port 5000
```

### 3. Frontend

```bash
cd client
npm install
npm run dev     # Start dev server on port 5173
```

### 4. Access

| Interface | URL | Credentials |
|-----------|-----|-------------|
| Admin Dashboard | http://localhost:5173/login | admin@sokoprice.co.ke / Admin@123456 |
| Buyer Dashboard | http://localhost:5173/login | buyer@sokoprice.co.ke / Buyer@123456 |
| API Health | http://localhost:5000/api/health | — |

---

## 📱 USSD Integration

### Africa's Talking Sandbox

1. Create an account at [africastalking.com](https://africastalking.com)
2. Get your sandbox API key
3. Set `AT_API_KEY` and `AT_USERNAME=sandbox` in `.env`
4. Point the USSD callback URL to: `https://your-domain.com/api/ussd`

### USSD Flow

```
*789# → Welcome to SokoPrice
        1. Check market prices
        2. Submit today's price
        3. Language

1 → Select crop:        2 → Select crop:
    1. Maize                 (same options)
    2. Beans              → Select market
    3. Rice               → Enter price (KSh)
    4. Potatoes           → Confirm
  → Select market:       → Stored as pending
    1. Wakulima
    2. Eldoret
  → Maize — Wakulima
    KSh 3,500 per 90kg
    Confidence: High
    1. Get SMS copy
```

### Safaricom Production

To deploy with a live Safaricom USSD shortcode:
1. Apply for a USSD service code via Safaricom Business
2. Configure the callback URL to your production API
3. The API handles the same `sessionId`, `phoneNumber`, `text` format

---

## 📡 API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | Public | Register user |
| POST | `/api/auth/login` | Public | Login |
| GET | `/api/auth/me` | JWT | Current user |
| GET | `/api/crops` | Public | List crops |
| GET | `/api/markets` | Public | List markets |
| GET | `/api/prices` | Public | List prices (filtered) |
| GET | `/api/prices/latest/:cropId/:marketId` | Public | Latest price |
| POST | `/api/prices` | Public | Submit price |
| PATCH | `/api/prices/:id/approve` | Admin | Approve price |
| GET | `/api/analytics/overview` | JWT | Dashboard stats |
| GET | `/api/analytics/trends` | JWT | Price trends |
| GET | `/api/analytics/compare` | JWT | Market comparison |
| POST | `/api/ussd` | Public | USSD callback |
| POST | `/api/alerts` | JWT | Create alert |

---

## 🐳 Docker Deployment

```bash
# Build and run all services
docker-compose up -d

# Seed the database
docker exec sokoprice-server node dist/seed.js

# Access at http://localhost
```

---

## 🔐 Security

- JWT authentication with role-based access (Farmer, Admin, Buyer)
- Password hashing with bcrypt (12 rounds)
- Rate limiting (100 req/15min API, 60 req/min USSD)
- Helmet security headers
- CORS configured
- Input validation on all endpoints

---

## ⚡ Confidence Scoring

Price reliability is calculated using:
- **Submission count** (30% weight) — more reports = higher confidence
- **Source reliability** (40% weight) — based on historical approval rate
- **Price variance** (30% weight) — lower variance = higher confidence

Approved price = weighted average by source reliability.

---

## 🌍 Localization

- English and Swahili for all USSD/SMS content
- Kenyan Shilling (KSh) formatting
- East Africa Time (EAT) timestamps
- Optimized for telecom session limits

---

## 📁 Project Structure

```
├── server/                   # Backend
│   ├── src/
│   │   ├── config/           # DB, environment
│   │   ├── controllers/      # Request handlers
│   │   ├── middleware/       # Auth, rate limit, validation
│   │   ├── models/           # Mongoose schemas
│   │   ├── routes/           # Route definitions
│   │   ├── services/         # Business logic
│   │   ├── utils/            # i18n helpers
│   │   ├── seed.ts           # Database seeder
│   │   └── index.ts          # Entry point
│   └── Dockerfile
├── client/                   # Frontend
│   ├── src/
│   │   ├── context/          # Auth context
│   │   ├── pages/            # React pages
│   │   ├── services/         # API client
│   │   └── App.tsx           # Routing
│   ├── nginx.conf
│   └── Dockerfile
├── docker-compose.yml
└── .env.example
```

## 📄 License

MIT © SokoPrice

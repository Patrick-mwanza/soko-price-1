# 🌾 SokoPrice — Agricultural Market Price Platform

SokoPrice is a full-stack web platform that provides **real-time agricultural market prices** for farmers, buyers, and NGOs across Kenya. It bridges the information gap between rural farmers and urban markets by delivering price data through both a modern web dashboard and **USSD access** for basic phone users.

## 🎯 What It Does

- **Farmers** check today's crop prices across multiple markets — no login needed
- **Buyers & NGOs** access detailed reports, analytics, and historical trends
- **Admins** manage crops, markets, sources, and approve submitted prices
- **USSD users** dial a shortcode from any phone to get prices via text menus

## 📲 How to Use USSD

Access real-time crop prices from **any phone** — no internet or smartphone required.

1. **Dial `*384*474718#`** on your phone keypad (Safaricom · Airtel · Telkom)
2. **Select Language** — Choose English or Swahili
3. **Choose a Crop** — Pick from the available list (e.g. Maize, Beans, Rice)
4. **Select a Market** — Choose your nearest market
5. **Get Prices** — Latest prices are displayed instantly via the USSD menu

> 💡 You can also subscribe to **SMS price alerts** to receive daily updates without dialing each time.

## 🎥 Demo Video

[https://github.com/Patrick-mwanza/soko-price-1/raw/main/demo.mp4](https://github.com/user-attachments/assets/939cedfd-ccfb-4b75-9c8c-fc65747bf725)


## 📱 Key Features

| Feature | Description |
|---------|-------------|
| **Public Farmer Dashboard** | View prices, charts, market comparisons — no account required |
| **Admin Dashboard** | Full CRUD for crops, markets, sources, and price management |
| **Buyer Dashboard** | Market analytics and reporting for buyers and NGOs |
| **USSD Integration** | Access prices via `*384*474718#` on any mobile phone (Africa's Talking) |
| **SMS Alerts** | Price notification system for subscribed users |
| **Confidence Scoring** | Reliability ratings based on source history and cross-validation |
| **CSV Export** | Download price data for offline analysis |
| **Bilingual Support** | English and Swahili (optimized for low-literacy users) |

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** — fast build tooling
- **Recharts** — interactive price charts and trends
- **Axios** — API communication
- **React Router** — client-side routing

### Backend
- **Node.js** with Express and TypeScript
- **MongoDB Atlas** — cloud database (Mongoose ODM)
- **JWT** — authentication and role-based access control
- **bcryptjs** — password hashing
- **Africa's Talking SDK** — USSD and SMS integration
- **node-cron** — scheduled alert processing

### Deployment
- **Frontend:** Vercel
- **Backend:** Render
- **Database:** MongoDB Atlas
- **USSD:** Africa's Talking Sandbox / Live

## 🏗️ Architecture

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Frontend   │────▶│   Backend    │────▶│  MongoDB     │
│   (Vercel)   │ API │   (Render)   │     │  Atlas       │
│   React/TS   │◀────│  Express/TS  │◀────│              │
└──────────────┘     └──────┬───────┘     └──────────────┘
                           │
                    ┌──────┴───────┐
                    │  Africa's    │
                    │  Talking     │
                    │  USSD / SMS  │
                    └──────────────┘
```

## 👥 User Roles

| Role | Access |
|------|--------|
| **Farmer** | Public dashboard, USSD, SMS alerts — no login needed |
| **Buyer / NGO** | Login required — analytics, reports, market trends |
| **Admin** | Full access — manage crops, markets, prices, sources, users |

## 📊 How It Works

1. **Data Collection** — Market agents, traders, and officials submit crop prices from markets across Kenya via the admin panel or USSD
2. **Validation** — Each price goes through confidence scoring based on source reliability and cross-market validation
3. **Approval** — Admins review and approve submitted prices before they go public
4. **Distribution** — Approved prices are instantly available on the web dashboard, USSD, and via SMS alerts
5. **Analysis** — Historical trends, market comparisons, and analytics help users make informed decisions

## 🌍 Markets & Crops

**Markets:** Wakulima (Nairobi), Eldoret, Mombasa, Kisumu, Nakuru, and more

**Crops:** Maize, Beans, Rice, Wheat, Sorghum, Potatoes, and expandable via admin

## 📄 License

MIT License — built for Kenyan farmers 🇰🇪

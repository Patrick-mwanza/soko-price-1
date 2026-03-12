# 🌾 SokoPrice — Agricultural Market Price Platform

SokoPrice is a full-stack web platform that provides **real-time agricultural market prices** for farmers, buyers, and NGOs across Kenya. It bridges the information gap between rural farmers and urban markets by delivering price data through both a modern web dashboard and **USSD access** for basic phone users.

## 🎯 What It Does

- **Farmers** check today's crop prices across multiple markets — no login needed
- **Buyers & NGOs** access detailed reports, analytics, and historical trends
- **Sellers & Traders** list crops for sale and connect directly with buyers on the **Marketplace**
- **Admins** manage crops, markets, sources, approve submitted prices, and moderate the marketplace
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
| **Public Farmer Dashboard** | View prices, trends, market comparisons — no account required |
| **🏪 Marketplace** | Buy and sell crops directly — connects farmers, sellers, and traders |
| **Admin Dashboard** | Full CRUD for crops, markets, sources, price management, and marketplace moderation |
| **Buyer Dashboard** | Market analytics and reporting for buyers and NGOs |
| **USSD Integration** | Access prices via `*384*474718#` on any mobile phone (Africa's Talking) |
| **SMS Alerts** | Price notification system for subscribed users |
| **Confidence Scoring** | Reliability ratings based on source history and cross-validation |
| **CSV Export** | Download price data for offline analysis |
| **Bilingual Support** | English and Swahili (optimized for low-literacy users) |

## 🏪 Marketplace

SokoPrice acts as a **trusted middleman** connecting farmers and buyers in a digital marketplace.

### How It Works

1. **Sign Up** — Create an account as a **Buyer**, **Seller**, or **Trader**
2. **Browse Listings** — View available crops with filters by crop type, location, and price range
3. **Sell Crops** — Sellers and Traders list their crops with quantity, price, location, and contact info
4. **Contact Sellers** — Buyers can call, SMS, or mark interest on listings
5. **Manage Listings** — Track and manage your own listings from the "My Listings" tab

### Marketplace Features

- **Buy Tab** — Browse all active listings, filter by crop/location/price, contact sellers directly
- **Sell Tab** — Create new crop listings with details (crop, quantity, unit, price, location, phone, notes)
- **My Listings Tab** — View, mark as sold, or delete your own listings
- **Admin Moderation** — Admins can remove inappropriate listings and suspend abusive users

### Marketplace Access

| From | Action |
|------|--------|
| **Farmer Dashboard** | Click the **"Marketplace"** card at the top |
| **Direct URL** | Navigate to `/marketplace` |
| **Sign In** | Use the Sign In button → redirects to marketplace after login |

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
| **Buyer** | Login required — browse marketplace listings, analytics, reports |
| **Seller** | Login required — list crops for sale on the marketplace |
| **Trader** | Login required — buy and sell crops on the marketplace |
| **Admin** | Full access — manage crops, markets, prices, sources, users, and marketplace |

## 📊 How It Works

1. **Data Collection** — Market agents, traders, and officials submit crop prices from markets across Kenya via the admin panel or USSD
2. **Validation** — Each price goes through confidence scoring based on source reliability and cross-market validation
3. **Approval** — Admins review and approve submitted prices before they go public
4. **Distribution** — Approved prices are instantly available on the web dashboard, USSD, and via SMS alerts
5. **Analysis** — Historical trends, market comparisons, and analytics help users make informed decisions
6. **Trading** — Sellers list crops on the marketplace; buyers browse, filter, and contact sellers directly

## 🌍 Markets & Crops

**Markets:** Wakulima (Nairobi), Eldoret, Mombasa, Kisumu, Nakuru, and more

**Crops:** Maize, Beans, Rice, Wheat, Sorghum, Potatoes, and expandable via admin

## 📄 License

MIT License — built for Kenyan farmers 🇰🇪

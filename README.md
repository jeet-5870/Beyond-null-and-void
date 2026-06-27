#  Beyond Null and Void

> A spatiotemporal research platform designed to monitor, analyze, and predict heavy metal pollution (Lead, Mercury, Arsenic) in groundwater.

![Dashboard Overview](./screenshots/dashboard.png)

**Beyond Null and Void** is a comprehensive, advanced platform built to tackle one of the most critical public health and environmental science challenges: groundwater contamination. By leveraging advanced machine learning, real-time alerting, and interactive mapping, the platform provides actionable intelligence for researchers, organizations, and the general public.

---

## Key Features

### Three-Tier Role-Based Access Control (RBAC)
Our platform is built with strict data governance in mind, supporting three distinct user tiers:
- **Admin (System Control):** Full access to system configuration, user management, and global data override capabilities.
- **Organization (Research & Data Persistence):** Tailored for scientific bodies and NGOs. Allows for data ingestion, persistent storage, and access to advanced analytical reports.
- **General User:** An educational "**Dry Run**" mode allowing the public to explore hypothetical data, view public maps, and understand the impact of heavy metal pollution without affecting persistent research data.

### Advanced ML Engine
We employ predictive modeling and spatial clustering to move from reactive monitoring to proactive intelligence:
- **`ml-regression`:** Powers our 6-month time-series forecasting, predicting future heavy metal concentration trends based on historical data.
- **`ml-kmeans`:** Identifies and clusters geographic pollution hotspots, helping authorities prioritize intervention zones.

### Scientific Indices Calculation
The platform automatically computes critical water quality indices using inverse weighting formulas to provide standardized pollution metrics:
- **HPI (Heavy Metal Pollution Index):** Assesses the overall quality of drinking water with respect to heavy metals.
- **HEI (Heavy Metal Evaluation Index):** Evaluates the cumulative contamination levels, providing a clear metric for environmental safety.

### Real-Time Intelligence & Anomaly Detection
- **Instant Alerts:** Integrated with **Socket.io**, the platform pushes real-time anomaly alerts the moment hazardous heavy metal levels are detected.
- **Seasonal Z-Score Logic:** Prevents false positives by dynamically comparing new data against historical monthly means, accounting for natural seasonal variations in groundwater parameters.

### Interactive Spatiotemporal Mapping
- **Leaflet Integration:** A rich, interactive map to visualize pollution data geographically.
- **Timeline Slider:** Allows researchers to track historical pollution movement and severity across spatial and temporal dimensions.

---

## Tech Stack

**Frontend:**
- React
- Tailwind CSS
- Chart.js (Data Visualization)
- Leaflet (Interactive Maps)
- Socket.io-client (Real-time updates)

**Backend:**
- Node.js & Express
- PostgreSQL (Relational Database)
- Socket.io (WebSocket Server)
- PDFKit (Automated Health & Safety Reports)

**Machine Learning:**
- `ml-regression`
- `ml-kmeans`

---

## Project Structure

```text
beyond-null-and-void/
├── backend/
│   ├── app.js
│   ├── controllers/
│   │   ├── analysisController.js
│   │   ├── authController.js
│   │   ├── feedbackControllers.js
│   │   ├── getleaderboarddataController.js
│   │   ├── gettimelinedataController.js
│   │   ├── indexCalculator.js
│   │   ├── leaderBoradController.js
│   │   ├── mapController.js
│   │   ├── predictionController.js
│   │   ├── reportController.js
│   │   └── uploadController.js
│   ├── db/
│   │   ├── db.js
│   │   ├── initSchema.js
│   │   └── seed.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   └── errorHandler.js
│   ├── models/
│   ├── routes/
│   │   ├── analysisRoutes.js
│   │   ├── authRoutes.js
│   │   ├── feedbackRoutes.js
│   │   ├── leaderboardRoutes.js
│   │   ├── mapRoutes.js
│   │   ├── predictionRoutes.js
│   │   ├── reportRoutes.js
│   │   ├── resultRoutes.js
│   │   ├── standardRoutes.js
│   │   └── uploadRoutes.js
│   ├── uploads/
│   └── utils/
│       ├── classification.js
│       └── formulaEngine.js
└── frontend/
    ├── package.json
    ├── postcss.config.js
    ├── tailwind.config.js
    ├── public/
    └── src/
        ├── App.jsx
        ├── api.js
        ├── index.css
        ├── index.js
        ├── components/
        │   ├── Navbar.jsx
        │   ├── card.jsx
        │   ├── footer.jsx
        │   ├── pollutionChart.jsx
        │   ├── predictionChart.jsx
        │   ├── resultTable.jsx
        │   ├── safetyBadge.jsx
        │   ├── uploadForm.jsx
        │   └── waterQualityMap.jsx
        ├── context/
        │   └── ThemeContext.jsx
        ├── pages/
        │   ├── AnomaliesPage.jsx
        │   ├── Dashboard.jsx
        │   ├── HistoricalUploadPage.jsx
        │   ├── HotspotsPage.jsx
        │   ├── LoginPage.jsx
        │   ├── blogSection.jsx
        │   ├── frontPage.jsx
        │   ├── mainPage.jsx
        │   └── partnersBoard.jsx
        ├── services/
        └── utils/
```

### Key Directories Explained

| Directory | Purpose |
| :--- | :--- |
| `backend/controllers/` | Core business logic for ML, RBAC, and data processing. |
| `backend/middleware/` | Express middlewares for authentication and error handling. |
| `backend/routes/` | API route definitions matching controllers. |
| `backend/utils/` | The scientific formula engine for HPI/HEI/PLI calculations. |
| `backend/db/` | Database configuration, migrations, and standard safety threshold seeding. |
| `frontend/src/components/` | Reusable UI elements for mapping and data visualization. |
| `frontend/src/context/` | React contexts (e.g., ThemeContext) for global state management. |
| `frontend/src/pages/` | Main view components and routing destinations. |
| `frontend/src/hooks/` | Custom React hooks for API and WebSocket management. |

---

## Installation & Setup

Follow these steps to get the project up and running locally.

### 1. Clone the Repository
```bash
git clone https://github.com/jeet-5870/beyond-null-and-void.git
cd beyond-null-and-void
```

### 2. Environment Variables
Create a `.env` file in the `backend` directory and configure the corresponding variables:
```env
PORT=5000
DB_URL=postgres://username:password@localhost:5432/beyond_null_and_void
JWT_SECRET=you_secret_jwt_key
```

### 3. Backend Setup
```bash
cd backend
npm install
npm run dev
```

### 4. Frontend Setup
Open a new terminal window:
```bash
cd frontend
npm install
npm run dev
```

The frontend will typically be available at `http://localhost:5173` (or `3000`), and the backend at `http://localhost:5000`.

---

## Impact on Public Health & Environmental Science

**Beyond Null and Void** is more than just a software project; it is a critical tool for public health advocacy. By accurately predicting where and when heavy metal pollution—like Lead, Mercury, and Arsenic—will strike next, we empower communities and governments to take preventative action before contamination leads to irreversible health crises.

---
_Designed for a safer, cleaner tomorrow._

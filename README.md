# AgriSight AI

**Detect. Explain. Recommend.**

From satellite data to smarter farming decisions.

## Features

- User authentication (register/login)
- Farm creation with map boundary drawing
- Crop selection and growth stage tracking
- Weather and satellite data integration
- NDVI calculation and trend analysis
- Crop health scoring
- Water stress, heat stress, vegetation decline, and disease risk assessment
- AI-powered recommendations
- Farm zones visualization
- Historical analytics
- Report generation
- AI farm assistant
- Alert system
- SaaS subscription architecture (Free, Farmer, Professional, Enterprise)

## Architecture

```
/backend          FastAPI + SQLAlchemy + Pydantic
/frontend         React + Vite + TypeScript + Tailwind
/database         SQLAlchemy models (SQLite / PostgreSQL)
/docs             Documentation
```

## Installation

### Prerequisites

- Python 3.10+
- Node.js 18+
- PostgreSQL (optional, SQLite works for local dev)

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Environment Variables

See `.env.example` for all available variables.

Key variables:
- `DATABASE_URL` - Database connection string
- `DEMO_MODE` - Set to `true` for demo data
- `WEATHER_PROVIDER` - Set to `open_meteo` (no key required) or `mock`
- `SATELLITE_PROVIDER` - Set to `copernicus` (requires Copernicus credentials) or `mock`
- `COPERNICUS_CLIENT_ID` / `COPERNICUS_CLIENT_SECRET` - For Sentinel-2 data access
- `AI_PROVIDER` - Set to `gemini` (requires API key) or `mock`
- `GEMINI_API_KEY` - Google Gemini API key for AI explanations
- `SUPABASE_URL` / `SUPABASE_ANON_KEY` - For production PostgreSQL

## API Providers

### Weather: Open-Meteo
No API key required. The backend sends latitude/longitude to Open-Meteo and receives current weather, forecasts, and historical data. Falls back to demo data if coordinates are missing or the service is unreachable.

### Satellite: Copernicus Data Space (Sentinel-2)
Free Sentinel-2 data. Register at [Copernicus Data Space](https://dataspace.copernicus.eu/) to get `COPERNICUS_CLIENT_ID` and `COPERNICUS_CLIENT_SECRET`. The backend uses OAuth2 to fetch Sentinel-2 imagery and calculate NDVI/NDMI/NDWI. Falls back to demo data if credentials are missing.

### AI: Google Gemini
The rule engine calculates all agricultural scores and risk levels. Gemini is used only to generate human-readable explanations and recommendations based on those computed facts. Falls back to deterministic mock explanations if no API key is provided.

## Architecture

```
                    AgriSight AI
                         │
                    React/Vite
                         │
                    FastAPI API
                         │
        ┌────────────────┼────────────────┐
        │                │                │
        ↓                ↓                ↓
   Supabase         Open-Meteo       Copernicus
   PostgreSQL        Weather          Sentinel-2
        │                │                │
        └────────────────┼────────────────┘
                         ↓
                 DATA PROCESSING
                         │
                         ↓
                  NDVI / NDMI
                         │
                         ↓
                 CROP HEALTH ENGINE
                         │
             ┌───────────┴───────────┐
             ↓                       ↓
       Water Stress              Heat Stress
             │                       │
             └───────────┬───────────┘
                         ↓
                 RISK ENGINE
                         │
                         ↓
                    GEMINI AI
                         │
                         ↓
              EXPLANATION + ADVICE
                         │
                         ↓
                 SaaS DASHBOARD
```

## Future Improvements

- Real Sentinel-2 satellite integration (Copernicus Data Space — real NDVI/NDMI/NDWI computed from returned imagery, with demo fallback)
- Real weather API integration
- IoT soil sensor integration
- Payment processing (Stripe checkout, with mock fallback)
- Multi-language support
- Mobile app
- Field boundary drawing with GPS
- Drone imagery integration
- Advanced ML yield prediction

## License

MIT


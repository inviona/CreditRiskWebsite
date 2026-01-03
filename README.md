# Credit Risk Analysis Platform

A full-stack web application for credit risk analysis using machine learning. Upload customer datasets and get comprehensive risk predictions with interactive visualizations.

![Platform Overview](/images/image.png)

## Architecture

This application consists of three main components:

1. **Frontend (Next.js)** - React-based UI with file upload and interactive dashboards
2. **Backend (Node.js/Express)** - REST API with MongoDB for data persistence
3. **Python Service (FastAPI)** - ML analysis engine with scikit-learn models

```
┌─────────────────┐
│   Next.js App   │
│  (Port 3000)    │
└────────┬────────┘
         │ HTTP
         ▼
┌─────────────────┐      ┌──────────────┐
│  Express API    │◄────►│   MongoDB    │
│  (Port 3001)    │      │              │
└────────┬────────┘      └──────────────┘
         │ HTTP
         ▼
┌─────────────────┐
│  FastAPI ML     │
│  (Port 8000)    │
└─────────────────┘
```

## Features

- **File Upload**: Drag-and-drop Excel/CSV upload with validation
- **ML Analysis**: 7+ models including Random Forest, XGBoost, LightGBM, CatBoost
- **Interactive Dashboard**: Charts for risk distribution, model comparison, feature importance
- **Analysis History**: Track and revisit past analyses
- **Real-time Updates**: Polling for analysis status
- **Responsive Design**: Professional, data-driven UI

## Tech Stack

### Frontend
- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS v4
- Recharts (data visualization)
- shadcn/ui components

### Backend
- Node.js 20+
- Express.js
- MongoDB + Mongoose
- Multer (file uploads)

### Python Service
- FastAPI
- pandas, numpy
- scikit-learn
- XGBoost, LightGBM, CatBoost (optional)

## Quick Start

### Prerequisites

- Node.js 20+
- Python 3.11+
- MongoDB (local or Atlas)

### 1. Clone and Setup

```bash
# Clone the repository
git clone <repository-url>
cd credit-risk-analysis
```

### 2. Start MongoDB

```bash
# Option A: Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Option B: Local MongoDB
mongod --dbpath /path/to/data
```

### 3. Start Python Service

```bash
cd python-service

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
pip install -r requirements-optional.txt  # For advanced models

# Start service
python main.py
# Service runs on http://localhost:8000
```

### 4. Start Backend API

```bash
cd server

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your configuration
# MONGODB_URI=mongodb://localhost:27017/credit-risk-analysis
# PYTHON_SERVICE_URL=http://localhost:8000
# CLIENT_URL=http://localhost:3000

# Start server
npm run dev
# API runs on http://localhost:3001
```

### 5. Start Frontend

```bash
# In the root directory

# Create .env.local file
echo "NEXT_PUBLIC_API_URL=http://localhost:3001/api" > .env.local

# Start Next.js
npm run dev
# App runs on http://localhost:3000
```

### 6. Test the Application

1. Open http://localhost:3000
2. Navigate to Upload page
3. Upload a sample CSV file with credit risk data
4. Wait for analysis to complete (10-30 seconds)
5. View the interactive dashboard

## Sample Data Format

Your dataset should include:

```csv
Customer_ID,Age,Gender,Monthly_income,Credit_score,Total_debt,Loan_amount_requested,Interest_rate_offered,Late_payments_last_12m,Risk_of_default
1001,35,Male,5000,720,15000,10000,5.5,0,0.15
1002,42,Female,7500,680,25000,20000,6.8,2,0.45
...
```

Required columns:
- **Risk_of_default**: Float value between 0 and 1 (target variable)
- Customer attributes (age, income, credit score, etc.)
- Financial metrics (debt, loan details, payment history)

## API Endpoints

### Backend (Node.js)

```
POST   /api/uploads              # Upload dataset for analysis
GET    /api/analyses             # List all analyses
GET    /api/analyses/:id         # Get specific analysis
DELETE /api/analyses/:id         # Delete analysis
GET    /api/health               # Health check
```

### Python Service

```
POST   /analyze                  # Analyze uploaded dataset
GET    /                         # Service info
GET    /health                   # Health check
```

## Docker Deployment

### Using Docker Compose (Recommended)

```yaml
# docker-compose.yml
version: '3.8'

services:
  mongodb:
    image: mongo:latest
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db

  python-service:
    build: ./python-service
    ports:
      - "8000:8000"

  backend:
    build: ./server
    ports:
      - "3001:3001"
    environment:
      - MONGODB_URI=mongodb://mongodb:27017/credit-risk-analysis
      - PYTHON_SERVICE_URL=http://python-service:8000
    depends_on:
      - mongodb
      - python-service

  frontend:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://localhost:3001/api
    depends_on:
      - backend

volumes:
  mongodb_data:
```

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## Environment Variables

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

### Backend (server/.env)
```env
PORT=3001
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/credit-risk-analysis
PYTHON_SERVICE_URL=http://localhost:8000
CLIENT_URL=http://localhost:3000
```

### Python Service
No environment variables required. Configuration is handled in code.

## Project Structure

```
credit-risk-analysis/
├── app/                          # Next.js pages (App Router)
│   ├── page.tsx                  # Home page
│   ├── upload/page.tsx           # Upload interface
│   ├── analysis/[id]/page.tsx    # Analysis dashboard
│   ├── history/page.tsx          # Analysis history
│   ├── layout.tsx                # Root layout
│   └── globals.css               # Global styles
├── components/                   # React components
│   └── ui/                       # shadcn/ui components
├── lib/                          # Utilities
│   └── api.ts                    # API client
├── server/                       # Node.js backend
│   ├── src/
│   │   ├── app.js                # Express app
│   │   ├── server.js             # Entry point
│   │   ├── config/               # Configuration
│   │   ├── models/               # Mongoose models
│   │   ├── routes/               # API routes
│   │   ├── controllers/          # Request handlers
│   │   ├── services/             # Business logic
│   │   └── middlewares/          # Express middlewares
│   ├── uploads/                  # Uploaded files
│   ├── package.json
│   └── .env.example
└── python-service/               # Python ML service
    ├── main.py                   # FastAPI app
    ├── analysis_engine.py        # ML pipeline
    ├── requirements.txt
    ├── requirements-optional.txt
    └── Dockerfile
```

## Development

### Running Tests

```bash
# Backend tests (when implemented)
cd server
npm test

# Python tests (when implemented)
cd python-service
pytest
```

### Code Style

- Frontend: Prettier + ESLint (Next.js defaults)
- Backend: ESLint
- Python: Black + Flake8

## Production Deployment

### Vercel (Frontend)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Render/Fly.io (Backend + Python)

1. Create accounts on Render.com or Fly.io
2. Connect GitHub repository
3. Configure build settings:
   - Backend: `cd server && npm install && npm start`
   - Python: `cd python-service && pip install -r requirements.txt && uvicorn main:app`
4. Set environment variables in platform dashboard

### MongoDB Atlas (Database)

1. Create free cluster at mongodb.com/atlas
2. Whitelist IP addresses
3. Get connection string
4. Update MONGODB_URI in backend .env

## Troubleshooting

### MongoDB Connection Issues
```bash
# Check if MongoDB is running
mongo --eval "db.adminCommand('ping')"

# Check connection string
echo $MONGODB_URI
```

### Python Service Not Responding
```bash
# Check if service is running
curl http://localhost:8000/health

# View Python logs
# (check terminal where main.py is running)
```

### Frontend API Errors
```bash
# Verify API URL
echo $NEXT_PUBLIC_API_URL

# Test backend health
curl http://localhost:3001/api/health
```

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
- Create an issue on GitHub
- Check existing issues for solutions
- Review API documentation in respective README files

## Acknowledgments

- ML models based on scikit-learn
- UI components from shadcn/ui
- Chart library: Recharts
- Icons: Lucide React

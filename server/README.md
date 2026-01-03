# Credit Risk Analysis - Backend API

Node.js/Express backend with MongoDB for managing credit risk analyses.

## Features

- File upload handling with validation
- MongoDB storage for analysis results
- Asynchronous processing with Python service integration
- RESTful API endpoints
- Error handling and logging

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Edit `.env` with your settings:
- MongoDB connection string
- Python service URL
- Client URL for CORS

### 3. Start MongoDB

```bash
# Using Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Or use MongoDB Atlas (cloud)
```

### 4. Run the Server

```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

## API Endpoints

### Upload Dataset
```
POST /api/uploads
Content-Type: multipart/form-data

Body: file (Excel or CSV)
```

**Response:**
```json
{
  "success": true,
  "message": "File uploaded successfully. Analysis started.",
  "analysisId": "...",
  "status": "queued"
}
```

### Get Analysis
```
GET /api/analyses/:id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "filename": "dataset.csv",
    "status": "completed",
    "results": {...},
    "createdAt": "..."
  }
}
```

### Get All Analyses
```
GET /api/analyses?limit=20&skip=0&status=completed
```

### Delete Analysis
```
DELETE /api/analyses/:id
```

## Architecture

```
server/
├── src/
│   ├── app.js              # Express app configuration
│   ├── server.js           # Server entry point
│   ├── config/
│   │   └── database.js     # MongoDB connection
│   ├── models/
│   │   └── Analysis.js     # Mongoose schema
│   ├── routes/
│   │   ├── uploadRoutes.js
│   │   └── analysisRoutes.js
│   ├── controllers/
│   │   ├── uploadController.js
│   │   └── analysisController.js
│   ├── services/
│   │   └── analysisService.js  # Python service integration
│   └── middlewares/
│       ├── uploadMiddleware.js
│       └── errorHandler.js
└── uploads/                # Uploaded files storage
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Server port | 3001 |
| MONGODB_URI | MongoDB connection string | mongodb://localhost:27017/credit-risk-analysis |
| PYTHON_SERVICE_URL | Python analysis service URL | http://localhost:8000 |
| CLIENT_URL | Frontend URL (CORS) | http://localhost:3000 |

## Docker Deployment

```bash
# Build image
docker build -t credit-risk-backend .

# Run container
docker run -p 3001:3001 \
  -e MONGODB_URI=mongodb://host.docker.internal:27017/credit-risk-analysis \
  -e PYTHON_SERVICE_URL=http://host.docker.internal:8000 \
  credit-risk-backend
```

## Testing

Test with curl:

```bash
# Upload file
curl -X POST http://localhost:3001/api/uploads \
  -F "file=@dataset.csv"

# Get analysis
curl http://localhost:3001/api/analyses/ANALYSIS_ID

# List all analyses
curl http://localhost:3001/api/analyses

# Credit Risk Analysis - Python Service

FastAPI microservice for credit risk machine learning analysis.

## Features

- Processes Excel (.xlsx) and CSV files
- Trains multiple ML models (Logistic Regression, Decision Tree, Random Forest, Gradient Boosting)
- Optional advanced models (XGBoost, LightGBM, CatBoost)
- Returns comprehensive analysis with metrics and chart data

## Setup

### 1. Install Dependencies

```bash
# Core dependencies
pip install -r requirements.txt

# Optional (for advanced models)
pip install -r requirements-optional.txt
```

### 2. Run Locally

```bash
python main.py
```

Or with uvicorn:

```bash
uvicorn main:app --reload --port 8000
```

### 3. Run with Docker

```bash
# Build image
docker build -t credit-risk-analysis .

# Run container
docker run -p 8000:8000 credit-risk-analysis
```

## API Endpoints

### Health Check
```
GET /
GET /health
```

### Analyze Dataset
```
POST /analyze
Content-Type: multipart/form-data

Body: file (Excel or CSV)
```

**Response:**
```json
{
  "dataset": {
    "rows": 10000,
    "cols": 24,
    "missingCount": 45
  },
  "models": [...],
  "bestModel": {
    "name": "Random Forest",
    "testAcc": 0.8734,
    "cvMean": 0.8621,
    "rocAuc": 0.9245
  },
  "featureImportance": [...],
  "charts": {...}
}
```

## Testing

Test the API with curl:

```bash
curl -X POST "http://localhost:8000/analyze" \
  -H "accept: application/json" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@Final-Dataset.csv"
```

## Environment Variables

None required. All configuration is handled internally.

## Notes

- Advanced models (XGBoost, LightGBM, CatBoost) are optional
- Analysis typically takes 10-30 seconds depending on dataset size
- Maximum recommended file size: 50MB

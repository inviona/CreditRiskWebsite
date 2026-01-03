"""
FastAPI service for Credit Risk Analysis
Processes uploaded datasets and returns ML analysis results
"""

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import pandas as pd
import numpy as np
from typing import Dict, List, Any
import io
import traceback
from datetime import datetime

from analysis_engine import CreditRiskAnalyzer

app = FastAPI(title="Credit Risk Analysis API", version="1.0.0")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "running",
        "service": "Credit Risk Analysis API",
        "version": "1.0.0",
        "timestamp": datetime.utcnow().isoformat()
    }

@app.get("/health")
async def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "models_available": ["LogisticRegression", "DecisionTree", "RandomForest", "GradientBoosting"]
    }

@app.post("/analyze")
async def analyze_dataset(file: UploadFile = File(...)):
    """
    Analyze uploaded credit risk dataset
    
    Accepts: .xlsx or .csv files
    Returns: Comprehensive analysis results with ML metrics and chart data
    """
    
    # Validate file type
    if not file.filename.endswith(('.xlsx', '.csv')):
        raise HTTPException(
            status_code=400,
            detail="Invalid file type. Only .xlsx and .csv files are supported."
        )
    
    try:
        # Read file contents
        contents = await file.read()
        
        # Load dataset based on file type
        if file.filename.endswith('.xlsx'):
            df = pd.read_excel(io.BytesIO(contents))
        else:
            df = pd.read_csv(io.BytesIO(contents))
        
        # Validate required columns
        if 'Risk_of_default' not in df.columns:
            raise HTTPException(
                status_code=400,
                detail="Dataset must contain 'Risk_of_default' column"
            )
        
        # Initialize analyzer
        analyzer = CreditRiskAnalyzer(df)
        
        # Run complete analysis
        results = analyzer.run_full_analysis()
        
        # Add metadata
        results['metadata'] = {
            'filename': file.filename,
            'file_size_mb': len(contents) / (1024 * 1024),
            'timestamp': datetime.utcnow().isoformat(),
            'analysis_version': '1.0.0'
        }
        
        return JSONResponse(content=results)
        
    except pd.errors.ParserError as e:
        raise HTTPException(
            status_code=400,
            detail=f"Failed to parse file: {str(e)}"
        )
    except KeyError as e:
        raise HTTPException(
            status_code=400,
            detail=f"Missing required column: {str(e)}"
        )
    except Exception as e:
        # Log full traceback for debugging
        print("Analysis Error:", traceback.format_exc())
        raise HTTPException(
            status_code=500,
            detail=f"Analysis failed: {str(e)}"
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

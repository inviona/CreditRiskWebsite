"""
Credit Risk Analysis Engine
Processes data and trains ML models based on the diploma thesis script
"""

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, cross_val_score, StratifiedKFold
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
    roc_auc_score
)
import warnings
warnings.filterwarnings('ignore')

# Try to import advanced models
ADVANCED_MODELS = {}
try:
    from xgboost import XGBClassifier
    ADVANCED_MODELS['xgboost'] = True
except ImportError:
    ADVANCED_MODELS['xgboost'] = False

try:
    from lightgbm import LGBMClassifier
    ADVANCED_MODELS['lightgbm'] = True
except ImportError:
    ADVANCED_MODELS['lightgbm'] = False

try:
    from catboost import CatBoostClassifier
    ADVANCED_MODELS['catboost'] = True
except ImportError:
    ADVANCED_MODELS['catboost'] = False


class CreditRiskAnalyzer:
    """Main analyzer class for credit risk prediction"""
    
    def __init__(self, df: pd.DataFrame):
        self.df = df.copy()
        self.X_train = None
        self.X_test = None
        self.y_train = None
        self.y_test = None
        self.label_encoders = {}
        self.scaler = StandardScaler()
        self.models_results = []
        self.feature_importance = None
        
    def categorize_risk(self, value: float) -> int:
        """Convert continuous risk to 3 categories"""
        if value < 0.4:
            return 0  # Low Risk
        elif value < 0.6:
            return 1  # Medium Risk
        else:
            return 2  # High Risk
    
    def preprocess_data(self):
        """Prepare data for ML models"""
        # Create risk categories
        self.df['Risk_Category'] = self.df['Risk_of_default'].apply(self.categorize_risk)
        
        # Prepare features and target
        df_ml = self.df.copy()
        if 'Customer_ID' in df_ml.columns:
            df_ml = df_ml.drop('Customer_ID', axis=1)
        
        X = df_ml.drop(['Risk_of_default', 'Risk_Category'], axis=1)
        y = df_ml['Risk_Category']
        
        # Encode categorical variables
        cat_columns = X.select_dtypes(include=['object']).columns.tolist()
        X_encoded = X.copy()
        
        for col in cat_columns:
            le = LabelEncoder()
            X_encoded[col] = le.fit_transform(X_encoded[col].astype(str))
            self.label_encoders[col] = le
        
        # Train-test split
        self.X_train, self.X_test, self.y_train, self.y_test = train_test_split(
            X_encoded, y, test_size=0.2, random_state=42, stratify=y
        )
        
        # Scale features
        self.X_train_scaled = self.scaler.fit_transform(self.X_train)
        self.X_test_scaled = self.scaler.transform(self.X_test)
        
        return X_encoded.columns.tolist()
    
    def train_models(self):
        """Train all available ML models"""
        models = [
            (LogisticRegression(max_iter=1000, random_state=42, multi_class='multinomial'),
             "Logistic Regression", True),
            (DecisionTreeClassifier(max_depth=10, random_state=42),
             "Decision Tree", False),
            (RandomForestClassifier(n_estimators=100, max_depth=10, random_state=42),
             "Random Forest", False),
            (GradientBoostingClassifier(n_estimators=100, max_depth=6, random_state=42),
             "Gradient Boosting", False),
        ]
        
        # Add advanced models if available
        if ADVANCED_MODELS.get('xgboost'):
            models.append((
                XGBClassifier(n_estimators=100, max_depth=6, learning_rate=0.1,
                            random_state=42, eval_metric='mlogloss'),
                "XGBoost", False
            ))
        
        if ADVANCED_MODELS.get('lightgbm'):
            models.append((
                LGBMClassifier(n_estimators=100, max_depth=6, learning_rate=0.1,
                             random_state=42, verbose=-1),
                "LightGBM", False
            ))
        
        if ADVANCED_MODELS.get('catboost'):
            models.append((
                CatBoostClassifier(iterations=100, depth=6, learning_rate=0.1,
                                 random_state=42, verbose=0),
                "CatBoost", False
            ))
        
        results = []
        
        for model, name, use_scaled in models:
            try:
                X_train = self.X_train_scaled if use_scaled else self.X_train
                X_test = self.X_test_scaled if use_scaled else self.X_test
                
                # Train model
                model.fit(X_train, self.y_train)
                
                # Predictions
                y_pred_train = model.predict(X_train)
                y_pred_test = model.predict(X_test)
                
                # Metrics
                train_acc = accuracy_score(self.y_train, y_pred_train)
                test_acc = accuracy_score(self.y_test, y_pred_test)
                
                # Cross-validation
                cv_strategy = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
                cv_scores = cross_val_score(model, X_train, self.y_train,
                                          cv=cv_strategy, scoring='accuracy')
                
                # ROC-AUC
                roc_auc = None
                if hasattr(model, 'predict_proba'):
                    y_prob = model.predict_proba(X_test)
                    roc_auc = roc_auc_score(self.y_test, y_prob,
                                          multi_class='ovr', average='weighted')
                
                # Confusion matrix
                cm = confusion_matrix(self.y_test, y_pred_test)
                
                result = {
                    'name': name,
                    'trainAcc': float(train_acc),
                    'testAcc': float(test_acc),
                    'cvMean': float(cv_scores.mean()),
                    'cvStd': float(cv_scores.std()),
                    'rocAuc': float(roc_auc) if roc_auc else None,
                    'confusionMatrix': cm.tolist(),
                    'model_object': model  # Store for feature importance
                }
                
                results.append(result)
                
            except Exception as e:
                print(f"Error training {name}: {str(e)}")
                continue
        
        self.models_results = results
        return results
    
    def extract_feature_importance(self):
        """Get feature importance from Random Forest"""
        rf_result = next((r for r in self.models_results if r['name'] == 'Random Forest'), None)
        
        if rf_result and rf_result.get('model_object'):
            rf_model = rf_result['model_object']
            importances = rf_model.feature_importances_
            
            feature_importance = [
                {
                    'feature': feat,
                    'importance': float(imp)
                }
                for feat, imp in zip(self.X_train.columns, importances)
            ]
            
            # Sort by importance
            feature_importance.sort(key=lambda x: x['importance'], reverse=True)
            self.feature_importance = feature_importance[:15]  # Top 15
            
        return self.feature_importance
    
    def get_dataset_summary(self):
        """Get basic dataset statistics"""
        missing_by_column = self.df.isnull().sum().to_dict()
        missing_count = sum(missing_by_column.values())
        
        return {
            'rows': int(len(self.df)),
            'cols': int(len(self.df.columns)),
            'missingCount': int(missing_count),
            'missingByColumn': {k: int(v) for k, v in missing_by_column.items() if v > 0}
        }
    
    def get_risk_distribution(self):
        """Analyze risk distribution"""
        risk_categories = self.df['Risk_Category'].value_counts().sort_index()
        
        distribution = [
            {
                'category': ['Low Risk', 'Medium Risk', 'High Risk'][i],
                'count': int(risk_categories.get(i, 0)),
                'percentage': float(risk_categories.get(i, 0) / len(self.df) * 100)
            }
            for i in range(3)
        ]
        
        # Histogram data for continuous risk
        hist, bins = np.histogram(self.df['Risk_of_default'], bins=30)
        histogram = [
            {'bin': f"{bins[i]:.2f}-{bins[i+1]:.2f}", 'count': int(hist[i])}
            for i in range(len(hist))
        ]
        
        return {
            'categories': distribution,
            'histogram': histogram
        }
    
    def run_full_analysis(self):
        """Execute complete analysis pipeline"""
        # 1. Dataset summary
        dataset_summary = self.get_dataset_summary()
        
        # 2. Preprocess
        feature_names = self.preprocess_data()
        
        # 3. Risk distribution
        risk_dist = self.get_risk_distribution()
        
        # 4. Train models
        models = self.train_models()
        
        # 5. Feature importance
        feature_importance = self.extract_feature_importance()
        
        # 6. Find best model
        best_model = max(models, key=lambda x: x['cvMean'])
        
        # 7. Prepare chart data
        chart_data = {
            'riskHistogram': risk_dist['histogram'],
            'riskCategoryBar': risk_dist['categories'],
            'modelAccuracyBar': [
                {
                    'name': m['name'],
                    'trainAcc': m['trainAcc'],
                    'testAcc': m['testAcc'],
                    'cvMean': m['cvMean']
                }
                for m in models
            ],
            'featureImportanceTop15': feature_importance if feature_importance else []
        }
        
        # Remove model objects before returning (not JSON serializable)
        models_clean = [{k: v for k, v in m.items() if k != 'model_object'} for m in models]
        
        # 8. Compile results
        results = {
            'dataset': dataset_summary,
            'target': {
                'riskDistribution': risk_dist['categories'],
                'riskCategoryCounts': {
                    cat['category']: cat['count']
                    for cat in risk_dist['categories']
                }
            },
            'models': models_clean,
            'bestModel': {
                'name': best_model['name'],
                'trainAcc': best_model['trainAcc'],
                'testAcc': best_model['testAcc'],
                'cvMean': best_model['cvMean'],
                'cvStd': best_model['cvStd'],
                'rocAuc': best_model['rocAuc'],
                'confusionMatrix': best_model['confusionMatrix']
            },
            'featureImportance': feature_importance if feature_importance else [],
            'charts': chart_data,
            'notes': self._get_notes()
        }
        
        return results
    
    def _get_notes(self):
        """Generate analysis notes"""
        notes = []
        
        if not ADVANCED_MODELS.get('xgboost'):
            notes.append("XGBoost not available. Install with: pip install xgboost")
        if not ADVANCED_MODELS.get('lightgbm'):
            notes.append("LightGBM not available. Install with: pip install lightgbm")
        if not ADVANCED_MODELS.get('catboost'):
            notes.append("CatBoost not available. Install with: pip install catboost")
        
        if len(self.models_results) < 4:
            notes.append("Some models failed to train. Check data quality.")
        
        return notes

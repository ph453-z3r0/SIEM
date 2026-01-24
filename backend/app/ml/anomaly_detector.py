import numpy as np
from sklearn.ensemble import IsolationForest
import joblib
import os

class AnomalyDetector:
    def __init__(self, model_path="model.pkl"):
        self.model_path = model_path
        self.model = IsolationForest(contamination=0.05, random_state=42)
        self.is_trained = False

    def train(self, data: np.ndarray):
        """
        Train the Isolation Forest model.
        Data should be a 2D array of features (e.g., [hour, location_id, access_count]).
        """
        self.model.fit(data)
        self.is_trained = True
        joblib.dump(self.model, self.model_path)

    def load(self):
        if os.path.exists(self.model_path):
            self.model = joblib.load(self.model_path)
            self.is_trained = True

    def predict(self, features: np.ndarray) -> int:
        """
        Returns -1 for anomaly, 1 for normal.
        """
        if not self.is_trained:
            self.load()
            if not self.is_trained:
                return 1 # Default to normal if not trained
        
        return self.model.predict(features)[0]

    def score_samples(self, features: np.ndarray) -> float:
        """
        Returns anomaly score. Lower is more anomalous.
        """
        if not self.is_trained:
            self.load()
            if not self.is_trained:
                return 0.0
        
        return self.model.score_samples(features)[0]

detector = AnomalyDetector()

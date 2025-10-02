import React, { useState, useEffect } from 'react';
import { Zap, CornerUpRight, AlertTriangle, CheckCircle, ArrowLeft } from 'lucide-react';
import { Card, CardHeader, CardContent } from './card.jsx';
import API from '../api.js';

const PredictionChart = ({ location, onBack }) => {
  const [predictionData, setPredictionData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPredictionData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Fetch prediction data from the new protected endpoint
        const res = await API.get(`/api/prediction/${location}`);
        setPredictionData(res.data);
      } catch (err) {
        console.error('Error fetching prediction data:', err);
        setError('Failed to fetch future prediction data.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchPredictionData();
  }, [location]);

  const getPredictionStatus = () => {
    if (predictionData.length === 0) return { text: 'No Data', color: 'text-text-muted', icon: CornerUpRight };
    
    const initialHPI = predictionData[0]?.hpi || 0;
    const finalHPI = predictionData[predictionData.length - 1]?.hpi || 0;
    
    // Check for a significant increase (e.g., > 5% or crossing 200 HPI threshold)
    const hpiThreshold = 200;
    const percentageIncrease = ((finalHPI - initialHPI) / initialHPI) * 100;

    if (finalHPI > hpiThreshold) {
        return { text: `Projected HIGH Pollution (HPI: ${finalHPI.toFixed(1)})`, color: 'text-danger', icon: AlertTriangle };
    }
    if (percentageIncrease > 5) {
        return { text: `Projected Increase of ${percentageIncrease.toFixed(2)}% in HPI`, color: 'text-warning', icon: AlertTriangle };
    }
    
    return { text: 'Projected Stable/Improving Trend', color: 'text-success', icon: CheckCircle };
  };
  
  const status = getPredictionStatus();

  return (
    <Card className="mb-8">
      <CardHeader className="flex flex-col xs:flex-row justify-between items-start xs:items-center">
        <div className="flex items-center space-x-2">
          <button onClick={onBack} className="p-2 rounded-full hover:bg-primary-dark transition-colors">
            <ArrowLeft className="h-5 w-5 text-text-muted" />
          </button>
          <Zap className="h-5 w-5 text-accent-blue" />
          <h3 className="text-xl font-bold text-text-light">{location} - Future Prediction (7 Days)</h3>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="w-full h-64 flex items-center justify-center text-text-muted">
            <span className="animate-spin h-8 w-8 rounded-full border-4 border-gray-700 border-t-accent-blue"></span>
          </div>
        ) : error ? (
          <div className="w-full h-64 flex items-center justify-center text-danger">
            <p>{error}</p>
          </div>
        ) : (
          <>
            <div className="w-full h-64 bg-primary-dark rounded-lg flex items-center justify-center text-accent-blue font-mono border border-gray-700">
              [Placeholder for Interactive Chart of Predicted HPI over time]
            </div>
            <div className="mt-4 text-center">
              <p className="text-lg font-semibold text-text-light flex items-center justify-center space-x-2">
                <status.icon className={`h-5 w-5 ${status.color}`} />
                <span className={status.color}>Prediction Status: {status.text}</span>
              </p>
              <p className="text-sm text-text-muted mt-1">
                This is an ML-generated prediction for the next 7 days, accessible only to Researchers and NGOs.
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default PredictionChart;
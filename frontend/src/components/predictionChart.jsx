import React, { useState, useEffect, useContext } from 'react';
import { Zap, CornerUpRight, AlertTriangle, CheckCircle, ArrowLeft } from 'lucide-react';
import { Card, CardHeader, CardContent } from './card.jsx';
import API from '../api.js';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { ThemeContext } from '../context/ThemeContext.jsx';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const PredictionChart = ({ location, onBack }) => {
  const [predictionData, setPredictionData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { theme } = useContext(ThemeContext);

  useEffect(() => {
    const fetchPredictionData = async () => {
      setIsLoading(true);
      setError(null);
      try {
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
    if (predictionData.length === 0) return { text: 'No Data', color: 'text-gray-500 dark:text-text-muted', icon: CornerUpRight };
    
    const initialHPI = predictionData[0]?.hpi || 0;
    const finalHPI = predictionData[predictionData.length - 1]?.hpi || 0;
    
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
  
  const chartData = {
    labels: predictionData.map(item => new Date(item.date).toLocaleDateString()),
    datasets: [
      {
        label: 'Predicted HPI (Heavy Metal Pollution Index)',
        data: predictionData.map(item => item.hpi),
        borderColor: '#10b981', // success color
        backgroundColor: 'rgba(16, 185, 129, 0.2)',
        borderWidth: 2,
        tension: 0.4,
        pointRadius: 5,
        pointBackgroundColor: '#10b981',
      },
    ],
  };

  const isDark = theme === 'dark';
  const textColor = isDark ? '#94a3b8' : '#6b7280';
  const gridColor = isDark ? '#1e293b' : '#e5e7eb';
  const titleColor = isDark ? '#f1f5f9' : '#1f2937';

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: titleColor,
        }
      },
      title: {
        display: true,
        text: `Predicted HPI for ${location} (Next 7 Days)`,
        color: textColor,
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Date',
          color: textColor,
        },
        ticks: {
          color: textColor,
        },
        grid: {
          color: gridColor,
        }
      },
      y: {
        title: {
          display: true,
          text: 'HPI Score',
          color: textColor,
        },
        ticks: {
          color: textColor,
        },
        grid: {
          color: gridColor,
        }
      },
    },
  };

  return (
    <Card>
      <CardHeader className="flex flex-col xs:flex-row justify-between items-start xs:items-center">
        <div className="flex items-center space-x-2">
          <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-primary-dark transition-colors">
            <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-text-muted" />
          </button>
          <Zap className="h-5 w-5 text-accent-blue" />
          <h3 className="text-xl font-bold text-gray-800 dark:text-text-light">{location} - Future Prediction (7 Days)</h3>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="w-full h-64 flex items-center justify-center text-gray-600 dark:text-text-muted">
            <span className="animate-spin h-8 w-8 rounded-full border-4 border-gray-300 dark:border-gray-700 border-t-accent-blue"></span>
          </div>
        ) : error ? (
          <div className="w-full h-64 flex items-center justify-center text-danger">
            <p>{error}</p>
          </div>
        ) : predictionData.length === 0 ? (
           <div className="w-full h-64 flex items-center justify-center text-gray-600 dark:text-text-muted">
            <p>Prediction data could not be generated.</p>
          </div>
        ) : (
          <>
            <div className="w-full h-64 bg-gray-50 dark:bg-primary-dark rounded-lg flex items-center justify-center text-accent-blue font-mono border border-gray-200 dark:border-gray-700 p-4">
              <Line data={chartData} options={chartOptions} />
            </div>
            <div className="mt-4 text-center">
              <p className="text-lg font-semibold text-gray-800 dark:text-text-light flex items-center justify-center space-x-2">
                <status.icon className={`h-5 w-5 ${status.color}`} />
                <span className={status.color}>Prediction Status: {status.text}</span>
              </p>
              <p className="text-sm text-gray-600 dark:text-text-muted mt-1">
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
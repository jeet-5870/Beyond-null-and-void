import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

// Register chart components once
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function PollutionChart({ data }) {
  const chartData = {
    labels: data.map((d) => d.location),
    datasets: [
      {
        label: 'HPI',
        data: data.map((d) => d.hpi),
        backgroundColor: '#36a2eb',
      },
      {
        label: 'HEI',
        data: data.map((d) => d.hei),
        backgroundColor: '#ff6384',
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Pollution Indices by Location' },
    },
  };

  return <Bar data={chartData} options={options} />;
}

export default PollutionChart;

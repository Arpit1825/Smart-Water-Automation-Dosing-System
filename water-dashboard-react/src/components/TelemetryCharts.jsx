import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,  
  LinearScale,
  PointElement,
  LineElement,
  Title, Tooltip, Legend, Filler 
} from 'chart.js';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler
);

function TelemetryCharts({ chartTimeline, tdsHistory, levelHistory }) {
  
  const chartConfigData = {
    labels: chartTimeline,
    datasets: [
      {
        label: 'TDS Purity Level (PPM)',
        data: tdsHistory,
        borderColor: '#a855f7',
        backgroundColor: 'rgba(168, 85, 247, 0.04)',
        tension: 0.4,
        fill: true,
        borderWidth: 2,
        pointRadius: 3,
        pointBackgroundColor: '#a855f7'
      },
      {
        label: 'Water Volume Level (%)',
        data: levelHistory,
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.04)',
        tension: 0.4,
        fill: true,
        borderWidth: 2,
        pointRadius: 3,
        pointBackgroundColor: '#3b82f6'
      }
    ]
  };

  const chartOptions = {
    responsive: true,            
    maintainAspectRatio: false,  
    plugins: {
      legend: { labels: { color: '#9ca3af', font: { family: 'monospace', size: 10 } } } 
    },
    scales: {
      x: { grid: { color: 'rgba(31, 41, 55, 0.3)' }, ticks: { color: '#6b7280', font: { size: 9 } } },
      y: { grid: { color: 'rgba(31, 41, 55, 0.3)' }, ticks: { color: '#6b7280', font: { size: 9 } } }
    }
  };

  return (
    <div className="lg:col-span-8 bg-gray-900/20 backdrop-blur-md border border-gray-800/60 rounded-2xl p-5 shadow-xl group hover:border-gray-700/60 transition-all duration-300">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xs font-bold text-gray-400 font-mono uppercase tracking-wider">📦 ANALYTICS REAL-TIME MATRIX HISTOGRAM</h3>
        <span className="text-[9px] font-mono text-gray-600 animate-pulse">● INTERMEDIATE STREAM CORES</span>
      </div>
      <div className="h-64 w-full">
        <Line data={chartConfigData} options={chartOptions} />
      </div>
    </div>
  );
}

export default TelemetryCharts;
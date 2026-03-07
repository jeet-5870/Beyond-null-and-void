// frontend/src/components/waterQualityMap.jsx
import React, { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Card } from './card.jsx'; // 🔑 Import Card component

// Create a custom icon function
const getPinIcon = (classification) => {
  let iconUrl;
  switch (classification) {
    case 'Safe':
      iconUrl = 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png';
      break;
    case 'Polluted':
      iconUrl = 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png';
      break;
    case 'Highly Polluted':
      iconUrl = 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png';
      break;
    default:
      iconUrl = 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png';
  }

  return new L.Icon({
    iconUrl,
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });
};

// A custom component to handle map pan/zoom
function FlyToLocation({ selectedLocation }) {
  const map = useMap();

  useEffect(() => {
    if (selectedLocation) {
      map.flyTo([parseFloat(selectedLocation.lat), parseFloat(selectedLocation.lng)], 10);
    }
  }, [selectedLocation, map]);

  return null;
}

const WaterQualityMap = ({ data, selectedLocation }) => {
  const center = [23.2599, 77.4126];
  const [timelineIndex, setTimelineIndex] = useState(100);

  // Safely extract all unique sorted dates from the historical payload
  const uniqueDates = Array.from(new Set(data.map(d => new Date(d.sample_date).toLocaleDateString()))).sort((a,b) => new Date(a) - new Date(b));
  const hasTimeline = uniqueDates.length > 0;

  // Filter markers based on timeline slider (Show data up to the selected date point)
  const currentMaxDate = hasTimeline ? new Date(uniqueDates[Math.floor((timelineIndex / 100) * (uniqueDates.length - 1))]) : new Date();
  
  // To avoid overlapping pins for the same location, we grab the *latest* valid pin for each location BEFORE the currentMaxDate
  const filteredData = Object.values(data.reduce((acc, loc) => {
      const locDate = new Date(loc.sample_date);
      if (locDate <= currentMaxDate) {
          if (!acc[loc.location] || new Date(acc[loc.location].sample_date) < locDate) {
              acc[loc.location] = loc;
          }
      }
      return acc;
  }, {}));

  return (
    // 🔑 Wrap in Card for consistent dashboard styling
    <Card className="mb-8 p-6"> 
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800 dark:text-text-light">
          Groundwater Heavy Metal Pollution Map
        </h2>
        
        {hasTimeline && (
          <div className="flex items-center space-x-4 bg-gray-50 dark:bg-primary-dark px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 w-full md:w-auto mt-4 md:mt-0">
            <span className="text-sm font-semibold text-gray-600 dark:text-text-muted whitespace-nowrap">Timeline:</span>
            <input 
              type="range" 
              min="0" max="100" 
              value={timelineIndex} 
              onChange={(e) => setTimelineIndex(Number(e.target.value))}
              className="w-full md:w-48 h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer dark:bg-gray-600 accent-accent-blue"
            />
            <span className="text-sm font-bold text-accent-blue whitespace-nowrap min-w-[90px]">
              {currentMaxDate.toLocaleDateString()}
            </span>
          </div>
        )}
      </div>

      <MapContainer 
        center={center} 
        zoom={6} 
        style={{ height: "500px", width: "100%", borderRadius: "12px", zIndex: 0 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {filteredData.map(location => (
          <Marker 
            key={`${location.location}-${location.sample_date}`} 
            position={[parseFloat(location.lat), parseFloat(location.lng)]}
            icon={getPinIcon(location.classification)}
          >
            <Popup>
              {/* Popups now support light and dark themes */}
              <div className="p-2 text-gray-900 dark:text-white bg-white dark:bg-secondary-dark rounded-lg">
                <h1 className="text-lg font-semibold">{location.location}</h1>
                <p>HPI: {location.hpi.toFixed(2)}</p>
                {/* 🔑 REMOVED: HEI removed from map popup */}
                <p>Classification: {location.classification}</p>
                <p className="text-xs text-gray-500 mt-2">Recorded: {new Date(location.sample_date).toLocaleDateString()}</p>
              </div>
            </Popup>
          </Marker>
        ))}
        <FlyToLocation selectedLocation={selectedLocation} />
      </MapContainer>
    </Card>
  );
};

export default WaterQualityMap;
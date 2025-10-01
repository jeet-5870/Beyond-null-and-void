import React, { useEffect, useRef } from "react";
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

  return (
    // 🔑 Wrap in Card for consistent dashboard styling
    <Card className="mb-8 p-6"> 
      <h2 className="text-xl font-bold mb-4 text-text-light">
        Groundwater Heavy Metal Pollution Map
      </h2>
      <MapContainer 
        center={center} 
        zoom={6} 
        style={{ height: "500px", width: "100%", borderRadius: "12px" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {data.map(location => (
          <Marker 
            key={location.location} 
            position={[parseFloat(location.lat), parseFloat(location.lng)]}
            icon={getPinIcon(location.classification)}
          >
            <Popup>
              {/* Popups are hardcoded to standard colors to ensure readability on a map */}
              <div className="p-2 text-gray-900">
                <h1 className="text-lg font-semibold">{location.location}</h1>
                <p>HPI: {location.hpi.toFixed(2)}</p>
                <p>Classification: {location.classification}</p>
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
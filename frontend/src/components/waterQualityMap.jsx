import React, { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

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
    <div className="mb-8">
      <h2 className="text-xl font-bold mb-2 text-gray-900">
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
          >
            <Popup>
              <div class="p-2">
                <h1 class="text-lg font-semibold">{location.location}</h1>
                <p>HPI: {location.hpi.toFixed(2)}</p>
                <p>Classification: {location.classification}</p>
              </div>
            </Popup>
          </Marker>
        ))}
        <FlyToLocation selectedLocation={selectedLocation} />
      </MapContainer>
    </div>
  );
};

export default WaterQualityMap;
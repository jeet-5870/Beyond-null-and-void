import React, { useEffect, useRef, useState } from "react";

const WaterQualityMap = ({ onMapClick, data }) => {
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const infoWindowRef = useRef(null);

  useEffect(() => {
    const script = document.createElement("script");
    const apiKey = process.env.REACT_APP_MAP_API_KEY;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;

    script.async = true;
    script.defer = true;
    script.onload = () => {
      initMap();
    };
    document.body.appendChild(script);

    const initMap = () => {
      const center = { lat: 23.2599, lng: 77.4126 };
      const map = new window.google.maps.Map(mapRef.current, {
        zoom: 6,
        center: center,
      });

      if (data && data.length > 0) {
        data.forEach(location => {
          const marker = new window.google.maps.Marker({
            position: { lat: parseFloat(location.lat), lng: parseFloat(location.lng) },
            map: map,
            title: location.location,
          });

          // Create an InfoWindow for each marker
          const infoWindowContent = `
            <div class="p-2">
              <h1 class="text-lg font-semibold">${location.location}</h1>
              <p>HPI: ${location.hpi.toFixed(2)}</p>
              <p>Classification: ${location.classification}</p>
            </div>
          `;
          const infoWindow = new window.google.maps.InfoWindow({
            content: infoWindowContent,
          });

          marker.addListener('click', () => {
            infoWindow.open(map, marker);
          });
        });
      }
    };
  }, [data]);

  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold mb-2 text-gray-900">
        Groundwater Heavy Metal Pollution Map
      </h2>
      <div
        ref={mapRef}
        style={{ height: "500px", width: "100%", borderRadius: "12px" }}
        className="relative"
      />
    </div>
  );
};

export default WaterQualityMap;

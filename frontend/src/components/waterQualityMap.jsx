import React, { useEffect, useRef } from "react";

const WaterQualityMap = () => {
  const mapRef = useRef(null);

  useEffect(() => {
    // Load Google Maps script dynamically
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
      // Center map (India example)
      const center = { lat: 23.2599, lng: 77.4126 };

      // Create map
      const map = new window.google.maps.Map(mapRef.current, {
        zoom: 6,
        center: center,
      });

      // Example marker (Bhopal)
      new window.google.maps.Marker({
        position: { lat: 23.2599, lng: 77.4126 },
        map: map,
        title: "Bhopal - Safe",
      });
    };
  }, []);

  return (
    <div>
      <h2 className="text-xl font-bold mb-2 bg-white text-color">
        Groundwater Heavy Metal Pollution Map
      </h2>
      <div
        ref={mapRef}
        style={{ height: "500px", width: "100%", borderRadius: "12px" }}
      />
    </div>
  );
};

export default WaterQualityMap;
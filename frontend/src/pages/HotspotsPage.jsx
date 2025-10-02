// frontend/src/pages/HotspotsPage.jsx
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Card, CardHeader, CardContent } from '../components/card.jsx';
import API from '../api.js';

const HotspotsPage = () => {
  const [hotspots, setHotspots] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAnalysis = async () => {
      setIsLoading(true);
      try {
        const res = await API.get('/api/analysis');
        setHotspots(res.data.hotspots || []);
      } catch (error) {
        console.error("Failed to fetch hotspot data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAnalysis();
  }, []);

  const getRiskColor = (risk) => {
    if (risk === 'High') return 'red';
    if (risk === 'Moderate') return 'orange';
    return 'green';
  };

  const topPolluted = [...hotspots].sort((a, b) => b.avgHpi - a.avgHpi).slice(0, 5);
  const leastPolluted = [...hotspots].sort((a, b) => a.avgHpi - b.avgHpi).slice(0, 5);

  return (
    <div>
      <h2 className="text-3xl font-bold text-text-light mb-6">Pollution Hotspots (DBSCAN Clusters)</h2>
      <Card className="mb-8">
        <CardContent>
          <MapContainer center={[23.2599, 77.4126]} zoom={5} style={{ height: '500px', width: '100%', borderRadius: '12px' }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {hotspots.map(spot => (
              <CircleMarker
                key={spot.id}
                center={[spot.center.lat, spot.center.lng]}
                radius={10 + spot.locationCount} // Radius based on number of locations in cluster
                pathOptions={{ color: getRiskColor(spot.risk), fillColor: getRiskColor(spot.risk), fillOpacity: 0.5 }}
              >
                <Popup>
                  <div className="text-gray-900">
                    <h3 className="font-bold text-lg">Hotspot Cluster #{spot.id} ({spot.risk} Risk)</h3>
                    <p><strong>Avg. HPI:</strong> {spot.avgHpi.toFixed(2)}</p>
                    <p><strong>Avg. PLI:</strong> {spot.avgPli.toFixed(2)}</p>
                    <p><strong>Locations in Cluster:</strong> {spot.locationCount}</p>
                    <p><strong>Last Update:</strong> {new Date(spot.lastUpdate).toLocaleDateString()}</p>
                  </div>
                </Popup>
              </CircleMarker>
            ))}
          </MapContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <CityRankingTable title="Top 5 Most Polluted Hotspots" data={topPolluted} />
        <CityRankingTable title="Top 5 Least Polluted Hotspots" data={leastPolluted} />
      </div>
    </div>
  );
};

const CityRankingTable = ({ title, data }) => (
  <Card>
    <CardHeader><h3 className="text-lg font-semibold text-text-light">{title}</h3></CardHeader>
    <CardContent>
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-gray-700">
            <th className="py-2 px-4 text-text-muted">Rank</th>
            <th className="py-2 px-4 text-text-muted">Cluster ID</th>
            <th className="py-2 px-4 text-text-muted">Avg. HPI</th>
            <th className="py-2 px-4 text-text-muted">Risk Level</th>
          </tr>
        </thead>
        <tbody>
          {data.map((city, index) => (
            <tr key={city.id} className="border-b border-gray-700 last:border-b-0">
              <td className="py-2 px-4 text-text-light">{index + 1}</td>
              <td className="py-2 px-4 text-text-light">#{city.id}</td>
              <td className="py-2 px-4 font-mono text-text-light">{city.avgHpi.toFixed(2)}</td>
              <td className={`py-2 px-4 font-semibold ${city.risk === 'High' ? 'text-danger' : city.risk === 'Moderate' ? 'text-warning' : 'text-success'}`}>{city.risk}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </CardContent>
  </Card>
);

export default HotspotsPage;
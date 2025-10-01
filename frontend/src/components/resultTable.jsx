import React from 'react';
import { MapPin } from 'lucide-react';
import { Card, CardHeader, CardContent } from './card.jsx';

function ResultTable({ data, onShowOnMap }) {
  const getClassificationBadge = (classification) => {
    // 🔑 UPDATED colors for dark theme
    const colors = {
      'Safe': 'bg-success/20 text-success',
      'Polluted': 'bg-warning/20 text-warning',
      'Highly Polluted': 'bg-danger/20 text-danger',
    };

    return (
      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${colors[classification] || 'bg-text-muted/10 text-text-muted'}`}>
        {classification}
      </span>
    );
  };

  return (
    <Card className="mb-8">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-semibold text-text-light">Detailed Results</h3> {/* 🔑 Text color */}
          </div>
          <span className="text-sm text-text-muted">{data.length} locations analyzed</span> {/* 🔑 Text color */}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-primary-dark border-b border-gray-700"> {/* 🔑 Header colors */}
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-text-muted uppercase tracking-wider"> {/* 🔑 Text color */}
                  Location
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">
                  HPI
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">
                  PLI
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">
                  MPI
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">
                  HEI
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">
                  Classification
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-secondary-dark divide-y divide-gray-700"> {/* 🔑 Body colors */}
              {data.map((item, index) => (
                <tr key={item.location} className={index % 2 === 0 ? 'bg-secondary-dark' : 'bg-primary-dark/70'}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 text-text-muted mr-2" />
                      <span className="font-medium text-text-light">{item.location}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-text-light">
                    {item.hpi?.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-text-light">
                    {item.pli?.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-text-light">
                    {item.mpi?.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-text-light">
                    {item.hei?.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getClassificationBadge(item.classification)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {onShowOnMap && (
                      <button 
                        onClick={() => onShowOnMap(item)}
                        className="text-accent-blue hover:underline text-sm font-semibold"
                      >
                        Show on Map
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

export default ResultTable;
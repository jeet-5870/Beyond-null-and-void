import React from 'react';
import { Handshake } from 'lucide-react';
import { Card, CardHeader, CardContent } from '../components/card.jsx';

const PartnersBoard = () => {
  const partners = [
    { name: 'EcoConnect NGO', contribution: '120 data submissions' },
    { name: 'CleanWater Foundation', contribution: '80 data submissions' },
    { name: 'Green Earth Alliance', contribution: '65 data submissions' },
  ];

  return (
    <Card className="mb-8">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Handshake className="h-5 w-5 text-success" />
          <h3 className="text-lg font-semibold text-text-light">Our Top Partners</h3>
        </div>
      </CardHeader>
      <CardContent>
        <ul className="divide-y divide-gray-700">
          {partners.map((partner, index) => (
            <li key={index} className="py-3 flex justify-between items-center">
              <span className="text-text-light font-medium">{partner.name}</span>
              <span className="text-sm text-text-muted">{partner.contribution}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

export default PartnersBoard;
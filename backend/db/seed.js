// db/seed.js
import db from './db.js';
import bcrypt from 'bcrypt';

const initialSamples = [
    {
        location: 'Varanasi', lat: 25.3176, lng: 82.9739,
        metals: [
            { metal_name: 'Pb', concentration: 0.15 },
            { metal_name: 'Cd', concentration: 0.04 },
            { metal_name: 'As', concentration: 0.06 }
        ],
        hpi: 250.0, hei: 30.0, pli: 5.2, mpi: 0.05
    },
    {
        location: 'Lucknow', lat: 26.8467, lng: 80.9462,
        metals: [
            { metal_name: 'Pb', concentration: 0.05 },
            { metal_name: 'Cd', concentration: 0.01 },
            { metal_name: 'As', concentration: 0.02 }
        ],
        hpi: 100.0, hei: 10.0, pli: 2.5, mpi: 0.01
    },
    {
        location: 'Agra', lat: 27.1767, lng: 78.0081,
        metals: [
            { metal_name: 'Pb', concentration: 0.10 },
            { metal_name: 'Cd', concentration: 0.025 },
            { metal_name: 'As', concentration: 0.045 }
        ],
        hpi: 180.0, hei: 20.0, pli: 4.0, mpi: 0.03
    }
];
// ... (rest of the file is fine, but the sample data above is more varied)
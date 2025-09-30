// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { Droplets, LogIn, ArrowRight } from 'lucide-react';
// import PollutionLeaderboard from './pollutionLeaderboard.jsx';
// import PartnersBoard from './partnersBoard.jsx';
// import BlogSection from './blogSection.jsx';
// import API from '../api.js';
// import Footer from '../components/footer.jsx';

// const Navbar = () => {
//   const navigate = useNavigate();
//   const [isLoggedIn, setIsLoggedIn] = useState(false);

//   useEffect(() => {
//     const token = localStorage.getItem('token');
//     setIsLoggedIn(!!token);
//   }, []);

//   return (
//     <nav
//       className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md shadow-md"
//       aria-label="Main Navigation"
//     >
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="flex justify-between items-center h-16">
//           {/* Logo */}
//           <div className="flex items-center space-x-3">
//             <Droplets className="h-8 w-8 text-blue-600" />
//             <span className="text-xl font-bold text-gray-900">Beyond Null and Void</span>
//           </div>

//           {/* Navigation Links */}
//           <div className="flex items-center space-x-6">
//             <a href="#home" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">Home</a>
//             <a href="#leaderboard" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">Leader Board</a>
//             <a href="#partners" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">Our Partners</a>
//             <a href="#complaint" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">Complaint</a>

//             {isLoggedIn ? (
//               <button
//                 onClick={() => navigate('/dashboard')}
//                 className="flex items-center space-x-2 px-4 py-2 text-sm font-semibold rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition"
//               >
//                 <span>Go to Dashboard</span>
//                 <ArrowRight className="h-4 w-4" />
//               </button>
//             ) : (
//               <button
//                 onClick={() => navigate('/login')}
//                 className="flex items-center space-x-2 px-4 py-2 text-sm font-semibold rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition"
//               >
//                 <LogIn className="h-4 w-4" />
//                 <span>Create account</span>
//               </button>
//             )}
//           </div>
//         </div>
//       </div>
//     </nav>
//   );
// };

// const MainPage = () => {
//   const [leaderboardData, setLeaderboardData] = useState([]);
//   const [reversedLeaderboardData, setReversedLeaderboardData] = useState([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const fetchLeaderboard = async () => {
//       setIsLoading(true);
//       setError(null);
//       try {
//         const res = await API.get('/api/leaderboard?page=1&limit=10');
//         const cities = res.data.cities;
//         setLeaderboardData(cities);
//         setReversedLeaderboardData([...cities].reverse());
//       } catch (err) {
//         console.error('Error fetching leaderboard data:', err);
//         setError('Failed to load leaderboard data.');
//       } finally {
//         setIsLoading(false);
//       }
//     };
//     fetchLeaderboard();
//   }, []);

//   const handleViewTimeline = (city) => {
//     console.log(`View timeline for ${city}`);
//   };

//   return (
//     <div className="min-h-screen bg-white">
//       <Navbar />
//       <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 pt-32">

//         {/* Home Section */}
// <section id="home" className="bg-gradient-to-br from-blue-50 to-white py-20">
//   <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
//     <h2 className="text-5xl font-extrabold text-gray-900 mb-6">
//       Welcome to Groundwater Analyzer
//     </h2>
//     <p className="text-lg text-gray-700 mb-8">
//       A Smart India Hackathon initiative to monitor, analyze, and act on groundwater pollution across India.
//     </p>
//     <div className="flex justify-center space-x-4">
//       <a
//         href="#leaderboard"
//         className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
//       >
//         View Pollution Rankings
//       </a>
//       <a
//         href="#complaint"
//         className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition"
//       >
//         Raise a Concern
//       </a>
//     </div>
//   </div>
// </section>


//         {/* Leaderboard Section */}
//         <section id="leaderboard" className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//           {isLoading ? (
//             <div className="lg:col-span-2 flex items-center justify-center py-20">
//               <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-300 border-t-blue-600"></div>
//             </div>
//           ) : error ? (
//             <div className="lg:col-span-2 bg-red-100 text-red-800 p-4 rounded-md text-center">
//               <p>{error}</p>
//             </div>
//           ) : leaderboardData.length === 0 ? (
//             <div className="lg:col-span-2 text-center text-gray-500">
//               No data available at the moment.
//             </div>
//           ) : (
//             <>
//               <PollutionLeaderboard 
//                 data={leaderboardData} 
//                 title="Top 10 Least Polluted Cities (HPI)" 
//                 onViewTimeline={handleViewTimeline}
//               />
//               <PollutionLeaderboard 
//                 data={reversedLeaderboardData} 
//                 title="Top 10 Most Polluted Cities (HPI)" 
//                 onViewTimeline={handleViewTimeline}
//               />
//             </>
//           )}
//         </section>

//         {/* Partners and Complaint Section */}
//         <section className="lg:grid lg:grid-cols-2 gap-8 mt-12">
//           <div id="partners">
//             <PartnersBoard />
//           </div>
//           <div id="complaint">
//             <BlogSection />
//           </div>
//         </section>
//       </main>

//       <Footer />
//     </div>
//   );
// };

// export default MainPage;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Droplets, LogIn, ArrowRight, ArrowUp } from 'lucide-react';
import PollutionLeaderboard from './pollutionLeaderboard.jsx';
import PartnersBoard from './partnersBoard.jsx';
import BlogSection from './blogSection.jsx';
import API from '../api.js';
import Footer from '../components/footer.jsx';

const Navbar = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md shadow-md" aria-label="Main Navigation">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <Droplets className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">Beyond Null and Void</span>
          </div>
          <div className="flex items-center space-x-6">
            <a href="#home" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">Home</a>
            <a href="#leaderboard" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">Leaderboard</a>
            <a href="#features" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">Features</a>
            <a href="#partners" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">Partners</a>
            <a href="#complaint" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">Complaint</a>
            {isLoggedIn ? (
              <button onClick={() => navigate('/dashboard')} className="flex items-center space-x-2 px-4 py-2 text-sm font-semibold rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition">
                <span>Go to Dashboard</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button onClick={() => navigate('/login')} className="flex items-center space-x-2 px-4 py-2 text-sm font-semibold rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition">
                <LogIn className="h-4 w-4" />
                <span>Create account</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

const MainPage = () => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [reversedLeaderboardData, setReversedLeaderboardData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const role = localStorage.getItem('role');

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await API.get('/api/leaderboard?page=1&limit=10');
        const cities = res.data.cities;
        setLeaderboardData(cities);
        setReversedLeaderboardData([...cities].reverse());
      } catch (err) {
        console.error('Error fetching leaderboard data:', err);
        setError('Failed to load leaderboard data.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  const handleViewTimeline = (city) => {
    console.log(`View timeline for ${city}`);
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 pt-32">

        {/* Home Section */}
        <section id="home" className="bg-gradient-to-br from-blue-100 to-white py-24">
          <div className="text-center">
            <Droplets className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h2 className="text-5xl font-extrabold text-gray-900 mb-4">Groundwater Analyzer</h2>
            <p className="text-lg text-gray-700 mb-6">
              A Smart India Hackathon initiative to monitor, analyze, and act on groundwater pollution across India.
            </p>
            {role && (
              <p className="text-sm text-gray-500 mb-4 italic">
                Welcome back, <span className="font-semibold text-blue-600">{role}</span>!
              </p>
            )}
            <p className="italic text-gray-500 text-sm mb-10">
              “From beneath the surface, clarity rises. Let data speak for the water we drink.”
            </p>
            <div className="flex justify-center space-x-4">
              <a href="#leaderboard" className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition">View Pollution Rankings</a>
              <a href="#complaint" className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition">Raise a Concern</a>
            </div>
          </div>
        </section>

        {/* Leaderboard Section */}
        <section id="leaderboard" className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-16">
          {isLoading ? (
            <div className="lg:col-span-2 flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-300 border-t-blue-600"></div>
            </div>
          ) : error ? (
            <div className="lg:col-span-2 bg-red-100 text-red-800 p-4 rounded-md text-center">
              <p>{error}</p>
            </div>
          ) : leaderboardData.length === 0 ? (
            <div className="lg:col-span-2 text-center text-gray-500">
              No data available at the moment.
            </div>
          ) : (
            <>
              <PollutionLeaderboard 
                data={leaderboardData} 
                title="Top 10 Least Polluted Cities (HPI)" 
                onViewTimeline={handleViewTimeline}
              />
              <PollutionLeaderboard 
                data={reversedLeaderboardData} 
                title="Top 10 Most Polluted Cities (HPI)" 
                onViewTimeline={handleViewTimeline}
              />
            </>
          )}
        </section>

        {/* App Functionality Section */}
        <section id="features" className="bg-white py-24 border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl font-extrabold text-gray-900 text-center mb-6">What Our Platform Offers</h2>
            <p className="text-center text-gray-600 mb-12 max-w-3xl mx-auto">
              Groundwater Analyzer empowers communities, researchers, and NGOs with real-time insights, pollution tracking, and actionable data to safeguard water quality.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {[
                { title: '📊 Pollution Index Dashboard', desc: 'Visualize HPI, HEI, MPI, and PLI scores across cities.' },
                { title: '🧪 Sample Submission Portal', desc: 'Upload water sample data with source type and notes.' },
                { title: '📍 Location-Based Insights', desc: 'Track pollution metrics by district, state, or GPS.' },
                { title: '📥 Complaint & Feedback System', desc: 'Citizens can raise concerns anonymously and securely.' },
                { title: '🔐 Role-Based Dashboards', desc: 'Tailored views for NGOs, guests, and researchers.' },
                { title: '📈 Real-Time Data Updates', desc: 'Indices are computed and refreshed automatically.' },
              ].map((feature, idx) => (
                <div key={idx} className="bg-blue-50 p-6 rounded-lg shadow hover:shadow-md transition">
                  <h3 className="text-xl font-semibold text-blue-700 mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-700">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

                {/* Partners Section */}
        <section id="partners" className="bg-gray-50 py-20 border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-6">Our Partners</h2>
            <p className="text-center text-gray-600 mb-10 max-w-2xl mx-auto">
              Collaborating with institutions, NGOs, and researchers to build a cleaner, data-driven future.
            </p>
            <PartnersBoard />
          </div>
        </section>

        {/* Complaint Section */}
        <section id="complaint" className="bg-white py-20 border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-6">Raise a Concern</h2>
            <p className="text-center text-gray-600 mb-10 max-w-2xl mx-auto">
              Help us identify local issues. Submit feedback or complaints securely—your voice matters.
            </p>
            <BlogSection />
          </div>
        </section>
      </main>

      {/* Scroll to Top Button */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-6 right-6 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition"
        aria-label="Scroll to top"
      >
        <ArrowUp className="h-5 w-5" />
      </button>

      <Footer />
    </div>
  );
};

export default MainPage;

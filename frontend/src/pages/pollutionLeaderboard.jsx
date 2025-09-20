const PollutionLeaderboard = () => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const citiesPerPage = 10;

  useEffect(() => {
    // 🌍 Placeholder for fetching paginated leaderboard data from the backend
    const fetchLeaderboard = async () => {
      // Assuming a new backend endpoint like /api/leaderboard?page=1
      // const res = await API.get(`/api/leaderboard?page=${page}`);
      // setLeaderboardData(res.data.cities);
      // setTotalPages(res.data.totalPages);

      const mockData = [
        { city: 'Gwalior', pollutionIndex: 285.4 },
        { city: 'Kanpur', pollutionIndex: 250.1 },
        { city: 'Lucknow', pollutionIndex: 215.8 },
        { city: 'Varanasi', pollutionIndex: 198.5 },
        { city: 'Agra', pollutionIndex: 180.2 },
        { city: 'Allahabad', pollutionIndex: 165.7 },
        { city: 'Bareilly', pollutionIndex: 154.3 },
        { city: 'Meerut', pollutionIndex: 142.1 },
        { city: 'Jhansi', pollutionIndex: 130.9 },
        { city: 'Aligarh', pollutionIndex: 125.6 },
        { city: 'Moradabad', pollutionIndex: 110.3 },
        { city: 'Muzaffarnagar', pollutionIndex: 95.7 },
      ];
      setLeaderboardData(mockData.slice((page - 1) * citiesPerPage, page * citiesPerPage));
      setTotalPages(Math.ceil(mockData.length / citiesPerPage));
    };

    fetchLeaderboard();
  }, [page]);

  return (
    <Card className="mb-8">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <TrendingUp className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Top 10 Polluted Cities (HPI)</h3>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="py-2 px-4 text-gray-600">Rank</th>
                <th className="py-2 px-4 text-gray-600">City</th>
                <th className="py-2 px-4 text-gray-600">Pollution Index</th>
              </tr>
            </thead>
            <tbody>
              {leaderboardData.map((city, index) => (
                <tr key={city.city} className="border-b border-gray-200 last:border-b-0">
                  <td className="py-2 px-4 text-gray-900 font-medium">{(page - 1) * citiesPerPage + index + 1}</td>
                  <td className="py-2 px-4 text-gray-900">{city.city}</td>
                  <td className="py-2 px-4 text-gray-900 font-mono">{city.pollutionIndex.toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex justify-between items-center mt-4">
          <button
            onClick={() => setPage(page => Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600">Page {page} of {totalPages}</span>
          <button
            onClick={() => setPage(page => Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PollutionLeaderboard;
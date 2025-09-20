const BlogSection = () => {
  const [feedback, setFeedback] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!feedback) {
      setMessage('Feedback cannot be empty.');
      return;
    }

    // 📩 Placeholder for a public feedback submission endpoint
    // try {
    //   await axios.post('/api/feedback', { feedback });
    //   setMessage('Thank you for your valuable feedback!');
    //   setFeedback('');
    // } catch (error) {
    //   setMessage('Failed to submit feedback. Please try again.');
    // }
    
    console.log('Feedback submitted:', feedback);
    setMessage('Thank you for your valuable feedback! (Simulated submission)');
    setFeedback('');
  };

  return (
    <Card className="mb-8">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Mail className="h-5 w-5 text-orange-600" />
          <h3 className="text-lg font-semibold text-gray-900">Give Your Valuable Feedback</h3>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            className="w-full h-32 p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Share your thoughts or suggestions..."
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
          />
          <button
            type="submit"
            className="w-full px-4 py-2 text-white bg-blue-600 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Submit Feedback
          </button>
        </form>
        {message && <p className={`mt-4 text-center ${message.includes('Thank you') ? 'text-green-600' : 'text-red-600'}`}>{message}</p>}
      </CardContent>
    </Card>
  );
};


export default BlogSection;
import React, { useState, useEffect } from 'react';
import { Mail, MessageCircle } from 'lucide-react';
import { Card, CardHeader, CardContent } from '../components/card.jsx';
import API from '../api.js';

const BlogSection = () => {
  const [feedback, setFeedback] = useState('');
  const [message, setMessage] = useState('');
  const [feedbackList, setFeedbackList] = useState([]);

  useEffect(() => {
    fetchFeedback();
  }, []);

  const fetchFeedback = async () => {
    try {
      const res = await API.get('/api/feedback');
      setFeedbackList(res.data);
    } catch (error) {
      console.error('Error fetching feedback:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!feedback) {
      setMessage('Feedback cannot be empty.');
      return;
    }
    
    try {
      await API.post('/api/feedback', { feedback });
      setMessage('Thank you for your valuable feedback!');
      setFeedback('');
      fetchFeedback(); // Fetch updated list after submission
    } catch (error) {
      console.error('Feedback submission error:', error);
      setMessage('Failed to submit feedback. Please try again.');
    }
  };

  return (
    <>
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Mail className="h-5 w-5 text-orange-600" />
            <h3 className="text-lg font-semibold text-gray-900">Raise Complaint</h3>
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
              Raise Complaint
            </button>
          </form>
          {message && <p className={`mt-4 text-center ${message.includes('Thank you') ? 'text-green-600' : 'text-red-600'}`}>{message}</p>}
        </CardContent>
      </Card>
      
      {feedbackList.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <MessageCircle className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Recent Feedback</h3>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {feedbackList.map((item, index) => (
                <div key={index} className="border-b last:border-b-0 pb-2">
                  <p className="text-gray-800">{item.message}</p>
                  {/* <p className="text-sm text-gray-500 mt-1">
                    Submitted on {new Date(item.submitted_at).toLocaleDateString()}
                  </p> */}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
};

export default BlogSection;
import React, { useState, useEffect } from 'react';
import { Mail, MessageCircle, Send } from 'lucide-react';
import { Card, CardHeader, CardContent } from '../components/card.jsx';
import API from '../api.js';

export const ComplaintForm = () => {
  const [feedback, setFeedback] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!feedback) {
      setMessage('Complaint message cannot be empty.');
      return;
    }
    
    try {
      // 🔑 Sending feedback requires authentication if we want to associate it with a user.
      // Assuming the API endpoint will use the JWT token (if present) to log the userId.
      await API.post('/api/feedback', { feedback });
      setMessage('Thank you! Your complaint/feedback has been submitted.');
      setFeedback('');
    } catch (error) {
      console.error('Complaint submission error:', error);
      setMessage('Failed to submit complaint. Please try again.');
    }
  };

  const messageColor = message.includes('Thank you') ? 'text-success' : 'text-danger';

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Mail className="h-5 w-5 text-warning" />
          <h3 className="text-lg font-semibold text-text-light">Raise a Confidential Concern</h3>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            className="w-full h-32 p-3 border border-gray-600 bg-primary-dark text-text-light rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-accent-blue"
            placeholder="Describe the issue, location, or suggestion regarding groundwater quality..."
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
          />
          <button
            type="submit"
            className="w-full px-4 py-2 text-primary-dark bg-accent-blue rounded-lg font-semibold flex items-center justify-center space-x-2 hover:bg-sky-400/80 transition-colors"
          >
            <Send className="h-4 w-4" />
            <span>Submit Complaint</span>
          </button>
        </form>
        {message && <p className={`mt-4 text-center text-sm font-medium ${messageColor}`}>{message}</p>}
      </CardContent>
    </Card>
  );
};

// 🔑 NEW PROP: userSpecific (boolean) to control which endpoint is called
export const FeedbackList = ({ userSpecific = false }) => { 
  const [feedbackList, setFeedbackList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFeedback = async () => {
      setIsLoading(true);
      try {
        // 🔑 Determine which API endpoint to call based on the prop
        // Assumption: '/api/feedback' is public/all feedback, and 
        // '/api/user/feedback' is protected and fetches only user-specific feedback.
        const endpoint = userSpecific ? '/api/user/feedback' : '/api/feedback';
        
        // Note: '/api/user/feedback' would need to be added/implemented in backend routes.
        const res = await API.get(endpoint);
        setFeedbackList(res.data);
      } catch (error) {
        console.error(`Error fetching ${userSpecific ? 'user' : 'public'} feedback:`, error);
        // Optionally set error state here
      } finally {
        setIsLoading(false);
      }
    };
    fetchFeedback();
  }, [userSpecific]);

  const title = userSpecific ? 'My Submitted Concerns' : 'Recent Community Feedback';
  const iconColor = userSpecific ? 'text-accent-blue' : 'text-success';
  const emptyMessage = userSpecific 
    ? 'You have not submitted any complaints or concerns yet.' 
    : 'No recent community feedback available.';

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <MessageCircle className={`h-5 w-5 ${iconColor}`} />
          <h3 className="text-lg font-semibold text-text-light">{title}</h3>
        </div>
      </CardHeader>
      <CardContent className="h-full">
        {isLoading ? (
          <div className="flex justify-center items-center py-6">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-700 border-t-accent-blue"></div>
          </div>
        ) : feedbackList.length > 0 ? (
          <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
            {feedbackList.slice(0, 5).map((item, index) => (
              <div key={index} className="border-b border-gray-700 last:border-b-0 pb-3">
                <p className="text-text-light font-medium">{item.message}</p>
                <p className="text-xs text-text-muted mt-1 italic">
                  Submitted {new Date(item.submitted_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-text-muted text-center py-6">{emptyMessage}</p>
        )}
      </CardContent>
    </Card>
  );
};

// Default export remains for backward compatibility on mainPage
const BlogSection = () => (
  <>
    <ComplaintForm />
    <FeedbackList userSpecific={false} />
  </>
);

export default BlogSection;

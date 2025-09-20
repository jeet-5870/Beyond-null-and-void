const forgotPassword = (req, res) => {
  // 📧 Placeholder for forgot password logic:
  // 1. Validate email address from req.body
  // 2. Generate a secure, short-lived token
  // 3. Save the token to a password_resets table with an expiry date
  // 4. Send an email to the user with a link containing the token
  res.status(200).json({ message: 'If a matching email was found, a password reset link has been sent.' });
};
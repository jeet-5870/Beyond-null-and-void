const signup = async (req, res, next) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required.' });
  }

  try {
    const password_hash = await bcrypt.hash(password, 10);
    const result = await db.query(
      'INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING user_id',
      [username, password_hash]
    );
    
    const token = jwt.sign(
      { userId: result.rows[0].user_id, username: username },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(201).json({ token, userId: result.rows[0].user_id, message: "User created successfully." });
  } catch (err) {
    if (err.code === '23505') { // Unique violation for username
      return res.status(409).json({ error: 'Username already exists.' });
    }
    next(err);
  }
};
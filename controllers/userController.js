/*
 * userController.js
 */

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Register a new user
exports.register = async (req, res, supabase) => {
  const { email, username, password } = req.body;
  try {
    // Check if user already exists
    const { data: existingUser, error } = await supabase
      .from('USER')
      .select('*')
      .eq('email', email)
      .single();

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Create a new user
    const { data, error: createError } = await supabase
      .from('USER')
      .insert({ username: username, password: bcrypt.hashSync(password, 10), email: email })
      .single();

    if (createError) {
      return res.status(500).json({ error: createError.message });
    }

    res.json({ "res": true });
  } catch (error) {
    throw error;
  }
};

// Login user
exports.login = async (req, res, supabase) => {
  const { email, password } = req.body;

  try {
    // Find user by email
    const { data: user, error } = await supabase
      .from('USER')
      .select('*')
      .eq('email', email)
      .single();

    console.log(user)
    if (error || !user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user.id }, "work hard", { expiresIn: '1h' });
    req.session.userId = token;

    res.json({ user });
  } catch (error) {
    throw error;
  }
};

// User profile
exports.profile = async (req, res, supabase) => {
  try {
    // Find user by id
    const { data: user, error } = await supabase
      .from('USER')
      .select('*')
      .eq('id_user', req.body.userId)
      .single();

    if (error || !user) {
      return res.status(401).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    throw error;
  }
};

// Logout user
exports.logout = async (req, res) => {
  if (req.session) {
    req.session.destroy(function (error) {
      if (error) {
        throw error;
      } else {
        return res.redirect('/');
      }
    });
  }
}
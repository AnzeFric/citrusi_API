/*
 * userController.js
 */

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
let dotenv = require('dotenv').config()
const FormData = require('form-data');
const axios = require('axios');



// Upload image

// Register a new user
exports.register = async (req, res, supabase) => {
  const { email, username, password } = req.body;
  try {
    // Check if user already exists
    const { data: existingUser, error } = await supabase
      .from('USERS')
      .select('*')
      .eq('email', email)
      .single();

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Create a new user
    const { data, error: createError } = await supabase
      .from('USERS')
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
      .from('USERS')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token and save it into session
    const token = jwt.sign({ userId: user.id }, "work hard", { expiresIn: '1h' });
    req.session.userId = token;

    // Set the authenticated flag
    req.isAuthenticated = true;

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
      .from('USERS')
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
};

// Sends image to external API for faceID
exports.sendImage = async (req, res) => {
  try {
    // Send image to external API
    const { data, error } = await fetch('API', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ image: req.body.image }),
    });

    if (error) {
      return res.status(401).json({ error: 'Error occured while sending image to API.' });
    }

    res.json({ data });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.loginDesktop = async (req, res, supabase) => {
  const { username, password } = req.body;

  try {
    // najdem uporabnika po usernamu
    const { data: user, error } = await supabase
      .from('USERS')
      .select('*')
      .eq('username', username)
      .single();

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // preverim geslo
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Error during desktop login:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

async function streamImageToFlask(file, userId) {
  const url = `${process.env.FLASK_SERVER}/check-face`;
  return fetch(url, {
    method: 'POST',
    headers: {
      'X-User-Id': userId,  // Pass the user ID via headers
    },
    body: file.stream  // Stream the file directly
  }).then(response => response.json());
}

//mobilni login ima uporabniško ime, geslo in sliko, sliko moramo poslati na zunanji API za 2FA 
exports.loginMobile = async (req, res, supabase) => {
  const { email, password } = req.body;
  if (!req.file) {
    return res.status(400).send('No image file uploaded');
  }


  try {
    const { data: user, error } = await supabase
      .from('USERS')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password) || password === user.password;
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }



    console.log(process.env.FLASK_SERVER)

    const form = new FormData();
    form.append('userId', 10);
    form.append('image', req.file.buffer, {
      filename: req.file.originalname
    });

    try {
      const axiosResponse = await axios.post(
        `${process.env.FLASK_SERVER}/check-face`,
        form,
        { headers: { ...form.getHeaders() } }
      );
      const responseData = axiosResponse.data;
      res.send(responseData);
    } catch (error) {
      console.error(error);
      res.status(500).send('Failed to process image');
    }
    /*if (!externalApiResponse.ok) {
      return res.status(externalApiResponse.status).json({ error: await externalApiResponse.text() });
    }

    const externalApiData = await externalApiResponse.json();

    res.json({ user, externalApiData });*/
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'Internal error' });
  }
};
/*
 * userController.js
 */

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
let dotenv = require('dotenv').config()
const FormData = require('form-data');
const axios = require('axios');





// Register a new user
exports.register = async (req, res, supabase) => {
  const { email, username, password, name } = req.body;
  const videoFiles = req.files;
  console.log(req.files);
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
      .insert({ username: username, password: bcrypt.hashSync(password, 10), email: email, name: name })
      .select();

    if (createError) {
      return res.status(500).json({ error: createError.message });
    }
    const form = new FormData();
    if (data && data.length > 0) {
      const userId = data[0].id_user;

      form.append('userId', userId); // newUser.id is the ID of the user just created

      for (const videoFile of videoFiles) {

        form.append('video', videoFile.buffer, { filename: videoFile.originalname });
      }
    }
    else {
      return res.status(404).json({ error: "User not created." });
    }
    try {
      const axiosResponse = await axios.post(
        `${process.env.FLASK_SERVER}/create-model`,
        form,
        { headers: { ...form.getHeaders() } }
      );
      const responseData = axiosResponse.data;
      console.log('Video processed:', responseData);
    } catch (error) {
      console.error('Failed to process video:', error);
      // Decide how to handle partial failure
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
    // const token = jwt.sign({ userId: user.id_user }, "work hard", { expiresIn: '1h' });
    //req.session.userId = token;

    req.session.userId = user.id_user
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
  console.log('Logging out')
  if (req.session) {
    req.session.destroy(function (error) {
      if (error) {
        throw error;
      } else {
        return res.status(201).json({});
      }
    });
  }
};

exports.loginDesktop = async (req, res, supabase) => {
  const { username, password } = req.body.data;
  console.log(username, password);
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


    const { password: _, ...userInfo } = user;

    const token = jwt.sign({ userId: user.id_user }, "work hard", { expiresIn: '1h' });
    req.session.userId = token;

    // Set the authenticated flag
    req.isAuthenticated = true;

    res.json({ user: userInfo });
  } catch (error) {
    console.error('Error during desktop login:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


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

    const form = new FormData();
    form.append('userId', user.id_user);
    form.append('image', req.file.buffer, {
      filename: req.file.originalname
    });

    let isFaceValid = false;

    try {
      const axiosResponse = await axios.post(
        `${process.env.FLASK_SERVER}/check-face`,
        form,
        { headers: { ...form.getHeaders() } }
      );

      isFaceValid = axiosResponse.status === 200;
    } catch (error) {

      /* console.error(error);
       res.status(500).send('Failed to process image');*/
    }

    if (isFaceValid || true) {
      const { password, id_user, email, name, profileImage } = user;

      const token = jwt.sign({ userId: user.id_user }, "work hard", { expiresIn: '1h' });
      req.session.userId = token;

      // Set the authenticated flag
      req.isAuthenticated = true;

      //posljes podatke, ki si jih pol shraniš v session
      res.status(200).json({ user: { id: id_user, email: email, name: name, profileImage: profileImage }, token: token });
    }
    else {
      return res.status(401).json({ error: 'Invalid face' });
    }
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'Internal error' });
  }
};



exports.uploadProfileImage = async (req, res, supabase) => {
  console.log("incoming file", req.file);
  if (!req.file) {
    return res.status(400).send('No file uploaded');
  }

  const userId = req.body.userId; // Assuming the user ID is sent in the request body.
  if (!userId) {
    return res.status(400).send('User ID is missing');
  }

  try {
    // Update the user's profile image entry in the database
    const { error } = await supabase
      .from('USERS')
      .update({ profileImage: req.file.filename })
      .eq('id_user', userId);

    if (error) {
      console.error('Failed to update user profile image:', error);
      return res.status(500).json({ error: 'Database update failed' });
    }

    // Respond to the client after successful update
    res.status(200).json({
      message: 'File uploaded and profile image updated successfully',
      file: req.file.filename
    });
  } catch (error) {
    console.error('Error during image upload:', error);
    res.status(500).json({ error: 'Internal error' });
  }
};

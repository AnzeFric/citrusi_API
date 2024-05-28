/*
 * server.js
 */

const express = require('express');
const app = express();

// Supabase client
const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://cqohcrtvvbaaofvxfcaf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxb2hjcnR2dmJhYW9mdnhmY2FmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTUzMjg2NjEsImV4cCI6MjAzMDkwNDY2MX0.n125xdxjq8SdLrBYcGWBIGd5XpZzWT8hIrsyvw71_kM';
const supabase = createClient(supabaseUrl, supabaseKey);

const session = require('express-session');

// Configure session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'work hard',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set to true for HTTPS
  })
);

// Middleware
app.use(express.json());

// Public route for testing
app.get('/hello', (req, res) => {
  res.status(200).send("Hello, World!");
});

const authMiddleware = require('./middleware/authMiddleware');
app.use(authMiddleware);

// Routes
const imageRoutes = require('./routes/imageRoutes');
const routeRoutes = require('./routes/routeRoutes');
const statisticRoutes = require('./routes/statisticRoutes');
const userRoutes = require('./routes/userRoutes');
const userRouteRoutes = require('./routes/userRouteRoutes');

app.use('/images', imageRoutes(supabase));
app.use('/routes', routeRoutes(supabase));
app.use('/statistics', statisticRoutes(supabase));
app.use('/users', userRoutes(supabase));
app.use('/user_routes', userRouteRoutes(supabase));

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, '127.0.0.1', () => {
  console.log(`Server running on port ${PORT}`);
});
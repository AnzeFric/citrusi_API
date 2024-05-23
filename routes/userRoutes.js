/*
 * userRoutes.js
 */

var express = require('express');
var router = express.Router();
var userController = require('../controllers/userController.js');

module.exports = (supabase) => {
    // Get profile info 
    router.get('/profile', (req, res) => userController.profile(req, res, supabase));

    // Logout an user
    router.get('/logout', userController.logout);

    // Register an user
    router.post('/register', (req, res) => userController.register(req, res, supabase));

    // Login an user
    router.post('/login', (req, res) => userController.login(req, res, supabase));

    router.post('/loginMobile', (req, res) => userController.loginMobile(req, res, supabase));
    router.post('/loginDesktop', (req, res) => userController.loginDesktop(req, res, supabase));

    return router;
};
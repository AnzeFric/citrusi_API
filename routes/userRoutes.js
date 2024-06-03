/*
 * userRoutes.js
 */

var express = require('express');
var router = express.Router();
var userController = require('../controllers/userController.js');
var multer = require('multer');
var upload = multer({ storage: multer.memoryStorage() });


module.exports = (supabase) => {
    // Get profile info 
    router.get('/profile', (req, res) => userController.profile(req, res, supabase));

    // Logout an user
    router.get('/logout', userController.logout);

    // Register an user
    router.post('/register', (req, res) => userController.register(req, res, supabase));

    // Login an user
    router.post('/login', (req, res) => userController.login(req, res, supabase));

    // Send image to external api for faceID login
    router.post('/sendImage', userController.sendImage);

    router.post('/loginMobile', upload.single('image'), (req, res) => userController.loginMobile(req, res, supabase));
    router.post('/loginDesktop', (req, res) => userController.loginDesktop(req, res, supabase));

    return router;
};

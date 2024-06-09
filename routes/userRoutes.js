/*
 * userRoutes.js
 */

var express = require('express');
var router = express.Router();
var userController = require('../controllers/userController.js');
var multer = require('multer');

const storageM = multer.memoryStorage();
const uploadM = multer({ storage: storageM });
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/profileImages');
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now() + '.' + file.originalname.split('.').pop());
    }
});
const upload = multer({ storage: storage });
module.exports = (supabase) => {
    // Get profile info 
    router.get('/profile', (req, res) => userController.profile(req, res, supabase));

    // Logout an user
    router.get('/logout', userController.logout);

    router.get('/friends', (req, res) => userController.friends(req, res, supabase));

    router.get('/stats', (req, res) => userController.stats(req, res, supabase));

    router.post('/add-friend', (req, res) => userController.addFriend(req, res, supabase));


    // Register an user
    router.post('/register', uploadM.array('video', 4), (req, res) => userController.register(req, res, supabase));

    // Login an user
    router.post('/login', (req, res) => userController.login(req, res, supabase));

    router.post('/upload-profile-image', upload.single('image'), (req, res) => userController.uploadProfileImage(req, res, supabase));

    router.post('/loginMobile', uploadM.single('image'), (req, res) => userController.loginMobile(req, res, supabase));

    router.post('/loginDesktop', (req, res) => userController.loginDesktop(req, res, supabase));

    return router;
};

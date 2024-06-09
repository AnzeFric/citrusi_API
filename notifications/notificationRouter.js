const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const JWT_SECRET = 'your_secret_key';

let registeredDevices = [];
let clients = [];
let usersWaitingForSignIn = [];


router.post('/register', (req, res) => {
    const { deviceToken, userId } = req.body;
    console.log("device")
    // pogledam če je naprava že registrirana
    const existingDevice = clients.find(client => client.token === deviceToken || client.type === "mobile");

    if (existingDevice) {
        // če je že registrirana
        console.log('Device already registered:', existingDevice);
        res.status(400).json({ error: 'Device already registered' });
    } else {
        // če ni jo registriram
        const newDevice = { token: deviceToken, userId, type: 'mobile' };
        registeredDevices.push(newDevice);

        const token = jwt.sign({
            userId: userId,
            deviceToken: deviceToken,
            type: 'mobile'
        }, JWT_SECRET, { expiresIn: '1h' });

        console.log('Device registered:', newDevice);
        res.status(200).json({ message: 'Device registration successful', token });
    }
});

// inicializacija SSE
router.get('/events', (req, res) => {
    console.log("events")
    const token = req.query.token;
    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }
    try {
        const decoded = jwt.verify(token, JWT_SECRET);

        req.socket.setTimeout(0);
        res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
        });
        res.write('\n');

        // za poslušalce skrbim v arrayu
        const clientId = Date.now();
        const newClient = {
            id: clientId,
            userId: decoded.userId,
            type: decoded.type,
            response: res
        };
        console.log(`Client ${decoded.userId} Connection opened`);
        clients.push(newClient);

        req.on('close', () => {
            console.log(`Client ${clientId} Connection closed`);
            clients = clients.filter(client => client.id !== clientId);
        });
    } catch (err) {
        res.status(403).json({ error: 'Invalid token' });
    }
});

function registerDesktopDevice(deviceToken, userId) {
    const existingDevice = registeredDevices.find(client => client.token === deviceToken || client.type === "desktop");

    if (existingDevice) {
        console.log('Desktop device already registered:', existingDevice);

        const token = jwt.sign({
            userId: existingDevice.userId,
            deviceToken: existingDevice.deviceToken,
            type: 'desktop'
        }, JWT_SECRET, { expiresIn: '1h' });

        return token;
    } else {
        const newDevice = { token: deviceToken, userId, type: 'desktop' };
        registeredDevices.push(newDevice);
        console.log('Desktop device registered:', newDevice);
        const token = jwt.sign({
            userId: userId,
            deviceToken: deviceToken,
            type: 'desktop'
        }, JWT_SECRET, { expiresIn: '1h' });

        return token;
    }
}


function sendNotificationToUser(token, userId, message, type) {
    let client = clients.find(client => client.userId === userId || client.type === "mobile");
    if (client) {


        const data = JSON.stringify({ message, type, token });
        client.response.write(`data: ${data}\n\n`);
    } else {
        console.log("No active connection for user:", userId);
    }
}

function sendNotificationToDesktop(userId, message, type) {

    let client = clients.find(client => client.userId === userId || client.type === "desktop");
    if (client) {
        usersWaitingForSignIn.push(userId)
        const data = JSON.stringify({ message, type });
        client.response.write(`data: ${data}\n\n`);
        clients = clients.filter(client => client.userId !== userId || client.type === "desktop");
    } else {
        console.log("No active connection for user:", userId);
    }
}
module.exports = { router, sendNotificationToUser, registerDesktopDevice, sendNotificationToDesktop, usersWaitingForSignIn };
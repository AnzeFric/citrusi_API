const express = require('express');
const router = express.Router();

let clients = [];

router.post('/register', (req, res) => {
    const { deviceToken, userId } = req.body;
    console.log("device")
    // Check if the device is already registered
    const existingDevice = clients.find(client => client.token === deviceToken);

    if (existingDevice) {
        // Device is already registered
        console.log('Device already registered:', existingDevice);
        res.status(400).json({ error: 'Device already registered' });
    } else {
        // Device is not registered, register it
        const newDevice = { token: deviceToken, userId };
        clients.push(newDevice);
        console.log('Device registered:', newDevice);
        res.status(200).json({ message: 'Device registration successful' });
    }
});

// Route for initializing server-sent events (SSE) connection
router.get('/events', (req, res) => {
    const { userId } = req.query; // Assume userId is passed as a query parameter

    req.socket.setTimeout(0); // Disable timeout
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
    });
    res.write('\n');

    // Keep track of the client by pushing it to the clients array
    const clientId = Date.now();
    const newClient = {
        id: clientId,
        userId: userId,
        response: res
    };
    clients.push(newClient);

    req.on('close', () => {
        console.log(`Client ${clientId} Connection closed`);
        clients = clients.filter(client => client.id !== clientId);
    });
});

// Function to send notifications to connected clients
function sendNotificationToUser(userId, message, type) {
    console.log(clients)
    let client = clients.find(client => client.userId === userId);
    if (client) {
        const data = JSON.stringify({ message, type });
        client.response.write(`data: ${data}\n\n`);
    } else {
        console.log("No active connection for user:", userId);
    }
}

module.exports = { router, sendNotificationToUser };
const express = require('express');
const path = require('path');
const os = require('os');
const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the current directory
app.use(express.static(__dirname));

// Get local IP address
function getLocalIP() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const interface of interfaces[name]) {
            const {address, family, internal} = interface;
            if (family === 'IPv4' && !internal) {
                return address;
            }
        }
    }
    return 'localhost';
}

// Start server
app.listen(PORT, '0.0.0.0', () => {
    const localIP = getLocalIP();
    console.log('\n🎮 Asteroids Game Server Running!');
    console.log('=====================================');
    console.log(`📱 Local: http://localhost:${PORT}`);
    console.log(`🌐 Network: http://${localIP}:${PORT}`);
    console.log('\n📋 Instructions for your friend:');
    console.log('1. Connect to the same WiFi network as this computer');
    console.log(`2. Open Safari/Chrome on iPhone and go to: http://${localIP}:${PORT}`);
    console.log('3. Tap Share → "Add to Home Screen" to install as app');
    console.log('\n⚠️  Make sure your firewall allows connections on port', PORT);
    console.log('=====================================\n');
});

// Handle 404s by serving index.html (for PWA routing)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
}); 
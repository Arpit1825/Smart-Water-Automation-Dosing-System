const { log } = require('console');
const express = require('express');
const app = express();
const path = require('path');
const PORT = 5000;

// Global Control Status Variables
let currentDosingStatus = false; 
let currentDrainStatus = false;

// Middleware Setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));

// Live Telemetry Data Store
let liveWaterData = {
    tds: 0,
    waterLevel: 0,
    floatSwitch: 'UNKNOWN'
};

// 1. Home Route to serve Dashboard HTML
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// 2. ESP32 Telemetry Receiver Route (FIXED: Single Response Loop)
app.post('/api/update-sensor', (req, res) => {
    const { tds, waterLevel, floatSwitch } = req.body;

    // Save current states
    liveWaterData = { tds, waterLevel, floatSwitch };

    console.log("\n=============================================");
    console.log("📥 Live data received by Arpit from ESP32:", liveWaterData);
    console.log(`🧪 Dosing Pump Sync State: ${currentDosingStatus}`);
    console.log(`🚰 Drain Pump Sync State: ${currentDrainStatus}`);
    console.log("=============================================");

    // SINGLE CLEAN RESPONSE ESP32 parse
    res.json({
        success: true,
        message: "Data received successfully by Arpit",
        dosingPump: currentDosingStatus, 
        drainPump: currentDrainStatus
    });
});

// 3. Frontend Live Status Long Polling/Fetch Endpoint
app.get('/api/live-status', (req, res) => {
    res.json(liveWaterData);
});

// 4. Dashboard Manual Toggle Route for Dosing Pump
app.post('/api/toggle-dosing', (req, res) => {
    const { status } = req.body; // Front-end JSON payload: { "status": true/false }
    currentDosingStatus = status;
    
    console.log(`\n🎛️ Dashboard Manual Event: Dosing Pump changed to -> ${currentDosingStatus}`);
    res.json({ success: true, dosingPump: currentDosingStatus });
});

// 5. Dashboard Manual Toggle Route for Drainage Pump
app.post('/api/toggle-drain', (req, res) => {
    const { status } = req.body; // Front-end JSON payload: { "status": true/false }
    currentDrainStatus = status;

    console.log(`\n🎛️ Dashboard Manual Event: Drain Pump changed to -> ${currentDrainStatus}`);
    res.json({ success: true, drainPump: currentDrainStatus });
});

// Start Automation Server
app.listen(PORT, function () {
    console.log(`---------------------------------------------`);
    console.log(`Automation server is working on PORT:${PORT}`);
    console.log(`---------------------------------------------`);
});
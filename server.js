const { log } = require('console');
const express = require('express');
const mongoose = require('mongoose');
const app = express();
const path = require('path');
const WaterData = require('./models/WaterData'); // Model Name locked
const PORT = 5000;

// Global Control Status Variables
let currentDosingStatus = false; 
let currentDrainStatus = false;
let systemMode = "MANUAL";

// Middleware Setup
const cors = require('cors');
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));

// MongoDB Atlas Cloud Connection
mongoose.connect('mongodb+srv://USERNAME:USER_PASSWORD@user.f2fceom.mongodb.net/waterAutomationDB?retryWrites=true&w=majority&appName=User')
.then(() => console.log("☁️ MongoDB Atlas is successfully connected by Arpit!"))
.catch((err) => { console.error("❌ MongoDB error detected: ", err); });

// Live Telemetry Data Store
let liveWaterData = {
    tds: 0,
    waterLevel: 0,
    floatSwitch: 'UNKNOWN',
    mode: 'MANUAL'
};

// 1. Home Route to serve Dashboard HTML
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// 2. ESP32 Telemetry Receiver Route (FIXED: async added & model name fixed)
app.post('/api/update-sensor', async (req, res) => {
    try {
        const { tds, waterLevel, floatSwitch } = req.body;

        // Save current states to RAM object
        liveWaterData = { tds, waterLevel, floatSwitch, mode: systemMode };
        
        // Permanent Save to Cloud (Using the correct WaterData Model)
        const logData = new WaterData({
            tds: Number(tds),
            waterLevel: Number(waterLevel),
            floatSwitch: floatSwitch
        });
        await logData.save();

        console.log("💾 Data Logged to MongoDB Atlas Successfully!");

        console.log("\n=============================================");
        console.log("📥 Live data received by Arpit from ESP32:", liveWaterData);
        console.log(`🧪 Dosing Pump Sync State: ${currentDosingStatus}`);
        console.log(`🚰 Drain Pump Sync State: ${currentDrainStatus}`);
        console.log("=============================================");

        // Automation & Safety Logic
        if (floatSwitch === "ALERT") {
            currentDosingStatus = false;
            currentDrainStatus = false;
            console.log("🚨 EMERGENCY: Float Switch High! Stopping All Pumps.");
        } 
        else if (systemMode === "AUTOMATIC") {
            if (tds > 600 || waterLevel < 50) {
                currentDosingStatus = true;
            } else {
                currentDosingStatus = false;
            }

            if (waterLevel >= 95) {
                currentDrainStatus = true;
            } else {
                currentDrainStatus = false;
            }
        }
        
        // SINGLE CLEAN RESPONSE
        res.json({
            success: true,
            message: "Data received successfully by Arpit",
            dosingPump: currentDosingStatus, 
            drainPump: currentDrainStatus
        });

    } catch (err) {
        console.error("❌ Error processing or saving data:", err); // Fixed reference to err
        res.status(500).json({ success: false, message: "Server Database Error" });
    }
});

// 3. Frontend Live Status Fetch Endpoint
app.get('/api/live-status', (req, res) => {
    res.json(liveWaterData);
});
app.post('/api/toggle-mode', (req, res) => {
    const { mode } = req.body; 
    systemMode = mode;
    
    if (systemMode === "AUTOMATIC") {
        currentDosingStatus = false;
        currentDrainStatus = false;
    }
    
    liveWaterData.mode = systemMode;
    liveWaterData.dosingPump = currentDosingStatus;
    liveWaterData.drainPump = currentDrainStatus;
    
    console.log(`\n🔄 System Mode Changed to -> ${systemMode}`);
    res.json({ success: true, mode: systemMode, dosingPump: currentDosingStatus, drainPump: currentDrainStatus });
});

// 🧪 Dashboard Manual Toggle for Dosing Pump
app.post('/api/toggle-dosing', (req, res) => {
    const { status } = req.body; 
    if (systemMode === "MANUAL") {
        currentDosingStatus = status;
        liveWaterData.dosingPump = currentDosingStatus;
        console.log(`🧪 Manual Dosing Pump: ${currentDosingStatus ? "ON" : "OFF"}`);
        res.json({ success: true, dosingPump: currentDosingStatus });
    } else {
        res.json({ success: false, message: "Switch to MANUAL mode first!" });
    }
});

// 🚰 Dashboard Manual Toggle for Drainage Pump
app.post('/api/toggle-drain', (req, res) => {
    const { status } = req.body; 
    if (systemMode === "MANUAL") {
        currentDrainStatus = status;
        liveWaterData.drainPump = currentDrainStatus;
        console.log(`🚰 Manual Drain Pump: ${currentDrainStatus ? "ON" : "OFF"}`);
        res.json({ success: true, drainPump: currentDrainStatus });
    } else {
        res.json({ success: false, message: "Switch to MANUAL mode first!" });
    }
});

// Start Automation Server
app.listen(PORT, function () {
    console.log(`---------------------------------------------`);
    console.log(`Automation server is working on PORT:${PORT}`);
    console.log(`---------------------------------------------`);
});

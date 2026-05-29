// models/WaterData.js
const mongoose = require('mongoose');

const WaterDataSchema = new mongoose.Schema({
    tds: { 
        type: Number, 
        required: true 
    },
    waterLevel: { 
        type: Number, 
        required: true 
    },
    floatSwitch: { 
        type: String, 
        required: true 
    },
    timestamp: { 
        type: Date, 
        default: Date.now 
    }
});

module.exports = mongoose.model('WaterData', WaterDataSchema);
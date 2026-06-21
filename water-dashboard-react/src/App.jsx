import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TelemetryCharts from './components/TelemetryCharts'; // 👈 Imported Custom Chart Element
import AlertsPanel from './components/AlertsPanel';       // 👈 Imported Custom Alerts Element

function App() {
  const [chartTimeline, setChartTimeline] = useState([]);
  const [tdsHistory, setTdsHistory] = useState([]);
  const [levelHistory, setLevelHistory] = useState([]);
  const [sensorData, setSensorData] = useState({
    tds: 0,
    waterLevel: 0,
    floatSwitch: 'UNKNOWN',
    mode: 'MANUAL',
    dosingPump: false,
    drainPump: false
  });
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState([]);
  const [lastAlertState, setLastAlertState] = useState({ tdsCritical: false, levelCritical: false });

const API_BASE_URL = import.meta.env.VITE_API_URL;

console.log("API_BASE_URL =", API_BASE_URL);

  const triggerAlert = (type, text) => {
    const time = new Date().toLocaleTimeString();
    setAlerts(prev => [{ time, type, text }, ...prev.slice(0, 3)]);
  };

  const handleAlertLogic = (tds, level) => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    let newAlerts = [];
    let currentAlertState = { ...lastAlertState };

    if (tds > 600 && !lastAlertState.tdsCritical) {
      newAlerts.push({ time, type: 'CRITICAL', text: `⚠️ High Contamination: TDS crossed normal limit at ${tds} PPM!` });
      currentAlertState.tdsCritical = true;
    } else if (tds <= 600 && lastAlertState.tdsCritical) {
      newAlerts.push({ time, type: 'STABLE', text: `✅ Water Purity Restored: TDS safe at ${tds} PPM.` });
      currentAlertState.tdsCritical = false;
    }

    if ((level > 90 || level < 15) && !lastAlertState.levelCritical) {
      const levelType = level > 90 ? 'OVERFLOW RISK' : 'LOW STORAGE';
      newAlerts.push({ time, type: 'WARNING', text: `🚨 ${levelType}: Reservoir volume capacity reached ${level}%!` });
      currentAlertState.levelCritical = true;
    } else if (level >= 15 && level <= 90 && lastAlertState.levelCritical) {
      newAlerts.push({ time, type: 'STABLE', text: `✅ Reservoir Level Normal: Water capacity stabilized at ${level}%.` });
      currentAlertState.levelCritical = false;
    }

    if (newAlerts.length > 0) {
      setAlerts(prev => [...newAlerts, ...prev].slice(0, 4));
      setLastAlertState(currentAlertState);
    }
  };

  const fetchLiveStatus = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/live-status`);
      const data = response.data;
      
      setSensorData(prev => ({ ...prev, ...data }));
      handleAlertLogic(data.tds ?? 0, data.waterLevel ?? 0);

      const currentTimeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setChartTimeline(prev => [...prev.slice(-9), currentTimeString]);
      setTdsHistory(prev => [...prev.slice(-9), data.tds ?? 0]);
      setLevelHistory(prev => [...prev.slice(-9), data.waterLevel ?? 0]);

      setLoading(false);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchLiveStatus();
    const pollingInterval = setInterval(fetchLiveStatus, 3000);
    return () => clearInterval(pollingInterval);
  }, [lastAlertState]);

  const handleModeToggle = async () => {
    try {
      const nextMode = sensorData.mode === "MANUAL" ? "AUTOMATIC" : "MANUAL";
      const response = await axios.post(`${API_BASE_URL}/toggle-mode`, { mode: nextMode });
      if (response.data.success) {
        setSensorData(prev => ({ ...prev, mode: nextMode }));
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handlePumpToggle = async (endpoint, currentStatus, key) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/${endpoint}`, { status: !currentStatus });
      if (response.data.success) {
        setSensorData(prev => ({ ...prev, [key]: !currentStatus }));
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="w-screen min-h-screen bg-[#0B0F19] text-gray-100 px-4 md:px-8 lg:px-12 font-sans antialiased selection:bg-blue-500 selection:text-white">
      <header className="mt-8 w-full bg-gray-900/40 backdrop-blur-md border border-gray-800/60 rounded-2xl p-6 mb-8 flex flex-col sm:flex-row justify-between items-center shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-blue-500 to-purple-500"></div>
        <div className="mb-4 sm:mb-0">
          <div className="flex items-center gap-3">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
            </span>
            <h1 className="text-2xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-200 to-purple-400">
              Smart Water Automation and Dosing System
            </h1>
          </div>
          <p className="text-l text-gray-400 font-medium tracking-wide mt-1">
            System Operations Dashboard • Arpit Verma
          </p>
        </div>
        <div className={`px-5 py-2 rounded-xl text-xs font-black tracking-widest border uppercase transition-all duration-300 ${
          sensorData.floatSwitch === 'ALERT' || sensorData.floatSwitch === 'HIGH'
            ? 'bg-red-950/40 text-red-400 border-red-800/60 shadow-[0_0_15px_rgba(239,68,68,0.15)] animate-pulse' 
            : 'bg-emerald-950/40 text-emerald-400 border-emerald-800/60 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
        }`}>
          🛰️ Status: {sensorData.floatSwitch}
        </div>
      </header>

      {loading ? (
        <div className="flex flex-col items-center justify-center mt-32 space-y-4">
          <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
          <p className="text-gray-400 font-medium font-mono tracking-widest text-sm">INITIALIZING CLOUD DATASTREAM...</p>
        </div>
      ) : (
        <main className="w-full flex flex-col space-y-8">
          
          <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <h2 className="text-xs font-bold tracking-widest text-gray-400 uppercase px-1">Live Telemetry Matrices</h2>
              
              <div className="bg-gray-900/30 backdrop-blur-md border border-gray-800/80 rounded-2xl p-6 shadow-xl relative overflow-hidden group hover:border-blue-500/30 transition-all duration-300">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-400">Tank Volume Reservoir</h3>
                    <p className="text-3xl font-black font-mono mt-1 text-blue-400 tracking-tight">{sensorData.waterLevel}<span className="text-lg font-medium text-gray-500">%</span></p>
                  </div>
                  <div className="p-3 bg-blue-950/40 border border-blue-900/50 rounded-xl text-blue-400">🎚️</div>
                </div>
                
                <div className="w-full h-4 bg-gray-950 rounded-full overflow-hidden p-[2px] border border-gray-800">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-600 to-sky-400 rounded-full transition-all duration-1000 relative shadow-[0_0_10px_rgba(56,189,248,0.4)]"
                    style={{ width: `${sensorData.waterLevel}%` }}
                  >
                    <div className="absolute top-0 right-0 bottom-0 left-0 bg-[linear-gradient(45deg,rgba(255,255,255,.15)_25%,transparent_25%,transparent_50%,rgba(255,255,255,.15)_50%,rgba(255,255,255,.15)_75%,transparent_75%,transparent)] bg-[length:1rem_1rem] animate-[move-bg_1s_linear_infinite]"></div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-900/30 backdrop-blur-md border border-gray-800/80 rounded-2xl p-6 shadow-xl group hover:border-purple-500/30 transition-all duration-300">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-400">Total Dissolved Solids (TDS)</h3>
                    <p className={`text-3xl font-black font-mono mt-1 tracking-tight ${sensorData.tds > 600 ? 'text-rose-400 text-glow-red' : 'text-purple-400'}`}>
                      {sensorData.tds} <span className="text-sm font-bold text-gray-500 tracking-normal">PPM</span>
                    </p>
                  </div>
                  <div className={`p-3 rounded-xl border transition-colors ${sensorData.tds > 600 ? 'bg-rose-950/40 border-rose-900/50 text-rose-400' : 'bg-purple-950/40 border-purple-900/50 text-purple-400'}`}>
                    🧪
                  </div>
                </div>
                <div className="mt-4 flex justify-between items-center text-xs font-semibold">
                  <span className="text-gray-500">Water Purity Status:</span>
                  <span className={sensorData.tds > 600 ? 'text-rose-400 font-bold animate-pulse' : 'text-emerald-400 font-bold'}>
                    {sensorData.tds > 600 ? '⚠️ CRITICAL CONTAMINATION' : '✅ STABLE / OPTIMAL'}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="text-xs font-bold tracking-widest text-gray-400 uppercase px-1">Hardware Actuator Matrix</h2>
              
              <div className="bg-gray-900/30 backdrop-blur-md border border-gray-800/80 rounded-2xl p-6 shadow-xl space-y-6">
                <div className="flex justify-between items-center border-b border-gray-800/60 pb-4">
                  <div>
                    <h3 className="text-sm font-bold tracking-wide">Operation Framework</h3>
                    <p className="text-xs text-gray-500 mt-0.5">Toggle safety state & triggers</p>
                  </div>
                  <button 
                    onClick={handleModeToggle}
                    className={`px-5 py-2 rounded-xl text-xs font-black tracking-widest uppercase transition-all duration-300 border ${
                      sensorData.mode === "AUTOMATIC" 
                        ? "bg-indigo-600/20 text-indigo-400 border-indigo-500/40 shadow-[0_0_15px_rgba(99,102,241,0.15)] hover:bg-indigo-600/30" 
                        : "bg-amber-600/20 text-amber-400 border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.15)] hover:bg-amber-600/30"
                    }`}
                  >
                    ⚙️ {sensorData.mode}
                  </button>
                </div>

                <div className="flex justify-between items-center p-4 bg-gray-950/40 rounded-xl border border-gray-800/50">
                  <div>
                    <h4 className="text-sm font-bold tracking-wide text-gray-300">Chemical Dosing Pump</h4>
                    <p className="text-xs text-gray-500 mt-0.5">Neutralizer injection node</p>
                  </div>
                  <button
                    onClick={() => handlePumpToggle('toggle-dosing', sensorData.dosingPump, 'dosingPump')}
                    className={`w-20 py-2 rounded-lg text-xs font-black tracking-wider uppercase transition-all duration-200 border ${
                      sensorData.dosingPump 
                        ? "bg-emerald-500 text-gray-950 border-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.3)]" 
                        : "bg-gray-900 text-gray-400 border-gray-800 hover:text-gray-300 hover:border-gray-700"
                    }`}
                  >
                    {sensorData.dosingPump ? "RUNNING" : "STOPPED"}
                  </button>
                </div>

                <div className="flex justify-between items-center p-4 bg-gray-950/40 rounded-xl border border-gray-800/50">
                  <div>
                    <h4 className="text-sm font-bold tracking-wide text-gray-300">Flush / Drainage Valve</h4>
                    <p className="text-xs text-gray-500 mt-0.5">Contaminated fluid evacuation</p>
                  </div>
                  <button
                    onClick={() => handlePumpToggle('toggle-drain', sensorData.drainPump, 'drainPump')}
                    className={`w-20 py-2 rounded-lg text-xs font-black tracking-wider uppercase transition-all duration-200 border ${
                      sensorData.drainPump 
                        ? "bg-emerald-500 text-gray-950 border-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.3)]" 
                        : "bg-gray-900 text-gray-400 border-gray-800 hover:text-gray-300 hover:border-gray-700"
                    }`}
                  >
                    {sensorData.drainPump ? "RUNNING" : "STOPPED"}
                  </button>
                </div>

                <div className="pt-2 text-center border-t border-gray-800/40">
                  <span className="inline-flex items-center gap-1.5 text-[13px] font-mono tracking-wider text-gray-500 uppercase">
                    ⚡ Lifecycle Nodes Synced with MongoDB Atlas Cloud
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* LOWER HALF*/}
          <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 pb-8">
            <TelemetryCharts 
              chartTimeline={chartTimeline} 
              tdsHistory={tdsHistory} 
              levelHistory={levelHistory} 
            />
            <AlertsPanel alerts={alerts} />
          </div>

        </main>
      )}
    </div>
  );
}

export default App;
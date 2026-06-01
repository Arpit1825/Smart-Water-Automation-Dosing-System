import React from 'react';

function AlertsPanel({ alerts }) {
  return (
    <div className="lg:col-span-4 bg-gray-900/20 backdrop-blur-md border border-gray-800/60 rounded-2xl p-5 shadow-xl font-mono">
      <div className="flex justify-between items-center mb-4 border-b border-gray-800/40 pb-2">
        <h3 className="text-xs font-bold text-rose-400 uppercase tracking-wider">🚨 Live System Warnings</h3>
        <span className="text-[9px] px-2 py-0.5 bg-rose-950/50 border border-rose-900/50 text-rose-400 rounded-md font-bold">ALERTS LAYER</span>
      </div>
      <div className="space-y-3 min-h-[220px]">
        {alerts.length === 0 ? (
          <div className="text-[10px] text-emerald-500/80 font-bold italic pt-24 text-center">✓ SYSTEM RUNNING SMOOTH: NO THREATS FOUND</div>
        ) : (
          alerts.map((alert, index) => (
            <div key={index} className={`p-3 rounded-lg border text-[10px] flex flex-col space-y-1 transition-all duration-300 ${
              alert.type === 'CRITICAL' ? 'bg-rose-950/20 border-rose-900/40 text-rose-300' :
              alert.type === 'WARNING' ? 'bg-amber-950/20 border-amber-900/40 text-amber-300' : 'bg-emerald-950/40 text-emerald-400 border-emerald-800/60 text-emerald-300'
            }`}>
              <div className="flex justify-between font-bold text-[9px] border-b border-white/5 pb-1">
                <span>[{alert.type}]</span>
                <span className="text-gray-500">{alert.time}</span>
              </div>
              <p className="pt-0.5 text-gray-300 tracking-tight">{alert.text}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default AlertsPanel;
const toggleBtn = document.getElementById("modeToggle");
const body = document.body;

if (localStorage.getItem("mode") === "dark") {
  body.classList.add("dark-mode");
}

toggleBtn.addEventListener("click", () => {
  body.classList.toggle("dark-mode");
  const currentMode = body.classList.contains("dark-mode") ? "dark" : "light";
  localStorage.setItem("mode", currentMode);
});

function drawGauge(canvasId, value, maxValue, color) {
  const canvas = document.getElementById(canvasId);
  const ctx = canvas.getContext("2d");
  const radius = canvas.width / 2;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.beginPath();
  ctx.arc(radius, radius, radius - 10, Math.PI, 0);
  ctx.lineWidth = 15;
  ctx.strokeStyle = "#ddd";
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(radius, radius, radius - 10, Math.PI, Math.PI + (value / maxValue) * Math.PI);
  ctx.strokeStyle = color;
  ctx.stroke();
}

const chartCtx = document.getElementById("sensorChart").getContext("2d");

const sensorChart = new Chart(chartCtx, {
  type: "line",
  data: {
    labels: [],
    datasets: [
      { label: "Water Level", borderColor: "#0077ff", data: [], fill: false },
      { label: "Turbidity", borderColor: "#22c55e", data: [], fill: false },
      { label: "pH Level", borderColor: "#ff3b30", data: [], fill: false }
    ]
  },
  options: {
    responsive: true,
    scales: { y: { beginAtZero: true } }
  }
});

async function updateDataFromBackend(){
  try{
    const response=await fetch('/api/live-status');
    const Serverdata= await response.json();

    console.log("Data Received from server:",Serverdata);
    
    const level=Number(Serverdata.waterLevel)|| 0;
    const tds=Number(Serverdata.tds) || 0;
    const floatSwitch=Serverdata.floatSwitch ||"UNKNOWN";


    if(document.getElementById("levelValue")) document.getElementById("levelValue").textContent = `${level}%`;
    if(document.getElementById("turbidityValue")) document.getElementById("turbidityValue").textContent = `${tds} ppm`;
if (document.getElementById("phValue")) {
    document.getElementById("phValue").textContent = "Working on Feature...";
    document.getElementById("phValue").style.fontSize = "14px"; // Font size thoda chota taaki text fit ho jaye
    document.getElementById("phValue").style.color = "#ff3b30";
    document.getElementById("phValue").style.fontSize = "bold"; // Warning/Working red/orange color
}


    //Drawing Dynamic Real-Time Gauges
    drawGauge("levelGauge", level, 100, "#0077ff");
    drawGauge("turbidityGauge", tds, 1000, "#22c55e");
    drawGauge("phGauge", 0, 14, "#ff3b30");

   const now = new Date().toLocaleTimeString();
    sensorChart.data.labels.push(now);
    sensorChart.data.datasets[0].data.push(level); // Chart Index 0: Water Level
    sensorChart.data.datasets[1].data.push(tds);   // Chart Index 1: TDS

    // Maintain 10 records on screen
    if (sensorChart.data.labels.length > 10) {
      sensorChart.data.labels.shift();
      sensorChart.data.datasets.forEach(d => d.data.shift());
    }
    sensorChart.update();

    if(document.getElementById("lastUpdated")) document.getElementById("lastUpdated").textContent = now;

    //  Automation Alerts Management Logic
    const alertsList = document.getElementById("alertsList");
    if(alertsList) {
      alertsList.innerHTML = "";

      if (tds > 600) {
        alertsList.innerHTML += `<li>⚠️ High TDS Detected (Contaminated Water)</li>`;
      }
      if (floatSwitch === "HIGH") {
        alertsList.innerHTML += `<li>⚠️ Critical: Float Switch High Alert</li>`;
      }
      if (alertsList.innerHTML === "") {
        alertsList.innerHTML = `<li>No active alerts</li>`;
      }
    }

  } catch (error) {
    console.error("Backend integration failed bhai:", error);
  }
}

// Interval loop directly hitting the server every 2 seconds
setInterval(updateDataFromBackend, 2000);

// ========================================================
// DASHBOARD TO HARDWARE REVERSE CONTROL TRIGGER (Dosing Pump Button)
// ========================================================
const doseBtn = document.getElementById("toggleDose");
const doseStatus = document.getElementById("doseStatus");
let dosing = false;

doseBtn.addEventListener("click", async () => {
  dosing = !dosing;

  // Toggle visual states
  if (dosing) {
    doseStatus.textContent = "ON";
    doseStatus.classList.remove("off");
    doseStatus.classList.add("on");
  } else {
    doseStatus.textContent = "OFF";
    doseStatus.classList.remove("on");
    doseStatus.classList.add("off");
  }

  // TODO: Aage ke part mein hum yahan POST Request lagayenge jo server 
  // ko batayega ki button daba diya hai aur ESP32 ko notification jaye.
  console.log(`Dosing pump trigger state set to: ${dosing}`);

try {
    const response = await fetch('/api/toggle-dosing', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status: dosing }) // Server expects { status: true/false }
    });
    const result = await response.json();
    console.log("Server Response for Dosing:", result);
  } catch (error) {
    console.error("Failed to send dosing command to server:", error);
  }



});

const drainBtn = document.getElementById("toggleDrain");
const drainStatus = document.getElementById("drainStatus");
let draining = false;

drainBtn.addEventListener("click", async () => {
  draining = !draining;

  // Toggle visual states
  if (draining) {
    drainStatus.textContent = "ON";
    drainStatus.classList.remove("off");
    drainStatus.classList.add("on");
  } else {
    drainStatus.textContent = "OFF";
    drainStatus.classList.remove("on");
    drainStatus.classList.add("off");
  }

  // TODO: Aage ke part mein hum yahan POST Request lagayenge jo server 
  // ko batayega ki button daba diya hai aur ESP32 ko notification jaye.
  console.log(`Draining pump trigger state set to: ${draining}`);
try {
    const response = await fetch('/api/toggle-drain', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status: draining }) // Server expects { status: true/false }
    });
    const result = await response.json();
    console.log("Server Response for Drain:", result);
  } catch (error) {
    console.error("Failed to send drain command to server:", error);
  }




});
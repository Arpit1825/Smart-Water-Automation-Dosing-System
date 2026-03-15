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

const doseBtn = document.getElementById("toggleDose");
const doseStatus = document.getElementById("doseStatus");
let dosing = false;

doseBtn.addEventListener("click", () => {
  dosing = !dosing;

  if (dosing) {
    doseStatus.textContent = "ON";
    doseStatus.classList.remove("off");
    doseStatus.classList.add("on");
  } else {
    doseStatus.textContent = "OFF";
    doseStatus.classList.remove("on");
    doseStatus.classList.add("off");
  }
});

function updateData() {

  const level = Math.floor(Math.random() * 100);
  const turbidity = Number((Math.random() * 5 + 1).toFixed(2));
  const ph = Number((Math.random() * 3 + 6).toFixed(2));

  document.getElementById("levelValue").textContent = `${level}%`;
  document.getElementById("turbidityValue").textContent = `${turbidity} NTU`;
  document.getElementById("phValue").textContent = ph;

  drawGauge("levelGauge", level, 100, "#0077ff");
  drawGauge("turbidityGauge", turbidity, 10, "#22c55e");
  drawGauge("phGauge", ph, 14, "#ff3b30");

  const now = new Date().toLocaleTimeString();

  sensorChart.data.labels.push(now);
  sensorChart.data.datasets[0].data.push(level);
  sensorChart.data.datasets[1].data.push(turbidity);
  sensorChart.data.datasets[2].data.push(ph);

  if (sensorChart.data.labels.length > 10) {
    sensorChart.data.labels.shift();
    sensorChart.data.datasets.forEach(d => d.data.shift());
  }

  sensorChart.update();

  document.getElementById("lastUpdated").textContent = now;

  const alertsList = document.getElementById("alertsList");
  alertsList.innerHTML = "";

  if (ph < 6.5 || ph > 8.5) {
    alertsList.innerHTML += `<li>⚠️ pH out of range</li>`;
  }

  if (turbidity > 4) {
    alertsList.innerHTML += `<li>⚠️ High turbidity detected</li>`;
  }

  if (alertsList.innerHTML === "") {
    alertsList.innerHTML = `<li>No active alerts</li>`;
  }

}

setInterval(updateData, 3000);
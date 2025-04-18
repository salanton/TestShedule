function parseTimeString(timeStr) {
  const [hh = 0, mm = 0] = timeStr.split(":").map(Number);
  return hh * 3600 + mm * 60;
}

function formatTime(date) {
  return date.toTimeString().slice(0, 5);
}

function formatDuration(seconds, detailedFormat) {
  const hh = Math.floor(seconds / 3600);
  const mm = Math.floor((seconds % 3600) / 60);

  if (detailedFormat) {
    return `${hh} час ${mm} мин (${Math.floor(seconds / 60)} мин)`;
  } else {
    return `${hh} мин ${mm} сек (${Math.floor(seconds)} сек)`;
  }
}

let schedule = [];
let waterList = [];

function generateSchedule() {
  const output = document.getElementById("schedule-output");
  const lightTime = document.getElementById("lamp-time").value;
  const mode = document.getElementById("light-mode").value;
  const smart = document.getElementById("smart-watering").checked;
  const ignoreLight = document.getElementById("ignore-lighting").checked;
  const priority = document.getElementById("priority-watering").checked;
  const detailedFormat = document.getElementById("duration-format")?.checked ?? false;

  const wateringCount = parseInt(document.getElementById("watering-count").value);
  const plantCount = parseInt(document.getElementById("plant-count").value);
  const litreTime = parseTimeString(document.getElementById("litre-time").value);
  const volume = parseInt(document.getElementById("water-volume").value);

  if (!wateringCount || !plantCount || !litreTime || !volume) {
    output.innerHTML = "<p style='color:red'>Пожалуйста, заполните все поля.</p>";
    return;
  }

  waterList = [];
  schedule = [];

  const waterPerSecond = 1000 / litreTime;
  const totalWater = volume;
  const perPlant = totalWater / plantCount;

  let lightHours = 24;
  let startTime = new Date();
  if (!ignoreLight) {
    const [h, m] = lightTime.split(":").map(Number);
    startTime.setHours(h, m, 0, 0);
    lightHours = { "12/12": 12, "18/6": 18, "24/0": 24 }[mode];
  } else {
    startTime.setHours(0, 0, 0, 0);
  }

  const shiftStart = smart && !ignoreLight ? 30 : 0;
  const shiftEnd = smart && !ignoreLight ? 60 : 0;
  const lightMinutes = lightHours * 60 - shiftStart - shiftEnd;
  const interval = wateringCount > 1 ? lightMinutes / (wateringCount - 1) : 0;

  if (priority) {
    let firstRatio = 0.5;
    if (wateringCount > 3 && wateringCount <= 6) firstRatio = 1 / 3;
    else if (wateringCount > 6 && wateringCount <= 9) firstRatio = 1 / 5;
    else if (wateringCount >= 10) firstRatio = 1 / 7;
    const firstWater = totalWater * firstRatio;
    const remaining = totalWater - firstWater;
    const others = wateringCount - 1;
    waterList.push(firstWater);
    for (let i = 0; i < others; i++) waterList.push(remaining / others);
  } else {
    for (let i = 0; i < wateringCount; i++) waterList.push(totalWater / wateringCount);
  }

  for (let i = 0; i < wateringCount; i++) {
    const t = new Date(startTime.getTime());
    t.setMinutes(t.getMinutes() + shiftStart + i * interval);
    const durationSeconds = waterList[i] / waterPerSecond;
    schedule.push({
      time: formatTime(t),
      volume: waterList[i].toFixed(0),
      perPlant: (waterList[i] / plantCount).toFixed(0),
      duration: formatDuration(durationSeconds, detailedFormat)
    });
  }

  output.innerHTML = `
    <h3>💧 Всего за день: ${totalWater.toFixed(0)} мл</h3>
    <h4>🌱 Каждое растение получит: ${perPlant.toFixed(0)} мл</h4>
    <ul>
      ${schedule.map(s => `
        <li>
          ${s.time} — ${s.volume} мл 💧 | по ${s.perPlant} мл на растение
          <br><small>⏱ Длительность: ${s.duration}</small>
        </li>
      `).join('')}
    </ul>
  `;
}

function initBindings() {
  const updateSliderDisplay = (sliderId, labelId, suffix = '') => {
    const slider = document.getElementById(sliderId);
    const label = document.getElementById(labelId);
    slider.addEventListener("input", () => {
      label.textContent = slider.value + suffix;
      generateSchedule();
    });
  };

  updateSliderDisplay("watering-count", "poliv-count");
  updateSliderDisplay("plant-count", "plant-count-value");
  updateSliderDisplay("water-volume", "water-volume-display", " мл");

  document.querySelectorAll("input, select").forEach(el => {
    ["input", "change"].forEach(evt => el.addEventListener(evt, generateSchedule));
  });

  // Обновление CSS: выравнивание label + input и запрет переносов
  document.querySelectorAll(".inline label").forEach(label => {
    label.style.whiteSpace = "nowrap";
    label.style.display = "inline-block";
    label.style.flexShrink = "0";
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initBindings();
  generateSchedule();
});

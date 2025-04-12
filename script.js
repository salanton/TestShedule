function parseTimeString(timeStr) {
  const [hh = 0, mm = 0, ss = 0] = timeStr.split(':').map(Number);
  return hh * 3600 + mm * 60 + ss;
}
function formatTime(date) {
  return date.toTimeString().slice(0, 5);
}
document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('watering-form');
  const output = document.getElementById('schedule-output');
  const countDisplay = document.getElementById('poliv-count');
  const plantCountDisplay = document.getElementById('plant-count-value');
  const slider = document.getElementById('watering-count');
  const plantCountInput = document.getElementById('plant-count');
  countDisplay.textContent = slider.value;
  plantCountDisplay.textContent = plantCountInput.value;

  form.querySelectorAll('input, select').forEach(el => {
    el.addEventListener('input', generateSchedule);
    el.addEventListener('change', generateSchedule);
  });
  slider.addEventListener('input', () => {
    countDisplay.textContent = slider.value;
  });
  plantCountInput.addEventListener('input', () => {
    plantCountDisplay.textContent = plantCountInput.value;
  });

  generateSchedule();

  function generateSchedule() {
    try {
      const lampTime = document.getElementById('lamp-time').value;
      const mode = document.getElementById('light-mode').value;
      const smart = document.getElementById('smart-watering').checked;
      const wateringCount = parseInt(slider.value, 10);
      const plantCount = parseInt(plantCountInput.value, 10);
      const litreRaw = document.getElementById('litre-time').value;
      const durationRaw = document.getElementById('watering-duration').value;

      if (!lampTime || !litreRaw || !durationRaw || !wateringCount || !plantCount) {
        output.innerHTML = "<p style='color:red'>Пожалуйста, заполните все поля.</p>";
        return;
      }

      const litreTime = parseTimeString(litreRaw);
      const wateringDuration = parseTimeString(durationRaw);
      const waterPerSecond = 1000 / litreTime;
      const waterPerPoliv = wateringDuration * waterPerSecond;
      const totalWater = waterPerPoliv * wateringCount;
      const waterPerPlant = waterPerPoliv / plantCount;
      const waterPlantTotal = waterPerPlant * wateringCount;

      const lightHours = { '12/12': 12, '18/6': 18, '24/0': 24 }[mode];
      const [h, m] = lampTime.split(':').map(Number);
      const lampStart = new Date();
      lampStart.setHours(h, m, 0, 0);

      const shiftStart = smart ? 30 : 0;
      const shiftEnd = smart ? 60 : 0;
      const lightMinutes = lightHours * 60 - shiftStart - shiftEnd;
      const interval = wateringCount > 1 ? lightMinutes / (wateringCount - 1) : 0;

      const schedule = [];
      for (let i = 0; i < wateringCount; i++) {
        const time = new Date(lampStart.getTime());
        time.setMinutes(time.getMinutes() + shiftStart + i * interval);
        schedule.push({
          time: formatTime(time),
          water: waterPerPoliv.toFixed(0),
          perPlant: waterPerPlant.toFixed(0),
          percent: (100 * waterPerPoliv / totalWater).toFixed(1)
        });
      }

      output.innerHTML = `
        <h3>💧 Всего за день: ${totalWater.toFixed(1)} мл</h3>
        <h4>🌱 Каждое растение получит: ${waterPlantTotal.toFixed(1)} мл</h4>
        <ul>
          ${schedule.map(s => `
            <li>
              ${s.time} — ${s.water} мл 💧 | по ${s.perPlant} мл на растение
              <div class="progress-bar"><div class="fill" style="width:${s.percent}%">${s.water} мл</div></div>
            </li>
          `).join('')}
        </ul>
      `;
    } catch (err) {
      output.innerHTML = "<p style='color:red'>Ошибка расчёта.</p>";
      console.error(err);
    }
  }
});

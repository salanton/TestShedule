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
  const slider = document.getElementById('watering-count');
  countDisplay.textContent = slider.value;

  form.querySelectorAll('input, select').forEach(el => {
    el.addEventListener('input', generateSchedule);
    el.addEventListener('change', generateSchedule);
  });
  slider.addEventListener('input', () => {
    countDisplay.textContent = slider.value;
  });

  generateSchedule(); // авторасчёт при загрузке

  function generateSchedule() {
    try {
      const lampTime = document.getElementById('lamp-time').value;
      const mode = document.getElementById('light-mode').value;
      const smart = document.getElementById('smart-watering').checked;
      const wateringCount = parseInt(slider.value, 10);
      const plantCount = parseInt(document.getElementById('plant-count').value, 10);
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


function initCustomTimepickers() {
  document.querySelectorAll('.timepicker').forEach(tp => {
    ['hh', 'mm', 'ss'].forEach(unit => {
      const select = document.createElement('select');
      select.className = unit;
      const max = unit === 'hh' ? 23 : 59;
      for (let i = 0; i <= max; i++) {
        const opt = document.createElement('option');
        opt.value = opt.textContent = i.toString().padStart(2, '0');
        select.appendChild(opt);
      }
      tp.appendChild(select);
    });
    const bind = tp.dataset.bind;
    const hidden = document.createElement('input');
    hidden.type = 'hidden';
    hidden.id = bind;
    tp.appendChild(hidden);
  });
}

function readCustomTimes() {
  document.querySelectorAll('.timepicker').forEach(tp => {
    const hh = tp.querySelector('.hh').value;
    const mm = tp.querySelector('.mm').value;
    const ss = tp.querySelector('.ss').value;
    const hidden = tp.querySelector('input[type="hidden"]');
    hidden.value = `${hh}:${mm}:${ss}`;
  });
}

// запускаем после загрузки
window.addEventListener('DOMContentLoaded', () => {
  initCustomTimepickers();
  setTimeout(() => {
    document.querySelectorAll('.hh').forEach(el => el.value = '00');
    document.querySelectorAll('.mm').forEach(el => el.value = '01');
    document.querySelectorAll('.ss').forEach(el => el.value = '30');
    readCustomTimes();
    document.querySelector('#watering-form').dispatchEvent(new Event('input'));
  }, 100);
});

// обновляем скрытые поля при любом изменении
document.addEventListener('change', () => {
  readCustomTimes();
});


function buildHhMmSsPickers() {
  document.querySelectorAll('.hhmmss').forEach(div => {
    const bind = div.dataset.bind;
    const hidden = document.createElement('input');
    hidden.type = 'hidden';
    hidden.id = bind;
    div.appendChild(hidden);

    ['hh','mm','ss'].forEach(type => {
      const select = document.createElement('select');
      select.className = type;
      const max = type === 'hh' ? 23 : 59;
      for (let i = 0; i <= max; i++) {
        const opt = document.createElement('option');
        opt.value = opt.textContent = i.toString().padStart(2, '0');
        select.appendChild(opt);
      }
      div.appendChild(select);
    });
  });
}

function updateHhMmSsHidden() {
  document.querySelectorAll('.hhmmss').forEach(div => {
    const h = div.querySelector('.hh').value;
    const m = div.querySelector('.mm').value;
    const s = div.querySelector('.ss').value;
    div.querySelector('input[type="hidden"]').value = `${h}:${m}:${s}`;
  });
}

window.addEventListener('DOMContentLoaded', () => {
  buildHhMmSsPickers();

  // установить дефолтные значения
  document.querySelectorAll('[data-bind="litre-time"] .mm').forEach(s => s.value = '01');
  document.querySelectorAll('[data-bind="litre-time"] .ss').forEach(s => s.value = '30');
  document.querySelectorAll('[data-bind="watering-duration"] .ss').forEach(s => s.value = '30');

  updateHhMmSsHidden();
  document.querySelector('#watering-form').dispatchEvent(new Event('input'));
});
document.addEventListener('input', updateHhMmSsHidden);

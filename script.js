document.addEventListener('DOMContentLoaded', () => {
  const plantRange = document.getElementById('plant-count');
  const plantValue = document.getElementById('plant-count-value');
  const polivRange = document.getElementById('watering-count');
  const polivValue = document.getElementById('poliv-count');
  const volumeRange = document.getElementById('water-volume');
  const volumeDisplay = document.getElementById('water-volume-display');

  plantRange.addEventListener('input', () => {
    plantValue.textContent = plantRange.value;
  });
  polivRange.addEventListener('input', () => {
    polivValue.textContent = polivRange.value;
  });
  volumeRange.addEventListener('input', () => {
    volumeDisplay.textContent = `${volumeRange.value} мл`;
  });

  // TODO: Add full calculation logic here
});

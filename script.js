const $ = (id) => document.getElementById(id);
const intro = $("intro"), formSection = $("formSection"), resultSection = $("resultSection");
let photoUrl = null;
let currentStory = null;

$("startBtn").addEventListener("click", () => { intro.classList.add("hidden"); formSection.classList.remove("hidden"); window.scrollTo({top:0,behavior:"smooth"}); });
$("backBtn").addEventListener("click", () => { formSection.classList.add("hidden"); intro.classList.remove("hidden"); });
$("editBtn").addEventListener("click", () => { resultSection.classList.add("hidden"); formSection.classList.remove("hidden"); window.scrollTo({top:0,behavior:"smooth"}); });
$("newBtn").addEventListener("click", () => { resultSection.classList.add("hidden"); formSection.classList.add("hidden"); intro.classList.remove("hidden"); window.scrollTo({top:0,behavior:"smooth"}); });

document.querySelectorAll('input[name="style"]').forEach(input => {
  input.addEventListener("change", () => {
    document.querySelectorAll(".style-card").forEach(card => card.classList.remove("selected"));
    input.closest(".style-card").classList.add("selected");
  });
});
$("facePhoto").addEventListener("change", (event) => {
  const file = event.target.files && event.target.files[0];
  if (!file) { $("fileHint").textContent = "Если не добавлять — будет сказочный аватар"; return; }
  if (!["image/jpeg","image/png","image/webp"].includes(file.type)) {
    event.target.value = ""; $("fileHint").textContent = "Выбери JPG, PNG или WebP"; return;
  }
  if (file.size > 5 * 1024 * 1024) {
    event.target.value = ""; $("fileHint").textContent = "Файл должен быть меньше 5 МБ"; return;
  }
  if (photoUrl) URL.revokeObjectURL(photoUrl);
  photoUrl = URL.createObjectURL(file);
  $("fileHint").textContent = file.name + " · фото останется на этом устройстве";
});

$("storyForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  currentStory = {
    name: String(data.get("personName") || "").trim(),
    petName: String(data.get("petName") || "").trim(),
    pet: String(data.get("petType") || "🐾"),
    color: String(data.get("hatColor") || "#e85d75"),
    style: String(data.get("style") || "realistic")
  };
  if (!currentStory.name || !currentStory.petName) return;
  renderStory();
  formSection.classList.add("hidden");
  resultSection.classList.remove("hidden");
  window.scrollTo({top:0,behavior:"smooth"});
});

function renderStory() {
  const s = currentStory;
  $("greetingTitle").textContent = `С Новым годом, ${s.name}!`;
  $("greetingText").textContent = `Сегодня твоя собственная зимняя сказка.`;
  $("messageTitle").textContent = `С праздником, ${s.name}!`;
  $("messageBody").textContent = `Пусть 2027 год принесёт тебе много радости, ярких открытий, верных друзей и исполнения желаний. А ${s.petName} пусть найдёт под ёлкой самый вкусный подарок!`;
  $("petEmoji").textContent = s.pet;
  $("petLabel").textContent = s.petName;
  $("hat").style.background = s.color;
  const scene = $("scene");
  scene.classList.remove("st-realistic","st-3d","st-anime","st-clay","st-watercolor");
  scene.classList.add("st-" + s.style);
  const person = $("person");
  person.innerHTML = "";
  if (photoUrl) {
    const img = document.createElement("img");
    img.src = photoUrl; img.alt = "Твоё загруженное фото";
    person.appendChild(img);
  } else {
    const face = document.createElement("span");
    face.className = "face-emoji"; face.textContent = "☺";
    person.appendChild(face);
  }
  // Replay the scene animation without reloading the page.
  scene.animate([{opacity:.55,transform:"scale(.985)"},{opacity:1,transform:"scale(1)"}],{duration:650,easing:"ease-out"});
}
$("replayBtn").addEventListener("click", () => {
  renderStory();
  $("shareNote").textContent = "Твоя сказка начинается снова ✨";
  setTimeout(() => { $("shareNote").textContent = ""; }, 2600);
});
$("shareBtn").addEventListener("click", async () => {
  const s = currentStory;
  const shareData = {title:"Моя новогодняя сказка", text:`Я создал(а) свою новогоднюю сказку! С Новым годом, ${s.name}! ✨`, url:location.href.split("#")[0]};
  try {
    if (navigator.share) await navigator.share(shareData);
    else if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(shareData.url);
      $("shareNote").textContent = "Ссылка на сайт скопирована. Отправь её друзьям!";
    } else {
      $("shareNote").textContent = "Скопируй адрес сайта из адресной строки и отправь друзьям.";
    }
  } catch (err) {
    if (err.name !== "AbortError") $("shareNote").textContent = "Не получилось открыть меню отправки. Скопируй ссылку на сайт вручную.";
  }
});
window.addEventListener("beforeunload", () => { if (photoUrl) URL.revokeObjectURL(photoUrl); });


// Original synthesized winter chime melody. Audio starts only after a tap.
let audioContext = null;
let musicTimer = null;
let musicOn = false;
let noteIndex = 0;
const melody = [659.25, 783.99, 987.77, 783.99, 880.00, 1046.50, 987.77, 783.99,
                659.25, 783.99, 880.00, 783.99, 587.33, 659.25, 783.99, 659.25];
function playBell(frequency, startAt, duration = 0.48, volume = 0.045) {
  if (!audioContext) return;
  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();
  const overtone = audioContext.createOscillator();
  const overtoneGain = audioContext.createGain();
  osc.type = "sine"; osc.frequency.setValueAtTime(frequency, startAt);
  overtone.type = "sine"; overtone.frequency.setValueAtTime(frequency * 2.01, startAt);
  gain.gain.setValueAtTime(0.0001, startAt);
  gain.gain.exponentialRampToValueAtTime(volume, startAt + 0.018);
  gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);
  overtoneGain.gain.setValueAtTime(0.0001, startAt);
  overtoneGain.gain.exponentialRampToValueAtTime(volume * 0.18, startAt + 0.015);
  overtoneGain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration * 0.65);
  osc.connect(gain).connect(audioContext.destination);
  overtone.connect(overtoneGain).connect(audioContext.destination);
  osc.start(startAt); overtone.start(startAt);
  osc.stop(startAt + duration + 0.03); overtone.stop(startAt + duration + 0.03);
}
function playNextNote() {
  if (!musicOn || !audioContext) return;
  const now = audioContext.currentTime;
  const freq = melody[noteIndex % melody.length];
  playBell(freq, now, 0.55, 0.035);
  if (noteIndex % 4 === 0) playBell(freq * 0.5, now + 0.04, 0.8, 0.012);
  noteIndex++;
}
async function toggleMusic() {
  const button = $("musicToggle");
  if (!musicOn) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) {
      button.textContent = "Музыка недоступна";
      return;
    }
    try {
      audioContext = audioContext || new AudioCtx();
      if (audioContext.state === "suspended") await audioContext.resume();
      musicOn = true;
      button.textContent = "♫ Музыка: вкл.";
      button.setAttribute("aria-pressed", "true");
      button.setAttribute("aria-label", "Выключить новогоднюю музыку");
      playNextNote();
      musicTimer = window.setInterval(playNextNote, 520);
    } catch (error) {
      button.textContent = "Не удалось включить";
    }
  } else {
    musicOn = false;
    window.clearInterval(musicTimer);
    musicTimer = null;
    if (audioContext && audioContext.state === "running") await audioContext.suspend();
    button.textContent = "♫ Музыка: выкл.";
    button.setAttribute("aria-pressed", "false");
    button.setAttribute("aria-label", "Включить новогоднюю музыку");
  }
}
$("musicToggle").addEventListener("click", toggleMusic);

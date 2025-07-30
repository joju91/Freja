// Städer
const LOCATIONS = [
  { name: "New York, USA", lat: 40.7128, lon: -74.006 },
  { name: "Paris, Frankrike", lat: 48.8566, lon: 2.3522 },
  { name: "Tokyo, Japan", lat: 35.6762, lon: 139.6503 },
  { name: "Sydney, Australien", lat: -33.8688, lon: 151.2093 },
  { name: "Kairo, Egypten", lat: 30.0444, lon: 31.2357 },
  { name: "Rio de Janeiro, Brasilien", lat: -22.9068, lon: -43.1729 },
  { name: "Moskva, Ryssland", lat: 55.7558, lon: 37.6173 },
  { name: "Kapstaden, Sydafrika", lat: -33.9249, lon: 18.4241 },
  { name: "Delhi, Indien", lat: 28.7041, lon: 77.1025 },
  { name: "Toronto, Kanada", lat: 43.6532, lon: -79.3832 },
  { name: "Stockholm, Sverige", lat: 59.3293, lon: 18.0686 },
  { name: "London, Storbritannien", lat: 51.5074, lon: -0.1278 },
  { name: "Beijing, Kina", lat: 39.9042, lon: 116.4074 },
  { name: "Buenos Aires, Argentina", lat: -34.6037, lon: -58.3816 },
  { name: "Lagos, Nigeria", lat: 6.5244, lon: 3.3792 },
  // Fler städer
  { name: "Mexico City, Mexiko", lat: 19.4326, lon: -99.1332 },
  { name: "Berlin, Tyskland", lat: 52.52, lon: 13.405 },
  { name: "Madrid, Spanien", lat: 40.4168, lon: -3.7038 },
  { name: "Rom, Italien", lat: 41.9028, lon: 12.4964 },
];

// Inställningar
const TOTAL_ROUNDS = 5;

// Tillstånd
let currentRound = 0,
  currentLocation = null,
  score = 0,
  usedLocations = [],
  hasGuessed = false;

// High score
const HIGH_SCORE_KEY = "miniGeoGuessrHighScore";
let highScore = 0;

// Historik
const HISTORY_KEY = "miniGeoGuessrHistory";

// Bästa gissningar
const BEST_GUESSES_KEY = "miniGeoGuessrBestGuesses";

// Kartor
let streetMap, guessMap, guessMarker, actualMarker, connectingLine;

// DOM
const startScreen = document.getElementById("startScreen");
const startButton = document.getElementById("startButton");
const scoreBar = document.getElementById("scoreBar");
const roundInfo = document.getElementById("roundInfo");
const scoreInfo = document.getElementById("scoreInfo");
const highScoreInfo = document.getElementById("highScoreInfo");
const messageBox = document.getElementById("messageBox");
const historyContainer = document.getElementById("historyContainer");
const historyList = document.getElementById("historyList");
const highScoresList = document.getElementById("highScoresList");
const bestGuessesList = document.getElementById("bestGuessesList");

// Utility: Haversine
function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371,
    dLat = ((lat2 - lat1) * Math.PI) / 180,
    dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// LocalStorage-hjälp
function loadHighScore() {
  highScore = parseInt(localStorage.getItem(HIGH_SCORE_KEY)) || 0;
  highScoreInfo.textContent = `Högsta poäng: ${highScore}`;
}
function saveHighScore() {
  if (score > highScore) {
    highScore = score;
    localStorage.setItem(HIGH_SCORE_KEY, highScore);
  }
}
function loadHistory() {
  return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
}
function saveResult(s) {
  const h = loadHistory();
  h.unshift({ date: new Date().toLocaleDateString(), score: s });
  if (h.length > 10) h.pop();
  localStorage.setItem(HISTORY_KEY, JSON.stringify(h));
}
function updateHistoryDisplay() {
  const h = loadHistory();
  historyList.innerHTML = "";
  h.forEach((e) => {
    const li = document.createElement("li");
    li.textContent = `${e.date}: ${e.score} poäng`;
    historyList.appendChild(li);
  });
  historyContainer.style.display = h.length ? "block" : "none";
}
function loadBestGuesses() {
  return JSON.parse(localStorage.getItem(BEST_GUESSES_KEY) || "[]");
}
function saveBestGuess(name, dist) {
  const lst = loadBestGuesses();
  lst.push({ date: new Date().toLocaleDateString(), location: name, distance: dist });
  lst.sort((a, b) => a.distance - b.distance);
  if (lst.length > 10) lst.pop();
  localStorage.setItem(BEST_GUESSES_KEY, JSON.stringify(lst));
}
function updateBestGuessesDisplay() {
  const lst = loadBestGuesses();
  bestGuessesList.innerHTML = "";
  lst.forEach((e) => {
    const li = document.createElement("li");
    li.textContent = `${e.date} – ${e.location}: ${e.distance.toFixed(1)} km`;
    bestGuessesList.appendChild(li);
  });
  document.getElementById("bestGuessesContainer").style.display = lst.length ? "block" : "none";
}
function updateHighScoresTopDisplay() {
  const h = loadHistory().sort((a, b) => b.score - a.score);
  highScoresList.innerHTML = "";
  h.slice(0, 10).forEach((e) => {
    const li = document.createElement("li");
    li.textContent = `${e.date}: ${e.score} poäng`;
    highScoresList.appendChild(li);
  });
  document.getElementById("highScoresContainer").style.display = h.length ? "block" : "none";
}

// Init maps
function initMaps() {
  streetMap = L.map("streetMap", { zoomControl: false }).setView([0, 0], 2);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "© OpenStreetMap contributors",
  }).addTo(streetMap);
  guessMap = L.map("guessMap", { zoomControl: false }).setView([20, 0], 2);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "",
  }).addTo(guessMap);
  guessMap.on("click", onGuess);
}

// Spelets gång
function startGame() {
  // Dölj hero och visa spelyta
  startScreen.style.display = "none";
  scoreBar.style.display = "flex";
  initMaps();
  loadHighScore();
  updateHistoryDisplay();
  updateHighScoresTopDisplay();
  updateBestGuessesDisplay();
  currentRound = 0;
  score = 0;
  usedLocations = [];
  nextRound();
}

function pickRandomLocation() {
  let avail = LOCATIONS.filter((l) => !usedLocations.includes(l));
  if (!avail.length) {
    usedLocations = [];
    avail = LOCATIONS;
  }
  const loc = avail[Math.floor(Math.random() * avail.length)];
  usedLocations.push(loc);
  return loc;
}

function nextRound() {
  if (currentRound >= TOTAL_ROUNDS) {
    return endGame();
  }
  hasGuessed = false;
  currentRound++;
  currentLocation = pickRandomLocation();
  roundInfo.textContent = `Runda: ${currentRound}/${TOTAL_ROUNDS}`;
  scoreInfo.textContent = `Poäng: ${score}`;
  messageBox.innerHTML = `Runda ${currentRound} av ${TOTAL_ROUNDS}:  
 Utforska kartan till vänster och klicka på gissningskartan till höger.`;
  messageBox.style.display = "block";

  if (guessMarker) guessMap.removeLayer(guessMarker);
  if (actualMarker) guessMap.removeLayer(actualMarker);
  if (connectingLine) guessMap.removeLayer(connectingLine);

  streetMap.setView([currentLocation.lat, currentLocation.lon], 14);
}

function onGuess(e) {
  if (hasGuessed) return;
  hasGuessed = true;

  const { lat: glat, lng: glon } = e.latlng;
  const { lat: alat, lon: alon, name } = currentLocation;

  guessMarker = L.marker([glat, glon]).addTo(guessMap);
  actualMarker = L.marker([alat, alon]).addTo(guessMap);
  connectingLine = L.polyline(
    [
      [glat, glon],
      [alat, alon],
    ],
    { color: "#d9534f", weight: 2, dashArray: "4" }
  ).addTo(guessMap);

  const dist = haversineDistance(glat, glon, alat, alon);
  const pts = Math.max(0, Math.round(5000 - dist * 50));
  score += pts;
  scoreInfo.textContent = `Poäng: ${score}`;

  // Spara highscore, historik & bästa gissning
  saveHighScore();
  saveResult(score);
  saveBestGuess(name, dist);

  const d = dist.toFixed(1);
  messageBox.innerHTML = `<strong>${name}</strong><br>Avstånd: ${d} km – du fick ${pts} p.`;
  setTimeout(nextRound, 3000);
}

function endGame() {
  messageBox.innerHTML = `Spelet är slut! Din slutpoäng är ${score} av ${TOTAL_ROUNDS *
    5000}.`;
  saveHighScore();
}

// Startknapp
startButton.addEventListener("click", startGame);

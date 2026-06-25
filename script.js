const input = document.querySelector('#input');
const pokemonSprite = document.querySelector('#img');
const givenInfo = document.querySelector('#textInfo');
const scoreText = document.querySelector('#score');
const solution = document.getElementById('solution');
const minimumInput = document.querySelector('#min');
const maximumInput = document.querySelector('#max');
const restartBtn = document.querySelector('#restart');
const darkModeBtn = document.querySelector('#darkModeButton');
const menuBtn = document.querySelector('.menuIcon');
const menuCloseBtn = document.querySelector('.menuClose');
const dataList = document.getElementById('pokemonNames');
const shinyShakeToggle = document.getElementById('shinyShake');
const caughtShiniesCounter = document.getElementById('caughtShiniesNumber');
const caughtShiniesTextSingular = document.getElementById('caughtShiniesTextSingular');
const caughtShiniesTextPlural = document.getElementById('caughtShiniesTextPlural');
const missedShiniesCounter = document.getElementById('missedShiniesNumber');
const missedShiniesTextSingular = document.getElementById('missedShiniesTextSingular');
const missedShiniesTextPlural = document.getElementById('missedShiniesTextPlural');
const menu = document.querySelector('.menu');
let menuVisible = false;
let pokemonId = 0;
let pokemonName = '';
let answer = '';
let minimumId = localStorage.getItem('minimumId') ?? 1;
let maximumId = localStorage.getItem('maximumId') ?? 1025;
let score = 0;
let guesses = 0;
let darkMode = (localStorage.getItem('darkMode') === 'true');
let language = 'en';
let pokedex = new Map();
let gameMode = localStorage.getItem('gameMode') ?? 'nameToNumber';
let localisation = {};
let buffer = []; //find a better name (or not?)
let bufferSize = 0;
let optionChange = false;
let shinyShakeActive = (localStorage.getItem('shinyShakeActive') !== 'true');
let isShiny = false;
let caughtShinies = 0;
let missedShinies = 0;

start();

async function start() {
    await loadPokedex();
    await loadLocalisation();
    shinyShakeToggle.checked = !shinyShakeActive;
    getBoundaries();
    document.getElementById(gameMode).checked = true;
    setDarkLightMode();
    getLanguage();
    updatePokemonDisplay();
    initializeBuffer(); //anti repetition buffer
    newRound();
    translatePage();
}

function enter() {
    guesses++;
    if (String(input.value).trim().toLowerCase() === String(answer).trim().toLowerCase()) {
        correct();
    } else {
        incorrect();
    }
    scoreText.textContent = `${score}/${guesses}`;
    newRound();
}

function correct() {
    score++;
    animateInputFeedback("hsl(110, 35%, 82%)");
    if (isShiny) updateCaughtShinies();
}

function incorrect() {
    animateInputFeedback("hsl(0, 35%, 82%)");
    showSolution();
    if (isShiny) updateMissedShinies();
}

function updateCaughtShinies() {
    caughtShinies++;
    caughtShiniesCounter.textContent = caughtShinies;
    if (caughtShinies === 1)
        caughtShiniesTextSingular.style.display = 'block';
    if (caughtShinies > 1) {
        caughtShiniesTextSingular.style.display = 'none';
        caughtShiniesTextPlural.style.display = 'block';
    }
}

function updateMissedShinies() {
    missedShinies++;
    missedShiniesCounter.textContent = missedShinies;
    if (missedShinies === 1)
        missedShiniesTextSingular.style.display = 'block';
    if (missedShinies > 1) {
        missedShiniesTextSingular.style.display = 'none';
        missedShiniesTextPlural.style.display = 'block';
    }
}

function animateInputFeedback(color) {
    input.animate(
        {
            backgroundColor: [color],
            offset: 0.2
        },
        {
            duration: 1000,
            iterations: 1,
            easing: "ease-in-out",
        }
    );
}

function showSolution() {
    solution.textContent = answer;
    solution.animate(
        [
            { opacity: "1", offset: 0.05, scale: "1.1" },
            { opacity: "1", offset: 0.6 },
            { opacity: "0" },
        ],
        {
            duration: 1200
        }
    );
}

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getBoundaries() {
    minimumId = Math.max(parseInt(minimumInput.value) || 1, 1);
    maximumId = Math.min(parseInt(maximumInput.value) || 1025, 1025);
    minimumId = minimumId <= maximumId ? minimumId : 1;
    minimumInput.value = minimumId;
    maximumInput.value = maximumId;
    localStorage.setItem('minimumId', minimumId);
    localStorage.setItem('maximumId', maximumId);
}

//sets the buffer size depending on the minimum and maximum values entered
function setBufferSize() {
    const range = maximumId - minimumId;

    if (range < 2)
        bufferSize = 0;
    else if (range === 2 || range === 3)
        bufferSize = 1;
    else if (range === 4 || range === 5)
        bufferSize = 2;
    else {
        bufferSize = clamp(3, Math.floor(range / 10), 20);
    }
}

//clamps a value within a range of values between a defined minimum bound and a maximum bound
function clamp(min, val, max) {
    return Math.min(max, Math.max(val, min));
}

//initializes the buffer by filling it with IDs
function initializeBuffer() {
    setBufferSize();
    buffer = [];
    for (let i = 0; i < bufferSize; i++) {
        buffer.push(randomInt(minimumId, maximumId));
    }
}

//adds the current id to the buffer and removes the oldest one
function updateBuffer() {
    buffer.unshift(pokemonId);
    buffer.pop();
}

//gets a new id, different from the ones in the buffer
function getNewId() {
    while (true) {
        const newId = randomInt(minimumId, maximumId);
        if (!buffer.includes(newId)) {
            return newId;
        }
    }
}

function newRound() {
    input.value = '';

    pokemonId = getNewId();
    const pokemon = pokedex.get(pokemonId);
    pokemonName = pokemon.name[language];
    updateBuffer();

    switch (gameMode) {
        case 'nameToNumber':
            answer = pokemonId;
            givenInfo.textContent = pokemonName;
            input.type = 'number';
            isShiny = Math.random() < 0.02;
            pokemonSprite.onload = () => { if (isShiny && shinyShakeActive) shinyShake() };
            pokemonSprite.src = isShiny ? pokemon.shiny : pokemon.sprite;
            break;

        case 'numberToName':
            answer = pokemonName;
            givenInfo.textContent = pokemonId;
            input.type = 'text';
            break;

        case 'imageToName':
            answer = pokemonName;
            givenInfo.textContent = '';
            input.type = 'text';
            isShiny = Math.random() < 0.02;
            pokemonSprite.onload = () => { if (isShiny && shinyShakeActive) shinyShake() };
            pokemonSprite.src = isShiny ? pokemon.shiny : pokemon.sprite;
            break;

        default:
            givenInfo.textContent = 'Invalid game mode'
            break;
    }
    if (isShiny) console.log('✨');

    input.focus();
}

function shinyShake() {
    pokemonSprite.animate(
        [
            { transform: "translate(0rem, 0rem)", offset: 0.2 },
            { transform: "translate(1rem, 0.5rem)" },
            { transform: "translate(-0.5rem, -1.5rem)" },
            { transform: "translate(0.5rem, 1.2rem)" },
        ],
        {
            duration: 180
        }
    )
}

//loads the pokedex from the local json into a map object
async function loadPokedex() {
    const response = await fetch('./pokedex.json', { cache: "force-cache" });
    const pokemonList = await response.json();
    pokemonList.forEach(poke => pokedex.set(poke.id, poke));
};

//loads all the localized text
async function loadLocalisation() {
    const response = await fetch('./localisation.json');
    localisation = await response.json();
};

//gets the browser preferred language
function getLanguage() {
    const preferredLanguage = localStorage.getItem('language') ?? navigator.language.substring(0,2).toLowerCase();
    const isSupported = ['en', 'fr', 'es', 'it', 'de', 'ja'].includes(preferredLanguage);
    language = isSupported ? preferredLanguage : 'en';
    document.getElementById(language).classList.add('flagFocus');
}

//updates the dropdown list with all localized pokémon names
function updateDataList() {
    dataList.innerHTML = '';
    if (gameMode === 'numberToName' || gameMode === 'imageToName') {
        for (const [, poke] of pokedex) {
            const option = document.createElement('option')
            option.value = poke.name[language];
            dataList.appendChild(option)
        }
    }
}

//updates the main display depending on the current game mode
function updatePokemonDisplay() {
    switch (gameMode) {
        case 'nameToNumber':
            document.getElementsByClassName('poke')[0].classList.remove('noImage');
            break;

        case 'numberToName':
            document.getElementsByClassName('poke')[0].classList.add('noImage');
            break;

        case 'imageToName':
            document.getElementsByClassName('poke')[0].classList.remove('noImage');
            break;

        default:
            break;
    }
}

//translates everything to the selected language
function translatePage() {
    document.querySelectorAll('[data-loc]').forEach(translateElement);
    updateRestartButtonDisplay();

    switch (gameMode) {
        case 'nameToNumber':
            input.setAttribute('placeholder', localisation['inputPlaceholderNumber'][language]);
            break;

        case 'numberToName':
            input.setAttribute('placeholder', localisation['inputPlaceholderName'][language]);
            answer = pokedex.get(pokemonId).name[language];
            break;

        case 'imageToName':
            input.setAttribute('placeholder', localisation['inputPlaceholderName'][language]);
            answer = pokedex.get(pokemonId).name[language];
            break;
    }
}

//translates one element to the selected language
function translateElement(element) {
    const key = element.getAttribute("data-loc");
    element.textContent = localisation[key][language] ?? localisation[key]['en'];
}

//applies the chosen theme
function setDarkLightMode() {
    if (darkMode) {
        darkModeBtn.innerHTML = "☀️";
        document.body.classList.add('darkMode');
    }
    else {
        darkModeBtn.innerHTML = "🌙";
        document.body.classList.remove('darkMode');
    }
    localStorage.setItem('darkMode', darkMode);
}

function resetScore() {
    score = guesses = 0;
    scoreText.textContent = `${score}/${guesses}`;
}

//updates the boundaries, the datalist and the display according to the options
function applyOptionsChanges() {
    getBoundaries();
    updateDataList();
    updatePokemonDisplay();
    optionChange = false;
}

//updates the text of the 'restart' button
function updateRestartButtonDisplay() {
    let key;
    if (optionChange) {
        key = 'applyAndRestart';
    } else {
        key = 'restart';
    }

    restartBtn.innerText = localisation[key][language] ?? localisation[key]['en']
}

//enter
input.addEventListener("keydown", (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        enter();
    }
});

//starts a new game (and applies options changes)
restartBtn.addEventListener("click", () => {
    if (optionChange)
        applyOptionsChanges();
    updateRestartButtonDisplay();
    resetScore();
    initializeBuffer();
    newRound();
});

//darkmode toggle
darkModeBtn.addEventListener("click", () => {
    darkMode = !darkMode;
    setDarkLightMode();
});

//show menu on mobile
menuBtn.addEventListener("click", () => {
    menu.style.right = '0%';
    menuVisible = true;
});

//hide menu on mobile
//by clicking X
menuCloseBtn.addEventListener("click", () => {
    menu.style.right = '-60%';
    menuVisible = false;
});
//by clicking outside
document.addEventListener('click', event => {
    const isClickInside = menu.contains(event.target) || menuBtn.contains(event.target);
    const isMobile = window.matchMedia('(max-width: 800px)').matches;
    if (!isClickInside && isMobile && menuVisible) {
        menu.style.right = '-60%';
    }
});

//change language
document.querySelectorAll(".flag").forEach((flag) => flag.addEventListener("click", () => {
    language = flag.id;
    document.querySelectorAll(".flag").forEach((flag) => flag.classList.remove('flagFocus'));
    flag.classList.add('flagFocus');
    if (gameMode === 'nameToNumber')
        givenInfo.textContent = pokedex.get(pokemonId).name[language];
    else
        updateDataList();
    translatePage();
    localStorage.setItem('language', language);
}));

//gamemode buttons
document.querySelectorAll('input[name=mode]').forEach((btn) => btn.addEventListener("click", () => {
    gameMode = btn.id;
    localStorage.setItem('gameMode', gameMode);
    optionChange = true;
    updateRestartButtonDisplay();
}));

//checks whenever the min/max values change
document.querySelectorAll('.boundaryInput').forEach((element) => element.addEventListener("input", () => {
    optionChange = true;
    updateRestartButtonDisplay();
}));

//toggles the shiny shaking animation
shinyShakeToggle.addEventListener('change', () => {
    shinyShakeActive = !shinyShakeToggle.checked;
    localStorage.setItem('shinyShakeActive', shinyShakeActive);
});
const input = document.querySelector('#input');
const pokemonSprite = document.querySelector('#img');
const givenInfo = document.querySelector('#textInfo');
const scoreText = document.querySelector('#score');
const solution = document.getElementById('solution');
const minimumInput = document.querySelector('#min');
const maximumInput = document.querySelector('#max');
const okBtn = document.querySelector('#ok');
const darkModeBtn = document.querySelector('#darkModeButton');
const menuBtn = document.querySelector('.menuIcon');
const menuCloseBtn = document.querySelector('.menuClose')
const dataList = document.getElementById('pokemonNames')
let pokemonId = 0;
let pokemonName = '';
let answer = '';
let minimumId = localStorage.getItem('miminumId') ?? 1;
let maximumId = localStorage.getItem('maximumId') ?? 1025;
let score = 0;
let guesses = 0;
let darkMode = localStorage.getItem('darkMode') ?? false;
let language = 'en';
let pokedex = new Map();
let gameMode = localStorage.getItem('gameMode') ?? 'nameToNumber';
let localisation = {};


minimumInput.value = minimumId;
maximumInput.value = maximumId;

main();

async function main() {
    await loadPokedex();
    await loadLocalisation();
    setDarkLightMode();
    getBrowserLanguage();
    translate();
    init();
    updatePokemonDisplay();
}

async function enter() {
    guesses++;
    if (String(input.value).trim().toLowerCase() === String(answer).trim().toLowerCase()) {
        correct();
    } else {
        incorrect();
    }
    scoreText.textContent = `${score}/${guesses}`;
    init();
}

function correct() {
    score++;
    animateInputFeedback("hsl(110, 35%, 82%)");
}

function incorrect() {
    animateInputFeedback("hsl(0, 35%, 82%)");
    showSolution();
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
    )
}

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getMinMax() {
    minimumId = Math.max(parseInt(minimumInput.value), 1);
    maximumId = Math.min(parseInt(maximumInput.value), 1025);
    localStorage.setItem('minimumId', minimumId);
    localStorage.setItem('maximumId', maximumId);
}

async function init() {
    input.value = '';

    getMinMax();

    pokemonId = randomInt(minimumId, maximumId);
    const pokemon = pokedex.get(pokemonId);
    pokemonName = pokemon.name[language];

    switch (gameMode) {
        case 'nameToNumber':
            answer = pokemonId;
            givenInfo.textContent = pokemonName;
            input.type = 'number';
            const isShiny = Math.random() < 0.02;
            pokemonSprite.src = isShiny ? pokemon.shiny : pokemon.sprite;
            break;

        case 'numberToName':
            answer = pokemonName;
            givenInfo.textContent = pokemonId;
            input.type = 'text';
            break;

        default:
            givenInfo.textContent = 'Invalid game mode'
            break;
    }

    input.focus();
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

//get the browser preferred language
function getBrowserLanguage() {
    const browserLanguage = navigator.language;
    const isSupported = ['en', 'fr', 'es', 'it', 'de', 'ja'].includes(browserLanguage);
    language = isSupported ? browserLanguage : 'en';
    document.getElementById(language).classList.add('flagFocus');
}

//updtaes the dropdown list with all localized pokémon names
function updateDataList() {
    dataList.innerHTML = '';
    if (gameMode === 'numberToName') {
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

        default:
            break;
    }
}

//translates everything to the selected language
function translate() {
    document.querySelectorAll('[data-loc]').forEach(translateElement);

    switch (gameMode) {
        case 'nameToNumber':
            input.setAttribute('placeholder', localisation['inputPlaceholderNumber'][language])
            break;

        case 'numberToName':
            input.setAttribute('placeholder', localisation['inputPlaceholderName'][language])
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

//enter
input.addEventListener("keydown", (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        enter();
    }
});

//change boundaries
okBtn.addEventListener("click", () => {
    score = guesses = 0;
    scoreText.textContent = `${score}/${guesses}`;
    init();
});

//drakmode toggle
darkModeBtn.addEventListener("click", () => {
    darkMode = !darkMode;
    setDarkLightMode();
});

//show menu on mobile
menuBtn.addEventListener("click", () => {
    document.querySelector('.menu').style.right = '0%';
});

//hide menu on mobile
menuCloseBtn.addEventListener("click", () => {
    document.querySelector('.menu').style.right = '-55%';
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
    translate();
}));

//gamemode buttons
document.querySelectorAll('input[name=mode]').forEach((btn) => btn.addEventListener("click", () => {
    gameMode = btn.id;
    localStorage.setItem('gameMode', gameMode);
    init();
    updateDataList();
    updatePokemonDisplay();
}));

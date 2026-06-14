const input = document.querySelector('#input');
const pokemonSprite = document.querySelector('#img');
const givenInfo = document.querySelector('#name');
const scoreText = document.querySelector('#score');
const solution = document.getElementById('solution');
const minimum = document.querySelector('#min');
const maximum = document.querySelector('#max');
const okBtn = document.querySelector('#ok');
const darkModeBtn = document.querySelector('#darkModeButton');
const menuBtn = document.querySelector('.menuIcon');
const menuCloseBtn = document.querySelector('.menuClose')
const dataList = document.getElementById('pokemonNames')
let pokemonId = 0;
let pokemonName = '';
let answer = '';
let score = 0;
let guesses = 0;
let opacity = 1;
let darkMode = false;
let language = 'fr';
let pokedex = new Map();
let gameMode = 'nameToNumber';


minimum.value = 1;
maximum.value = 1025;

main();

async function main() {
    await loadPokedex();
    init();
}

async function enter() {
    guesses++;
    if (String(input.value).trim().toLowerCase() === String(answer).trim().toLowerCase()) {
        correct();
    } else {
        await incorrect();
    }
    scoreText.textContent = `${score}/${guesses}`;
    init();
}

function correct() {
    score++;
    input.animate(
        {
            backgroundColor: ["rgb(198, 223, 193)"],
            offset: 0.3
        },
        {
            duration: 1000,
            iterations: 1,
            easing: "ease-in-out",
        }
    );
}

async function incorrect() {
    solution.textContent = answer;
    input.animate(
        {
            backgroundColor: ["rgb(223, 195, 195)"],
            offset: 0.3
        },
        {
            duration: 1000,
            iterations: 1,
            easing: "ease-in-out",
        }
    );
    showSolution();
    await new Promise(r => setTimeout(r, 800));
}

async function showSolution() {
    solution.style.opacity = 1;

    await new Promise(r => setTimeout(r, 700));

    opacity = 1;
    fadeOutSolution();
}

function fadeOutSolution() {
    if (opacity > 0) {
        opacity -= .1;
        setTimeout(function () { fadeOutSolution() }, 80);
    }
    solution.style.opacity = opacity;
}

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function init() {
    input.value = '';

    let min = Math.max(parseInt(minimum.value), 1);
    let max = Math.min(parseInt(maximum.value), 1025);

    pokemonId = randomInt(min, max);
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

async function loadPokedex() {
    const response = await fetch('./pokedex.json', { cache: "force-cache" });
    const pokemonList = await response.json();

    pokemonList.forEach(poke => pokedex.set(poke.id, poke));
};

function updateDataList() {
    dataList.innerHTML = '';
    if (gameMode === 'numberToName') {
        for (const [,poke] of pokedex) {
            const option = document.createElement('option')
            option.value = poke.name[language];
            dataList.appendChild(option)
        }
    }
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
    if (darkMode) {
        darkModeBtn.innerHTML = "☀️";
        document.body.classList.add("darkBody");
        document.querySelectorAll(".text").forEach((item) => { item.classList.add("darkText") });
        document.querySelectorAll(".cog").forEach((item) => item.classList.add("darkCog"));
    }
    else {
        darkModeBtn.innerHTML = "🌙";
        document.body.classList.remove("darkBody");
        document.querySelectorAll(".text").forEach((item) => { item.classList.remove("darkText") });
        document.querySelectorAll(".cog").forEach((item) => item.classList.remove("darkCog"));
    }
});

//show menu on mobile
menuBtn.addEventListener("click", () => {
    document.querySelector('.menu').style.right = '0%';
});

//hide menu on mobile
menuCloseBtn.addEventListener("click", () => {
    document.querySelector('.menu').style.right = '-45%';
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
}));

//gamemode buttons
document.querySelectorAll('input[name=mode]').forEach((btn) => btn.addEventListener("click", () => {
    gameMode = btn.id;
    init();
    updateDataList();
}));

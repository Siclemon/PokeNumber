const input = document.querySelector('#input');
const img = document.querySelector('#img');
const scoreText = document.querySelector('#score');
const answer = document.getElementById('answer');
const minimum = document.querySelector('#min');
const maximum = document.querySelector('#max');
const okBtn = document.querySelector('#ok');
const darkModeBtn = document.querySelector('#darkModeButton')
let number;
let score = 0;
let guesses = 0;
var opacity = 1;
let darkMode = false;

minimum.value = 1;
maximum.value = 1025;

init();

async function enter() {
    guesses++;
    if (input.value == number) {
        correct();
    } else {
        await incorrect();
    }
    scoreText.innerHTML = score + '/' + guesses;
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
    answer.textContent = number;
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
    showAnswer();
    await new Promise(r => setTimeout(r, 800));
}

async function showAnswer() {
    answer.style.opacity = 1;

    await new Promise(r => setTimeout(r, 700));

    opacity = 1;
    fadeOutAnswer();
}

function fadeOutAnswer() {
    if (opacity > 0) {
        opacity -= .1;
        setTimeout(function () { fadeOutAnswer() }, 80);
    }
    answer.style.opacity = opacity;
}

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function init() {
    input.value = '';

    let min = parseInt(minimum.value);
    let max = parseInt(maximum.value);

    number = randomInt(min,max);
    input.focus();

    //gets the pokemon sprite
    await fetch(`https://pokeapi.co/api/v2/pokemon/${number}`)
        .then((response) => response.json())
        .then((newPokemon) => {
            img.src = newPokemon.sprites.other['official-artwork'].front_default;
            if (Math.random() - score / 100000 < 0.02) img.src = newPokemon.sprites.other['official-artwork'].front_shiny;
        });

    //gets the pokemon name in french
    await fetch(`https://pokeapi.co/api/v2/pokemon-species/${number}`)
        .then((response) => response.json())
        .then((newPokemon) => {
            document.getElementById("name").innerHTML = newPokemon.names[4].name;
        });
}

function keyPress(e){
    if(e.keyCode === 13){
        e.preventDefault(); 
        enter();
    }
}

okBtn.addEventListener("click", () => {
    init();
})

darkModeBtn.addEventListener("click", () => {
    darkMode = !darkMode;
    if (darkMode) {
        darkModeBtn.innerHTML = "☀️";
        document.body.classList.add("darkBody");
        document.querySelectorAll(".text").forEach((item) => {item.classList.add("darkText")});
    }
    else {
        darkModeBtn.innerHTML = "🌙";
        document.body.classList.remove("darkBody");
        document.querySelectorAll(".text").forEach((item) => {item.classList.remove("darkText")});
    }
})
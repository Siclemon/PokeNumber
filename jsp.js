const dex = ['Bulbizarre', 'Herbizarre', 'Florizarre', 'Salamèche', 'Reptincel', 'Dracaufeu', 'Carapuce', 'Carabaffe', 'Tortank', 'Chenipan', 'Chrysacier', 'Papilusion', 'Aspicot', 'Coconfort', 'Dardargnan'];
const btn = document.getElementById("btn");
const input = document.querySelector('#input');
const img = document.querySelector('#img');
const scoreText = document.querySelector('#score');
let number = gen();
let score = 0;
let guesses = 0;

btn.addEventListener("click", button);

init();

function button() {
    guesses++;
    if (input.value == number) {
        score++;
        document.body.style.animation = "oui 4s linear infinite"
    } else {
        document.body.style.backgroundColor = 'red';
    }
    scoreText.innerHTML = score + '/' + guesses;
    init();
}

function gen() {
    return Math.floor(Math.random() * 301) + 1;
}

function init() {
    input.value = '';
    number = gen();
    //document.getElementById("pipi").innerHTML = dex[number];
    input.focus();
    fetch(`https://pokeapi.co/api/v2/pokemon/${number}`)
        .then((response) => response.json())
        .then((newPokemon) => {
            img.src = newPokemon.sprites.other.home.front_default;
            if (Math.random()<0.1) img.src = newPokemon.sprites.other.home.front_shiny;
        });


    fetch(`https://pokeapi.co/api/v2/pokemon-species/${number}`)
        .then((response) => response.json())
        .then((newPokemon) => {
            document.getElementById("name").innerHTML = newPokemon.names[4].name;
        });
}

document.getElementById("input")
    .addEventListener("keyup", function (event) {
        event.preventDefault();
        if (event.keyCode === 13) {
            document.getElementById("btn").click();
        }
    });

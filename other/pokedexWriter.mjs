import fs from 'fs';

async function main() {

    const liste = [];

    for (let i = 1; i <= 1025; i++) {
        let poke = await betterFetchPoke(i);
        liste.push(poke);
        console.log(`${i}/1025`);
    }

    //console.log(liste);

    let data = JSON.stringify(liste,null,2);
    fs.writeFileSync('pokedex.json', data);

}

async function fetchPoke(index) {
    let poke = {};
    await fetch(`https://pokeapi.co/api/v2/pokemon/${index}`)
        .then((response) => response.json())
        .then((pokemon) => {
            poke = {
                "id": index,
                "name": pokemon.name,
                "sprite": pokemon.sprites.other['official-artwork'].front_default,
                "shiny": pokemon.sprites.other['official-artwork'].front_shiny,
            }
        });
    return poke;
}

async function betterFetchPoke(index) {
    let poke = {};
    await Promise.all([
        fetch(`https://pokeapi.co/api/v2/pokemon/${index}`).then(response => response.json()),
        fetch(`https://pokeapi.co/api/v2/pokemon-species/${index}`).then(response => response.json()),
    ]).then((pokemon) => {
        poke = {
            "id": index,
            "name": {
                "en": rightName(pokemon, 'en'),
                "fr": rightName(pokemon, 'fr'),
                "de": rightName(pokemon, 'de'),
                "es": rightName(pokemon, 'es'),
                "it": rightName(pokemon, 'it'),
                "ja": rightName(pokemon, 'ja'),
            },
            "sprite": pokemon[0].sprites.other['official-artwork'].front_default,
            "shiny": pokemon[0].sprites.other['official-artwork'].front_shiny,
        }
    });
    return poke;
}

function rightName(pokemon, lang) {
    let ret = ';'
    pokemon[1].names.some((x) => {
        if (x.language.name == lang) {
            ret = x.name;
            return true;
        }
    })
    return ret;
}

await main();
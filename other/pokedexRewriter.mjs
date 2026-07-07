import { promises as fs } from 'fs';
import * as fesse from 'fs';

async function main() {
    let newDex;
  try {
    const data = await fs.readFile('../pokedex.json', 'utf8');
    const json = JSON.parse(data)
    
    json.forEach(poke => {
        poke.sprite = 'sprites/default/' + poke.id + '.webp';
        poke.shiny = 'sprites/shiny/' + poke.id + '.webp';
    });

    console.log(json);

    newDex = JSON.stringify(json,null,4);
    fesse.writeFileSync('pokedex2.json', newDex);

  } catch (err) {
    console.error('Error reading file:', err);
  }
}

main();
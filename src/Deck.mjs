import * as fs from 'fs';
import { join } from 'path';

export class Deck {
    headers = {
        separtor: 'tab',
        html: true,
    };

    /**
     * @type {import('fs/promises').FileHandle}
     */
    deck;

    /**
     * @param {string} name
     * @param {AnkiView[]} cards 
     */
    constructor(name, cards) {
        this.name = `${name}.txt`;
        this.cards = cards;
    }

    async saveCards() {
        try {
            await this.openDeck();

            if (await this.isNewDeck()) {
               await this.writeHeaders();
            }

            await this.appendToDeck();
        } catch (e) {
            console.log(e);
        } finally {
            this.deck && this.deck.close();
        }
    }

    async isNewDeck() {
        const line = await this.deck.read();

        return line.bytesRead === 0;
    }

    async writeHeaders() {
        let headers = Object.keys(this.headers).map(k => `#${k}:${this.headers[k]}`).join('\n');

        this.deck.appendFile(headers);
    }

    isDeckExist() {
        return existsSync(this.name);
    }

    async appendToDeck() {
        this.cards.forEach((card) => {
            console.log(`[DECK] save to file ${card.word.word}`);

            this.deck.appendFile(`\n${card.save()}`)
        });
    }

    async openDeck() {
        const fname = join('out', this.name);

        this.deck = await fs.promises.open(fname, 'a+');
    }
}
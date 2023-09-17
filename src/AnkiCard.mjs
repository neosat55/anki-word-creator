import * as fs from 'fs';
import { join } from 'path';

export class AnkiCard {
    /**
     * @type {AnkiCard}
     */
    ankiCard;
    content = {};

    /**
     * @param {Word} word 
     */
    constructor(word) {
        this.word = word;
    }

    buildAnkiCard() {
        this.front();
        this.back();
        this.audio();
        this.examples();
        this.conjugation();
        this.phrases();

        fs.createWriteStream(join('audio', `${this.word.word}.wav`))
            .write(this.word.audioBytes);
    }

    save() {
        let content = `${this.content.front}${this.content.audio}\t${this.content.back}`;

        content += `\t"${this.content.conjugationTable}"`;
        content += `\t"${this.content.exampleTable}"`;
        content += `\t"${this.content.phrasesTable}"`;

        return content;
    }

    front() {
        this.content.front = this.word.word;
    }

    back() {
        this.content.back = this.word.definitions.join(', ');
    }

    audio() {
        this.content.audio = `[sound:${this.word.word}.wav]`;
    }

    examples() {
        const tableData = this.word.examplesArray.slice(0, 10).map(example => `<tr>
                <td>${example.source}</td>
                <td>${example.target}</td>
            </tr>`);

        this.content.exampleTable = `
            <table class='table examples'>
                ${tableData.join('\n')}
            </table>
        `;
    }

    conjugation() {
        if (!this.word.isVerb) {
            this.content.conjugationTable = "";

            return;
        };

        const map = {};

        this.word.conjugations.forEach(conjugation => {
            conjugation.data.forEach(c => {
                if (map[c.pronoun] === undefined) {
                    map[c.pronoun] = [c];
                } else {
                    map[c.pronoun].push(c);
                }
            })
        });

        const conjug = Object.keys(map).map(k => {
            const cc = map[k].map(c => {
                if (c.wordIrregular) {
                    return `<td>${c.wordIrregular}</td>`;
                }

                return `<td>${c.word}</td>`;
            });

            return `<tr>
                <td>${k}</td>
                ${cc.join('\n')}
            </tr>`;
        });

        const heads = this.word.conjugations.map(c => `<th>${c.name}(${c.data[0].translation})</th>`);

        const table = `<table class='table conjugation'>
            <thead>
                <th></th>
                ${heads.join('\n')}
            </thead>
            <tbody>
                ${conjug.join('\n')}
            </tbody>
        </table>`;

        this.content.conjugationTable = table;
    }

    phrases() {
        if (!this.word.havePhrases) {
            this.content.phrasesTable = "";

            return;
        };

        const phrases = this.word.phrasesTable.map(p => `<tr>
            <td>${p.source.replace(/"/g, `'`)}</td>
            <td>${p.quickdef.replace(/"/g, `'`)}</td>
        </tr>`)

        const table = `<table class='table phrases'>
            <tbody>${phrases.join('\n')}</tbody>
        </table>`;

        this.content.phrasesTable = table;
    }
}
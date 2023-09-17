import { Word } from './Word.mjs';
import { AnkiCard } from './AnkiCard.mjs';
import { Deck } from './Deck.mjs';

async function main(word) {
    const wordProcessor = new Word(word);
    const ankiCard = new AnkiCard(wordProcessor);

    await wordProcessor.buildWordView();

    ankiCard.buildAnkiCard();

    const deck = new Deck('test_deck', [ankiCard]);

    await deck.saveCards();
}

// console.log(process.argv.slice(2)[0]);

main(process.argv.slice(2)[0]);


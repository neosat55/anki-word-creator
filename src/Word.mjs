import * as HTMLParser from 'node-html-parser';

export class Word {
    word = '';
    TRANSLATE_SD_COMPONENT_DATA = {};
    CONJUGATION_SD_COMPONENT_DATA = {};
    PHRASES_SD_COMPONENT_DATA = {};
    definitions = [];
    audioBytes;
    examplesArray = [];
    conjugations = [];
    phrasesTable = [];

    constructor(word) {
        this.word = word;
    }

    get isVerb() {
        return this.TRANSLATE_SD_COMPONENT_DATA.navItems.some((item) => item.label === 'Conjugation');
    }

    get havePhrases() {
        // return true;

        return this.TRANSLATE_SD_COMPONENT_DATA.navItems.some((item) => item.label === 'Phrases');
    }

    async buildWordView() {
        await this.translate();

        const promises = [];

        this.defs();

        if (this.isVerb) {
           this.conjugation();
        }

        if (this.havePhrases) {
            this.phrases();
        }

        // await this.examples();

        promises.push(this.audio(), this.examples());

        await Promise.all(promises);
    }

    async translate() {
        console.log('[WORD] get translate');

        const raw = await fetch(`https://www.spanishdict.com/translate/${this.word}`);
        const res = await raw.text();

        // console.log(res);

        // fs.createWriteStream(`${this.word}.html`).write(res);

        // const res = fs.readFileSync('example.html').toString('utf-8');

        const root = HTMLParser.parse(res);
        this.TRANSLATE_SD_COMPONENT_DATA = this._parseSDComponentData(root);
    }

    async examples() {
        console.log('[WORD] get examples');

        const raw = await fetch(`https://examples1.spanishdict.com/explore?lang=es&q=${this.word}&numExplorationSentences=100`, {method: 'GET'});
        const res = await raw.json();

        this.examplesArray = res.data.sentences;

        // this.examplesArray = require('./decir.json').data.sentences;
    }

    async audio() { 
        console.log('[WORD] get audio');

        const props = this.TRANSLATE_SD_COMPONENT_DATA.resultCardHeaderProps.headwordAndQuickdefsProps;
        const res = await fetch(props.headword.audioUrl);
        const b = await res.arrayBuffer();

        this.audioBytes = new Uint8Array(b);
    }

    async phrases() {
        // SD_COMPONENT_DATA.phrases
        // const conjugation = this.TRANSLATE_SD_COMPONENT_DATA.navItems.find((item) => item.label === 'Phrases');
        // const url = `https://www.spanishdict.com/${conjugation.href}`;

        // const raw = await fetch(url);
        // const res = await raw.text();

        // const root = HTMLParser.parse(res);
        // this.PHRASES_SD_COMPONENT_DATA = this._parseSDComponentData(root);

        this.phrasesTable = this.TRANSLATE_SD_COMPONENT_DATA.phrases;
        // source - spain
        // quickdef/quickdefN/ - translates
    }

    async conjugation() {
        const conjugations = this.TRANSLATE_SD_COMPONENT_DATA.verb.paradigms;

        // Для уровня А1 берём пока что эти времена
        // word,pronoun,translation - строим таблицу по этим ключам
        // wordIrregular - если это неправильный глагол
        this.conjugations = [
            {
                name: 'Present',
                data: conjugations.presentIndicative,
            },
            {
                name: 'Preterite',
                data: conjugations.preteritIndicative,
            },
            {
                name: 'Conditional',
                data: conjugations.conditionalIndicative
            }
        ];

        // const conjugation = this.TRANSLATE_SD_COMPONENT_DATA.navItems.find((item) => item.label === 'Conjugation');
        // const url = `https://www.spanishdict.com/${conjugation.href}`;

        // console.log(url);
        // const raw = await fetch(url);
        // const res = await raw.text();

        // fs.createWriteStream(`${this.word}_conjugation.html`).write(res);
        // const root = HTMLParser.parse(res);
        
        // SD_COMPONENT_DATA.verb.paradigms
        // this.CONJUGATION_SD_COMPONENT_DATA = this._parseSDComponentData(root);
    }

    defs() {
        const props = this.TRANSLATE_SD_COMPONENT_DATA.resultCardHeaderProps.headwordAndQuickdefsProps;

        this.definitions = Object.keys(props).filter((key) => {
            if (key.includes('quickdef') && props[key] !== null) {
                return key
            }
        }).map((k) => props[k].displayText);
    }

    /**
     * @private
     * @param {*} root 
     */
    _parseSDComponentData(root) {
        const skipLen = `window.SD_COMPONENT_DATA = `.length;
        const script = root.getElementById('__LOADABLE_REQUIRED_CHUNKS__').previousElementSibling;
        const json = JSON.parse(script.structuredText.slice(skipLen, -1));

        return json;
    }
}
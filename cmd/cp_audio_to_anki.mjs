import { join } from 'path';
import * as fs from 'fs';
import * as os from 'os';

const ANKI_PATH = join(os.homedir(), 'AppData', 'Roaming', 'Anki2', 'User 1', 'collection.media');

const run = async () => {
    const files = await fs.promises.readdir('audio');

    for (const file of files) {
        try {
            await fs.promises.copyFile(join('audio', file), join(ANKI_PATH, file));
            console.log(`[COPY] ${file} success`);
        } catch (e) {
            console.error(`[COPY] ${file} failed; reason: ${e.message}`);
        }
    }
};

run();
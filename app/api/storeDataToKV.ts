const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

// Rest of your code 

const { kv } = require('@vercel/kv');
const { readFile } = require('fs/promises');
const path = require('path');

async function storeDataToKV() {
    try {
        const dataFilePath = path.join(process.cwd(), 'app/api/data', 'profiles.json');
        const jsonData = JSON.parse(await readFile(dataFilePath, 'utf8'));

        for (const profile of jsonData) {
            const id = profile.id;
            const key = `profile_${id}`;

            await kv.set(key, JSON.stringify(profile));
            console.log(`Data for ${id} stored successfully with key ${key}`);

        }
    } catch (error) {
        console.error('Error storing data to KV:', error);
    }
}

storeDataToKV();
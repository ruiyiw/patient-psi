const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

// Rest of your code 

const { kv } = require('@vercel/kv');
const { readFile } = require('fs/promises');
const path = require('path');

async function storeDataToKV() {
    try {
        const dataFilePath = path.join(process.cwd(), 'python/data', 'profiles.json');
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



async function deleteAllProfilesFromKV() {
    try {
        const dataFilePath = path.join(process.cwd(), 'app/api/data', 'profiles_8.json');
        const jsonData = JSON.parse(await readFile(dataFilePath, 'utf8'));

        for (const profile of jsonData) {
            const id = profile.id;
            const key = `profile_${id}`;

            await kv.del(key);
            console.log(`Profile with key ${key} deleted successfully`);
        }

        console.log('All profiles deleted successfully');
    } catch (error) {
        console.error('Error deleting profiles from KV:', error);
    }
}


async function deleteCustomPrefixFromKV(prefix: string) {
    try {
        const keys = await kv.keys(prefix);

        for (const key of keys) {
            await kv.del(key);
            console.log(key, 'deleted successfully');
        }
    } catch (error) {
        console.error('Error retrieving keys:', error);
    }
}


async function assignParticipantSessions(userId: string, sessions: string[]) {
    const key = `assigned:${userId}`;
    const value = {
        'sessions': sessions
    };
    await kv.set(key, JSON.stringify(value));
}


storeDataToKV();


// Collection of kv keys
// profile_*-*
// ccdResult:${userId}:${chatId}
// ccdTruth:${userId}:${chatId}
// chat:${chatId}
// user:${userId}
// user:chat:${userId}


// curr_profile:${userId}
// type:${userId}:${chatId}
// assigned:${userId}
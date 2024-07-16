import { WEBHOOKS_URLS, PINGS } from './config.js';
import assets_ from './collectibles/assets.js';
import categories_ from './collectibles/categories.js';
import profileEffects_ from './collectibles/profile-effects.js';
import sendToWebhook from './utils/sendToWebhook.js';
import save from './utils/saver.js';
import fs from 'fs/promises';
import activities_ from './activities.js';

async function main() {
    /** scrape every data */
    const categories = await categories_.getCollectiblesCategories();
    const oldCategories = JSON.parse(await fs.readFile('./data/collectibles/categories.json', { encoding: 'utf-8' }));
    const oldProfileEffects = JSON.parse(
        await fs.readFile('./data/collectibles/profile-effects.json', { encoding: 'utf-8' }),
    );
    // const oldassets = JSON.parse(await fs.readFile('./data/collectibles/assets.json', { encoding: 'utf-8' }));
    const oldActivities = JSON.parse(await fs.readFile('./data/activities.json', { encoding: 'utf-8' }));

    // break, and notify me that i need update token
    if (categories?.message) {
        const res = await await sendToWebhook(WEBHOOKS_URLS.status.token, {
            content: `${PINGS.status.token} **Your alt token has expired!!!**\n\`\`\`json\n${JSON.stringify(
                categories,
            )}\n\`\`\``,
        });
        return;
    }

    const profileEffects = await profileEffects_.getProfileEffects();
    //const assets = await assets_.getCollectiblesAssets();
    const activities = await activities_.getActivities();

    categories_.diff(oldCategories, categories);
    //assets_.diff(oldassets, assets);
    profileEffects_.diff(oldProfileEffects, profileEffects);
    activities.diff(oldActivities, activities);
    await save('./data/collectibles/categories.json', categories);
    await save('./data/collectibles/profile-effects.json', profileEffects);
    await save('./data/collectibles/assets.json', assets);
    await save('./data/activities.json', activities);
}
main();

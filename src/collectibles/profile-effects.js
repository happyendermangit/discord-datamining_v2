import { WEBHOOKS_URLS, PINGS } from "../config.js";
import sendReq from "../utils/RestApi.js";
import sendToWebhook from "../utils/sendToWebhook.js";

async function getProfileEffects() {
  const profileEffects = await (await sendReq({
    url: "user-profile-effects",
  })).json();

  return profileEffects.profile_effect_configs
}

function getFieldsForProfileEffect(profileEffect) {
  return [
    {
      "name": "Name",
      "value": profileEffect.title,
      "inline": true
    },
    {
      "name": "Description",
      "value": profileEffect.description,
      "inline": true
    },
    {
      "name": "Sku ID",
      "value": profileEffect.sku_id,
      "inline": true
    },
    {
      "name": "Effects Count",
      "value": `${profileEffect.effects.length}`,
      "inline": true
    }
  ]
}


/** differ for our webhook, each module has to have a differ that generates an embed. */
function diff(a, b) {
  const result = [];
  const diff = { removed: [], added: [] };

  /** a is before */
  for (let profileEffect in a) {
    const a_sku_id = a[profileEffect].sku_id
    /** removed type */
    if (!b.find(profile_effect=>profile_effect.sku_id === a_sku_id)) {
      diff.removed.push(a[profileEffect]);
    }
  }

  /** b is after */
  for (let profileEffect in b) {
    const b_sku_id = b[profileEffect].sku_id
    /** added type */
    if (!a.find(profile_effect=>profile_effect.sku_id === b_sku_id)) {
      diff.added.push(b[profileEffect]);
    }
  }

  // generate the embed

  for (let profileEffect of diff.removed) {
    result.push({
      title: "Collectibles — Removed Profile Effect:",
      fields: getFieldsForProfileEffect(profileEffect),
      image: { url:  profileEffect.thumbnailPreviewSrc },
      color: 0xff0000,
    })
  }

  for (let profileEffect of diff.added) {
    result.push({
      title: "Collectibles — Added Profile Effect:",
      fields: getFieldsForProfileEffect(profileEffect),
      image: { url:  profileEffect.thumbnailPreviewSrc },
      color: 0x008000,
    })
  }

  if (result.length) {
    sendToWebhook(WEBHOOKS_URLS.collectibles.profileEffects, {
      content: PINGS.collectibles.profileEffects,
      embeds: result,
    });  
  }
}



export default { getProfileEffects, diff }

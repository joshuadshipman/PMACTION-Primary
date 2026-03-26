import { TwitterApi } from 'twitter-api-v2';

// NOTE: This publisher is designed to be reusable across PMAction and Texas Total Loss (TTL).
// It relies on API keys being set in the environment variables.

/**
 * Publishes a thread or single post to X (Twitter).
 * @param {Array<string>} tweets Array of tweet texts (for threads).
 * @returns {Object} Result of the operation.
 */
export async function publishToX(tweets) {
    if (!process.env.TWITTER_API_KEY || !process.env.TWITTER_ACCESS_TOKEN) {
        console.warn('⚠️ X API keys missing. Skipping automated post.');
        return { success: false, error: 'Missing API Keys' };
    }

    try {
        const client = new TwitterApi({
            appKey: process.env.TWITTER_API_KEY,
            appSecret: process.env.TWITTER_API_SECRET,
            accessToken: process.env.TWITTER_ACCESS_TOKEN,
            accessSecret: process.env.TWITTER_ACCESS_SECRET,
        });

        const rwClient = client.readWrite;

        if (tweets.length === 1) {
            const { data: createdTweet } = await rwClient.v2.tweet(tweets[0]);
            console.log('✅ Posted to X:', createdTweet.id);
            return { success: true, id: createdTweet.id };
        } else {
            // Post a thread
            const { data: createdThread } = await rwClient.v2.tweetThread(tweets);
            console.log('✅ Posted thread to X:', createdThread[0].id);
            return { success: true, id: createdThread[0].id };
        }
    } catch (error) {
        console.error('❌ Failed to publish to X:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Publishes an image or carousel to Instagram via Meta Graph API.
 * @param {Array<string>} imageUrls Public URLs of images.
 * @param {string} caption Caption with hashtags.
 */
export async function publishToInstagram(imageUrls, caption) {
    const igAccountId = process.env.IG_ACCOUNT_ID;
    const accessToken = process.env.META_ACCESS_TOKEN;

    if (!igAccountId || !accessToken) {
        console.warn('⚠️ Instagram API keys missing. Skipping automated post.');
        return { success: false, error: 'Missing API Keys' };
    }

    try {
        // Step 1: Create media item container
        // Note: Graph API requires public URLs for images. 
        // For Carousels, we must create children containers first.
        let isCarousel = imageUrls.length > 1;
        let creationUrl = `https://graph.facebook.com/v19.0/${igAccountId}/media`;
        
        // This is a simplified scaffold. A full carousel implementation requires 
        // posting each image to get a container ID, then assembling them.
        const body = new URLSearchParams({
            image_url: imageUrls[0],
            caption: caption,
            access_token: accessToken
        });

        const containerRes = await fetch(creationUrl, { method: 'POST', body });
        const containerData = await containerRes.json();

        if (containerData.error) throw new Error(containerData.error.message);

        // Step 2: Publish the container
        const publishUrl = `https://graph.facebook.com/v19.0/${igAccountId}/media_publish`;
        const publishBody = new URLSearchParams({
            creation_id: containerData.id,
            access_token: accessToken
        });

        const pubRes = await fetch(publishUrl, { method: 'POST', body: publishBody });
        const pubData = await pubRes.json();

        if (pubData.error) throw new Error(pubData.error.message);

        console.log('✅ Posted to Instagram:', pubData.id);
        return { success: true, id: pubData.id };
    } catch (error) {
        console.error('❌ Failed to publish to Instagram:', error);
        return { success: false, error: error.message };
    }
}

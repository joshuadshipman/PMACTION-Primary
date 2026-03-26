import Stripe from 'stripe';
import { firestoreAdmin } from '../../../lib/firebaseAdmin';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2023-10-16',
});

// Next.js API route config to consume raw body for webhook verification
export const config = {
    api: {
        bodyParser: false,
    },
};

async function buffer(readable) {
    const chunks = [];
    for await (const chunk of readable) {
        chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
    }
    return Buffer.concat(chunks);
}

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return res.status(405).end('Method Not Allowed');
    }

    const buf = await buffer(req);
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
        if (!webhookSecret) {
            throw new Error('STRIPE_WEBHOOK_SECRET is not set');
        }
        event = stripe.webhooks.constructEvent(buf.toString(), sig, webhookSecret);
    } catch (err) {
        console.error(`❌ Webhook Error: ${err.message}`);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Successfully constructed event
    console.log('✅ Success:', event.id);

    // Handle specific event types
    switch (event.type) {
        case 'checkout.session.completed': {
            const session = event.data.object;
            const { userId, personaId } = session.metadata || {};

            if (userId) {
                console.log(`💰 Fulfilling Pro Subscription for user: ${userId}`);
                try {
                    await firestoreAdmin.collection('users').doc(userId).update({
                        isPro: true,
                        subscriptionId: session.subscription || 'founder',
                        proSince: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                    });
                    console.log('✅ User successfully upgraded to Pro');
                } catch (dbError) {
                    console.error('❌ Failed to update user record in Firestore:', dbError);
                }
            } else {
                console.warn('⚠️ Webhook received but no userId found in metadata.');
            }
            break;
        }
        case 'customer.subscription.deleted': {
            const subscription = event.data.object;
            // Lookup user by subscriptionId and downgrade
            try {
                const usersRef = await firestoreAdmin.collection('users').where('subscriptionId', '==', subscription.id).get();
                if (!usersRef.empty) {
                    const userDoc = usersRef.docs[0];
                    await userDoc.ref.update({
                        isPro: false,
                        subscriptionId: null,
                        updatedAt: new Date().toISOString()
                    });
                    console.log(`📉 User downgraded: ${userDoc.id}`);
                }
            } catch (dbError) {
                console.error('❌ Failed to downgrade user in Firestore:', dbError);
            }
            break;
        }
        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
}

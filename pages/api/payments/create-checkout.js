import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2023-10-16', // Ensure matching version or latest
});

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return res.status(405).end('Method Not Allowed');
    }

    try {
        const { priceId, userId, email, personaId, successUrl, cancelUrl } = req.body;

        if (!priceId || !userId) {
            return res.status(400).json({ error: 'Missing required parameters' });
        }

        // Check if priceId indicates a recurring subscription or one-time payment
        // We assume Pro tier is recurring, Founders is one-time. 
        // This can be determined by Stripe pricing models, but we'll set mode by default here.
        // If price config is passed from client, we can determine mode. Assuming 'subscription' for Pro.
        const mode = priceId.includes('recurring') ? 'subscription' : 'payment'; // Fallback logic

        const sessionConfig = {
            payment_method_types: ['card'],
            billing_address_collection: 'auto',
            customer_email: email,
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            mode: 'subscription', // Default to subscription for PMAction Pro
            success_url: successUrl || `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: cancelUrl || `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/pricing`,
            metadata: {
                userId,
                personaId: personaId || 'universal'
            }
        };

        const checkoutSession = await stripe.checkout.sessions.create(sessionConfig);

        return res.status(200).json({ sessionId: checkoutSession.id, url: checkoutSession.url });
    } catch (err) {
        console.error('Error creating Stripe checkout session:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

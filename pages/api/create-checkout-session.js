import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
    apiVersion: '2023-10-16',
});

export default async function handler(req, res) {
    if (req.method === 'POST') {
        try {
            // Note: In production, you would fetch the user's Stripe Customer ID 
            // from Firebase Auth / Firestore to attach the subscription to their account.
            
            const session = await stripe.checkout.sessions.create({
                line_items: [
                    {
                        // Provide the exact Price ID of the product you want to sell from your Stripe Dashboard
                        price: req.body.priceId || 'price_placeholder',
                        quantity: 1,
                    },
                ],
                mode: 'subscription',
                success_url: `${req.headers.origin}/dashboard?session_id={CHECKOUT_SESSION_ID}&success=true`,
                cancel_url: `${req.headers.origin}/pricing?canceled=true`,
            });
            
            res.status(200).json({ url: session.url });
        } catch (err) {
            console.error('Error creating Stripe session:', err);
            res.status(err.statusCode || 500).json(err.message);
        }
    } else {
        res.setHeader('Allow', 'POST');
        res.status(405).end('Method Not Allowed');
    }
}

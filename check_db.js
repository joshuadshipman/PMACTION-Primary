import { firestoreAdmin } from './lib/firebaseAdmin.js';

async function verify() {
    console.log("🔍 Connecting to Firestore (pmactioncontent)...");
    try {
        const usersSnap = await firestoreAdmin.collection('users').count().get();
        const challengesSnap = await firestoreAdmin.collection('challenges').count().get();
        const journalsSnap = await firestoreAdmin.collection('journals').count().get();

        console.log(`✅ Users in Firestore: ${usersSnap.data().count}`);
        console.log(`✅ Challenges in Firestore: ${challengesSnap.data().count}`);
        console.log(`✅ Journals in Firestore: ${journalsSnap.data().count}`);
        
        if (usersSnap.data().count > 0 || challengesSnap.data().count > 0 || journalsSnap.data().count > 0) {
            console.log("Migration Successfully Verified!");
        } else {
            console.log("⚠️ Warning: Collections are empty.");
        }
        process.exit(0);
    } catch (e) {
        console.error("❌ Error connecting to Firestore:", e);
        process.exit(1);
    }
}
verify();

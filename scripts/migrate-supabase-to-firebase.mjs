import { supabaseAdmin } from '../lib/supabaseAdmin.js';
import { firestoreAdmin } from '../lib/firebaseAdmin.js';

/**
 * PMAction Migration Utility: Supabase -> Firebase
 * Migrates core entities while transforming relational data to NoSQL.
 */
async function migrate() {
    console.log("🚀 Starting PMAction Data Migration...");

    try {
        // --- 1. Migrate Profiles -> Users ---
        console.log("👤 Migrating Profiles...");
        const { data: profiles, error: pError } = await supabaseAdmin.from('profiles').select('*');
        if (pError) throw pError;

        for (const profile of profiles) {
            await firestoreAdmin.collection('users').doc(profile.id).set({
                email: profile.email,
                displayName: profile.display_name,
                points: profile.points || 0,
                streak: profile.streak || 0,
                lastLogin: profile.last_login_at,
                createdAt: profile.created_at,
                onboardingCompleted: true, // Assuming from existence in Supabase
                preferences: {
                    theme: 'dark'
                }
            }, { merge: true });
        }
        console.log(`✅ Migrated ${profiles.length} profiles.`);

        // --- 2. Migrate Challenges -> Challenges (Recursive) ---
        console.log("🏆 Migrating Challenges & Tasks...");
        const { data: challenges, error: cError } = await supabaseAdmin.from('challenges').select('*');
        if (cError) throw cError;

        for (const challenge of challenges) {
            // Create Challenge Doc
            const challengeRef = firestoreAdmin.collection('challenges').doc(challenge.slug);
            await challengeRef.set({
                title: challenge.title,
                description: challenge.description,
                duration: challenge.duration,
                category: challenge.category,
                tags: challenge.tags || [],
                updatedAt: new Date().toISOString()
            });

            // Fetch Tasks
            const { data: tasks, error: tError } = await supabaseAdmin
                .from('challenge_tasks')
                .select('*')
                .eq('challenge_id', challenge.id);
            if (tError) console.error(`Error fetching tasks for ${challenge.slug}:`, tError);

            if (tasks) {
                const batch = firestoreAdmin.batch();
                tasks.forEach(task => {
                    const taskRef = challengeRef.collection('tasks').doc(`day-${task.day_number}`);
                    batch.set(taskRef, {
                        day: task.day_number,
                        title: task.title,
                        instructions: task.instructions,
                        points: task.points,
                        contentData: task.content_data
                    });
                });
                await batch.commit();
            }
        }
        console.log(`✅ Migrated ${challenges.length} challenges and their tasks.`);

        // --- 3. Migrate Journal Entries -> Journals ---
        console.log("📓 Migrating Journal Entries...");
        const { data: journals, error: jError } = await supabaseAdmin.from('journal_entries').select('*');
        if (jError) throw jError;

        for (const entry of journals) {
            await firestoreAdmin.collection('journals').add({
                userId: entry.user_id,
                content: entry.content,
                mood: entry.mood,
                tags: entry.tags || [],
                timestamp: entry.created_at,
                isPrivate: true,
                embedding: entry.embedding // pgvector data (will need index in Firestore)
            });
        }
        console.log(`✅ Migrated ${journals.length} journal entries.`);

        console.log("\n🏁 Migration Complete! Verify data in your Firebase Console.");

    } catch (error) {
        console.error("❌ Migration Failed:", error);
    }
}

// Run the migration
if (import.meta.url === `file://${process.argv[1].replace(/\\/g, '/')}`) {
    migrate();
}

export { migrate };

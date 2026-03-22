require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function verifyAndCount() {
    const email = `test.persistence.${Date.now()}@example.com`;
    const password = 'Password123!';
    console.log('🔐 Signing up fresh test user:', email);

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({ email, password });
    if (signUpError) {
        console.error('❌ Sign‑up failed:', signUpError.message);
        return;
    }
    console.log('✅ Signed up user ID:', signUpData.user.id);

    // Query counts
    const tables = ['users', 'blog_posts', 'challenges'];
    for (const tbl of tables) {
        const { count, error } = await supabase
            .from(tbl)
            .select('*', { count: 'exact', head: true });
        if (error) {
            console.error(`❌ Error counting ${tbl}:`, error.message);
        } else {
            console.log(`📊 ${tbl} count:`, count);
        }
    }
}

verifyAndCount();

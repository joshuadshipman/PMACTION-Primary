require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function verifyCounts() {
    const tables = ['users', 'blog_posts', 'challenges'];
    for (const tbl of tables) {
        const { count, error } = await supabase.from(tbl).select('*', { count: 'exact', head: true });
        if (error) {
            console.error(`❌ Error counting ${tbl}:`, error.message);
        } else {
            console.log(`📊 ${tbl} count:`, count);
        }
    }
}

verifyCounts();

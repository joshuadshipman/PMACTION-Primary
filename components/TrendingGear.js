import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export default function TrendingGear() {
    const [links, setLinks] = useState([]);

    useEffect(() => {
        supabase
            .from('affiliate_links')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(5)
            .then(({ data, error }) => {
                if (error) console.error('Error loading affiliate links', error);
                else setLinks(data);
            });
    }, []);

    if (!links.length) return null;

    return (
        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
            <h3 className="text-lg font-semibold mb-2">Trending Gear</h3>
            <ul className="space-y-2">
                {links.map(l => (
                    <li key={l.id} className="flex items-center">
                        <a href={l.affiliate_url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
                            {l.keyword}
                        </a>
                    </li>
                ))}
            </ul>
        </div>
    );
}

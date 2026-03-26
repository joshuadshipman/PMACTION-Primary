import { useEffect, useState } from 'react';
import { auth } from '../lib/firebaseClient';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from 'next/router';

export default function MagicLogin() {
    const [status, setStatus] = useState('Idle');
    const router = useRouter();

    useEffect(() => {
        const login = async () => {
            setStatus('Attempting login for testuser@example.com...');
            try {
                await signInWithEmailAndPassword(auth, 'testuser@example.com', 'password123');
                setStatus('Success! Redirecting...');
                setTimeout(() => router.push('/dashboard'), 2000);
            } catch (error) {
                setStatus('Error: ' + error.message);
            }
        };

        login();
    }, []);

    return (
        <div className="p-10">
            <h1 className="text-2xl font-bold">Magic Login Test</h1>
            <pre className="mt-4 p-4 bg-gray-100 rounded border">{status}</pre>
        </div>
    );
}

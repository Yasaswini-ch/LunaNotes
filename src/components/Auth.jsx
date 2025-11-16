import { useEffect, useState } from 'react';
import { auth, firebaseReady } from '../firebase';
import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { LogIn, LogOut } from 'lucide-react';

const Auth = () => {
    const [user, setUser] = useState(null);
    const firebaseAvailable = firebaseReady && !!auth;

    useEffect(() => {
        if (!firebaseAvailable) {
            return () => {};
        }
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });
        return () => unsubscribe();
    }, [firebaseAvailable]);

    const handleSignIn = async () => {
        if (!firebaseAvailable) return;

        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(auth, provider);
        } catch (error) {
            console.error("Error signing in with Google", error);
        }
    };

    const handleSignOut = async () => {
        if (!firebaseAvailable) return;

        try {
            await signOut(auth);
        } catch (error) {
            console.error("Error signing out", error);
        }
    };

    return (
        <div>
            {!firebaseAvailable ? null : user ? (
                <button onClick={handleSignOut} className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-colors text-sm">
                    <LogOut size={16} />
                    <span>Sign Out</span>
                </button>
            ) : (
                <button onClick={handleSignIn} className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-colors text-sm">
                    <LogIn size={16} />
                    <span>Sign In</span>
                </button>
            )}
        </div>
    );
};

export default Auth;

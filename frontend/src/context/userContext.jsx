import React, { createContext, useContext, useEffect, useState } from 'react';
import { getUserSession, logoutUser, supabase } from '../api';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(undefined); 
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSession = async () => {
            setLoading(true);
            try {
                const sessionUser = await getUserSession();
                if (sessionUser) {
                    // Fetch user role from 'students' table
                    const { data, error } = await supabase
                        .from('students')
                        .select('id, is_admin')
                        .eq('id', sessionUser.id)
                        .single();

                    if (error) {
                        console.error("Error fetching user details:", error.message);
                    } else {
                        setUser({ ...sessionUser, isAdmin: data?.is_admin || false });
                    }
                } else {
                    setUser(null);
                }
            } catch (err) {
                console.error("Unexpected error in userContext:", err);
            }
            setLoading(false);
        };

        fetchSession();

        //Auth State Listener
        const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session?.user) {
                setUser(session.user);
            } else {
                setUser(null);
            }
        });

        return () => {
            authListener?.subscription?.unsubscribe();
        };
    }, []);

    return (
        <UserContext.Provider value={{ user, logoutUser, loading }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => useContext(UserContext);

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../supabaseClient'; // Make sure the correct path is used

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Fetch current session on initial load
    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession(); // Use getSession instead of session
      setUser(session ? session.user : null);  // Set the user based on session
    };

    fetchSession();

    // Subscribe to session changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session ? session.user : null); // Update user state on auth state change
    });

    return () => subscription.unsubscribe();  // Clean up the subscription
  }, []);

  return (
    <UserContext.Provider value={{ user }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  return useContext(UserContext);
};

import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    // Persist the admin key in sessionStorage so a page refresh doesn't log you out mid-session
    const [adminKey, setAdminKey] = useState(() => sessionStorage.getItem('cs_admin_key') || '');

    const login = (key) => {
        setAdminKey(key);
        sessionStorage.setItem('cs_admin_key', key);
    };

    const logout = () => {
        setAdminKey('');
        sessionStorage.removeItem('cs_admin_key');
    };

    return (
        <AuthContext.Provider value={{ adminKey, login, logout, isAuthed: !!adminKey }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}

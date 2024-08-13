import React, { createContext, useState, useEffect } from 'react';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [username, setUsername] = useState(() => {
        // Retrieve the username from local storage, or set to an empty string if not found
        return localStorage.getItem('username') || '';
    });

    useEffect(() => {
        // Update local storage whenever the username changes
        localStorage.setItem('username', username);
    }, [username]);

    return (
        <UserContext.Provider value={{ username, setUsername }}>
            {children}
        </UserContext.Provider>
    );
};

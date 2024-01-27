import  { createContext, useEffect, useState } from "react";
import PropTypes from "prop-types"; // Import PropTypes
import axios from "axios";

export const UserContext = createContext({});

export function UserContextProvider({ children }) {
    const [username, setUsername] = useState(null)
    const [id, setId] = useState(null)

    useEffect(() => {
        axios.get('/profile').then(response => {
            setId(response.data.userId);
            setUsername(response.data.username);
            
        });
    }, []);
    return (
        <UserContext.Provider value={{ username, setUsername, id, setId }}>
            {children}
        </UserContext.Provider>
    );
}

// Add prop types validation
UserContextProvider.propTypes = {
    children: PropTypes.node.isRequired, // Ensure children is a React node
};

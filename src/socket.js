import { io } from 'socket.io-client';

let socket; // Declare the socket variable

export const initSocket = async () => {
    const options = {
        'force new connection': true,
        reconnectionAttempts: Infinity, // Corrected spelling
        timeout: 10000,
        transports: ['websocket'],
    };

    socket = io(process.env.REACT_APP_BACKEND_URL, options); // Save the socket instance

    return socket; // Return the socket instance for further use
};

// Export the socket instance for use in other parts of your application
export const getSocket = () => socket; // Export the getSocket function

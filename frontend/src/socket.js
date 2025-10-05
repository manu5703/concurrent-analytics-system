import { io } from "socket.io-client";

// Flask server runs on port 5000
const SOCKET_URL = "http://localhost:5000";

// Export the socket instance for use in React components
export const socket = io(SOCKET_URL, {
    // Optional: Auto-connect upon initialization
    autoConnect: true, 
});
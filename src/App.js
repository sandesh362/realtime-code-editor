import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Home from './pages/Home';
import EditorPage from './pages/EditorPage';
import Login from './pages/login'; // Import the Login page
import Signup from './pages/signup'; // Import the Signup page
import { useEffect, useState } from 'react';
import { getSocket } from './socket'; // Adjust import based on your socket file
import ACTIONS from './Actions'; // Import actions

function App() {
    const [files, setFiles] = useState({}); // Initialize state for files

    useEffect(() => {
        const socket = getSocket(); // Get the socket instance
        if (socket) {
            socket.on(ACTIONS.CODE_CHANGE, ({ files }) => {
                setFiles(files); // Update the state with new file contents
                // Optionally, update the editor view here if needed
            });
        }

        return () => {
            if (socket) {
                socket.off(ACTIONS.CODE_CHANGE); // Clean up listener on unmount
            }
        };
    }, []); // Empty dependency array to run once when component mounts

    return (
        <>
            <div>
                <Toaster
                    position="top-right"
                    toastOptions={{
                        success: {
                            theme: {
                                primary: '#4aed88',
                            },
                        },
                    }}
                />
            </div>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Login />}></Route>  {/* Login page */}
                    <Route path="/signup" element={<Signup />}></Route> {/* Signup page */}
                    <Route path="/home" element={<Home />}></Route>
                    <Route path="/editor/:roomId" element={<EditorPage files={files} />}></Route> {/* Pass files to EditorPage */}
                </Routes>
            </BrowserRouter>
        </>
    );
}

export default App;

import React, { useState } from 'react';
import { v4 as uuidV4 } from 'uuid';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const Home = () => {
    const navigate = useNavigate();

    const [roomId, setRoomId] = useState('');
    const [username, setUsername] = useState('');

    const createNewRoom = (e) => {
        e.preventDefault();
        const id = uuidV4();
        setRoomId(id);
        toast.success('Created a new room');
    };

    const joinRoom = () => {
        if (!roomId || !username) {
            toast.error('ROOM ID & username is required');
            return;
        }

        // Redirect
        navigate(`/editor/${roomId}`, {
            state: {
                username,
            },
        });
    };

    const handleInputEnter = (e) => {
        if (e.code === 'Enter') {
            joinRoom();
        }
    };

    return (
        <div style={styles.homePageWrapper}>
            {/* Creative Title for Code Glimpse */}
            <h1 style={styles.editorTitle}>Code Glimpse</h1>
            <div style={styles.formWrapper}>
                <h4 style={styles.mainLabel}>Paste invitation ROOM ID</h4>
                <div style={styles.inputGroup}>
                    <input
                        type="text"
                        style={styles.inputBox}
                        placeholder="ROOM ID"
                        onChange={(e) => setRoomId(e.target.value)}
                        value={roomId}
                        onKeyUp={handleInputEnter}
                    />
                    <input
                        type="text"
                        style={styles.inputBox}
                        placeholder="USERNAME"
                        onChange={(e) => setUsername(e.target.value)}
                        value={username}
                        onKeyUp={handleInputEnter}
                    />
                    <button style={styles.joinBtn} onClick={joinRoom}>
                        Join
                    </button>
                    <span style={styles.createInfo}>
                        If you don't have an invite then create &nbsp;
                        <a
                            onClick={createNewRoom}
                            href="#"
                            style={styles.createNewBtn}
                        >
                            new room
                        </a>
                    </span>
                </div>
            </div>
        </div>
    );
};

// Inline CSS styles
const styles = {
    homePageWrapper: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: '#2c3e50', // Dark background color similar to login page
        color: 'white', // White text for better contrast
    },
    editorTitle: {
        fontSize: '2.5rem',
        color: '#4aed88',
        textAlign: 'center',
        marginBottom: '20px',
        textShadow: '2px 2px 5px rgba(0, 0, 0, 0.2)',
        fontFamily: 'Arial, sans-serif',
    },
    formWrapper: {
        backgroundColor: '#34495e', // Lighter shade for the form wrapper
        padding: '20px',
        borderRadius: '10px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
    },
    mainLabel: {
        marginBottom: '10px',
        fontSize: '1.2rem',
    },
    inputGroup: {
        display: 'flex',
        flexDirection: 'column',
    },
    inputBox: {
        padding: '10px',
        margin: '5px 0',
        borderRadius: '5px',
        border: '1px solid #ccc',
    },
    joinBtn: {
        padding: '10px',
        margin: '5px 0',
        backgroundColor: '#4aed88',
        border: 'none',
        borderRadius: '5px',
        color: 'white',
        cursor: 'pointer',
    },
    createInfo: {
        marginTop: '10px',
    },
    createNewBtn: {
        color: '#4aed88',
        cursor: 'pointer',
    },
};

export default Home;

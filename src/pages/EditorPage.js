import React, { useState, useRef, useEffect } from 'react';
import "../App.css";
import toast from 'react-hot-toast';
import ACTIONS from '../Actions';
import Client from '../components/Client';
import Editor from '../components/Editor';
import { initSocket } from '../socket';
import {
    useLocation,
    useNavigate,
    Navigate,
    useParams,
} from 'react-router-dom';

const EditorPage = () => {
    const socketRef = useRef(null);
    const codeRef = useRef(null);
    const location = useLocation();
    const { roomId } = useParams();
    const reactNavigator = useNavigate();
    const [clients, setClients] = useState([]);
    const [code, setCode] = useState('');
    const [messages, setMessages] = useState([]); // For chat messages
    const [newMessage, setNewMessage] = useState(''); // For the chat input
    const [elehide, seteleHide] = useState(true); // Set chat hidden initially

    useEffect(() => {
        const init = async () => {
            socketRef.current = await initSocket();
            socketRef.current.on('connect_error', (err) => handleErrors(err));
            socketRef.current.on('connect_failed', (err) => handleErrors(err));

            function handleErrors(e) {
                console.log('socket error', e);
                toast.error('Socket connection failed, try again later.');
                reactNavigator('/');
            }

            socketRef.current.emit(ACTIONS.JOIN, {
                roomId,
                username: location.state?.username,
            });

            // Listening for joined event
            socketRef.current.on(ACTIONS.JOINED, ({ clients, username, socketId }) => {
                if (username !== location.state?.username) {
                    toast.success(`${username} joined the room.`);
                }
                setClients(clients);
                socketRef.current.emit(ACTIONS.SYNC_CODE, {
                    code: codeRef.current,
                    socketId,
                });
            });

            // Listening for disconnected
            socketRef.current.on(ACTIONS.DISCONNECTED, ({ socketId, username }) => {
                toast.success(`${username} left the room.`);
                setClients((prev) => prev.filter((client) => client.socketId !== socketId));
            });

            // Listening for chat messages
            socketRef.current.on(ACTIONS.RECEIVE_MESSAGE, ({ username, message }) => {
                setMessages((prevMessages) => [...prevMessages, { username, message }]);
            });
        };

        init();

        return () => {
            socketRef.current.disconnect();
            socketRef.current.off(ACTIONS.JOINED);
            socketRef.current.off(ACTIONS.DISCONNECTED);
            socketRef.current.off(ACTIONS.RECEIVE_MESSAGE); // Clean up chat listener
        };
    }, [reactNavigator, roomId, location.state?.username]);

    async function copyRoomId() {
        try {
            await navigator.clipboard.writeText(roomId);
            toast.success('Room ID has been copied to your clipboard');
        } catch (err) {
            toast.error('Could not copy the Room ID');
        }
    }

    async function downloadFile() {
        const blob = new Blob([code], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `code-${roomId}.js`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }

    function leaveRoom() {
        reactNavigator('/');
    }

    function handleSendMessage() {
        if (newMessage.trim() !== '') {
            socketRef.current.emit(ACTIONS.SEND_MESSAGE, {
                roomId,
                message: newMessage,
                username: location.state?.username,
            });
            setNewMessage(''); // Clear the input
        }
    }

    function hide() {
        seteleHide(!elehide); // Toggle chat visibility
    }

    if (!location.state) {
        return <Navigate to="/" />;
    }

    return (
        <div className="mainWrap">
            <div className="aside">
                <div className="asideInner">
                    <div className="logo"></div>
                    <h3>Connected</h3>
                    <div className="clientsList">
                        {clients.map((client) => (
                            <Client key={client.socketId} username={client.username} />
                        ))}
                    </div>
                </div>
                <button className="btn copyBtn" onClick={copyRoomId}>
                    Copy ROOM ID
                </button>
                <button className="btn downloadBtn" onClick={downloadFile}>
                    Download Code
                </button>
                <button className="btn leaveBtn" onClick={leaveRoom}>
                    Leave
                </button>
            </div>

            <div className="editorWrap">
                <Editor
                    socketRef={socketRef}
                    roomId={roomId}
                    onCodeChange={(code) => {
                        codeRef.current = code;
                        setCode(code);
                    }}
                />
            </div>

            {/* Chat Section */}
            {elehide ? null : (
                <div className="chatWrap" id='hidesection'>
                    <div className="chatMessages">
                        {messages.map((msg, index) => (
                            <div key={index} className="message">
                                <strong>{msg.username}: </strong>{msg.message}
                            </div>
                        ))}
                    </div>
                    <div className="chatInputWrap">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type a message..."
                        />
                        <button onClick={handleSendMessage}>Send</button>
                    </div>
                </div>
            )}

            <button className="hideBtn" id='hidebtn' onClick={hide}>
                {elehide ? "Show Chat" : "Hide Chat"}
            </button>
        </div>
    );
};

export default EditorPage;

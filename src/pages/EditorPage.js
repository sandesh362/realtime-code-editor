import React, { useState, useRef, useEffect } from 'react';
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
            socketRef.current.on(
                ACTIONS.JOINED,
                ({ clients, username, socketId }) => {
                    if (username !== location.state?.username) {
                        toast.success(`${username} joined the room.`);
                        console.log(`${username} joined`);
                    }
                    setClients(clients);
                    socketRef.current.emit(ACTIONS.SYNC_CODE, {
                        code: codeRef.current,
                        socketId,
                    });
                }
            );

            // Listening for disconnected
            socketRef.current.on(
                ACTIONS.DISCONNECTED,
                ({ socketId, username }) => {
                    toast.success(`${username} left the room.`);
                    setClients((prev) => {
                        return prev.filter(
                            (client) => client.socketId !== socketId
                        );
                    });
                }
            );

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
    }, []);

    async function copyRoomId() {
        try {
            await navigator.clipboard.writeText(roomId);
            toast.success('Room ID has been copied to your clipboard');
        } catch (err) {
            toast.error('Could not copy the Room ID');
            console.error(err);
        }
    }

    async function downloadFile () {
        const blob = new Blob([code], { type: 'text/plain' }); // Create a Blob from the code
        const url = URL.createObjectURL(blob); // Create a URL for the Blob
        const a = document.createElement('a'); // Create an anchor element
        a.href = url; // Set the href to the Blob URL
        a.download = `code-${roomId}.js`; // Set the default file name
        document.body.appendChild(a); // Append it to the body
        a.click(); // Programmatically click the link to trigger the download
        document.body.removeChild(a); // Clean up and remove the link
    };

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
            setMessages((prevMessages) => [
                ...prevMessages,
                { username: location.state?.username, message: newMessage },
            ]);
            setNewMessage(''); // Clear the input
        }
    }

    if (!location.state) {
        return <Navigate to="/" />;
    }

    return (
        <div className="mainWrap">
            <div className="aside">
                <div className="asideInner">
                    <div className="logo">
                    </div>
                    <h3>Connected</h3>
                    <div className="clientsList">
                        {clients.map((client) => (
                            <Client
                                key={client.socketId}
                                username={client.username}
                            />
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
                        setCode(code); // Update the state with the current code
                    }}
                />
            </div>

            {/* Chat Section */}
            <div className="chatWrap">
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
        </div>
    );
};

export default EditorPage;

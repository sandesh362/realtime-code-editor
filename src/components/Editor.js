import React, { useEffect, useRef, useState } from 'react';
import Codemirror from 'codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/dracula.css';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/mode/xml/xml'; // For HTML
import 'codemirror/mode/css/css'; // For CSS
import 'codemirror/addon/edit/closetag';
import 'codemirror/addon/edit/closebrackets';
import ACTIONS from '../Actions';

const Editor = ({ socketRef, roomId, onCodeChange }) => {
    const editorRef = useRef(null);
    const [files, setFiles] = useState({
        'index.html': '',
        'styles.css': '',
        'script.js': ''
    });
    const [activeFile, setActiveFile] = useState('index.html');

    useEffect(() => {
        async function init() {
            editorRef.current = Codemirror.fromTextArea(
                document.getElementById('realtimeEditor'),
                {
                    mode: 'htmlmixed', // Default mode can be HTML mixed
                    theme: 'dracula',
                    autoCloseTags: true,
                    autoCloseBrackets: true,
                    lineNumbers: true,
                }
            );

            editorRef.current.on('change', (instance, changes) => {
                const { origin } = changes;
                const code = instance.getValue();
                onCodeChange(code);

                if (origin !== 'setValue') {
                    const updatedFiles = {
                        ...files,
                        [activeFile]: code
                    };
                    setFiles(updatedFiles);
                    socketRef.current.emit(ACTIONS.CODE_CHANGE, {
                        roomId,
                        files: updatedFiles,
                    });
                }
            });
        }
        init();
    }, [activeFile, files]);

    useEffect(() => {
        if (socketRef.current) {
            socketRef.current.on(ACTIONS.CODE_CHANGE, ({ files }) => {
                if (files) {
                    setFiles(files);
                    editorRef.current.setValue(files[activeFile] || '');
                }
            });
        }

        return () => {
            socketRef.current.off(ACTIONS.CODE_CHANGE);
        };
    }, [socketRef.current, activeFile]);

    const createNewFile = (fileName) => {
        setFiles((prevFiles) => ({
            ...prevFiles,
            [fileName]: '',
        }));
        setActiveFile(fileName);
        editorRef.current.setValue('');
    };

    const handleFileChange = (file) => {
        setActiveFile(file);
        editorRef.current.setValue(files[file] || '');
    };

    const deleteFile = (file) => {
        const updatedFiles = { ...files };
        delete updatedFiles[file]; // Remove the selected file
        setFiles(updatedFiles);
        
        // Switch active file to another available file
        const remainingFiles = Object.keys(updatedFiles);
        if (remainingFiles.length > 0) {
            setActiveFile(remainingFiles[0]);
            editorRef.current.setValue(updatedFiles[remainingFiles[0]] || '');
        } else {
            setActiveFile(''); // Clear active file if none remain
            editorRef.current.setValue('');
        }
    };

    return (
        <div className="editor-container">
            <div className="file-tabs">
                {Object.keys(files).map((file) => (
                    <div key={file} className="file-tab-container">
                        <button 
                            className={`file-tab ${activeFile === file ? 'active' : ''}`} 
                            onClick={() => handleFileChange(file)}
                        >
                            {file}
                        </button>
                        <button 
                            className="delete-file" 
                            onClick={() => deleteFile(file)}
                        >
                            🗑️
                        </button>
                    </div>
                ))}
                <button 
                    className="new-file" 
                    onClick={() => createNewFile(`newFile${Object.keys(files).length + 1}.html`)}
                >
                    New File
                </button>
            </div>
            <textarea id="realtimeEditor"></textarea>
            <style jsx>{`
                .editor-container {
                    display: flex;
                    flex-direction: column;
                }

                .file-tabs {
                    display: flex;
                    justify-content: flex-start;
                    margin-bottom: 10px;
                }

                .file-tab-container {
                    display: flex;
                    align-items: center;
                }

                .file-tab {
                    padding: 10px;
                    cursor: pointer;
                    background: #555; /* Background color */
                    color: white; /* Text color */
                    border: none;
                    margin-right: 5px;
                    transition: background 0.3s;
                    border-radius: 4px; /* Rounded corners */
                }

                .file-tab.active {
                    background: #007bff; /* Active tab color */
                }

                .file-tab:hover {
                    background: #777; /* Hover effect */
                }

                .delete-file {
                    background: transparent; /* Transparent background */
                    color: red; /* Delete icon color */
                    border: none; /* No border */
                    cursor: pointer; /* Pointer cursor */
                    font-size: 16px; /* Icon size */
                    margin-left: 5px; /* Space between file tab and delete icon */
                }

                .new-file {
                    padding: 10px;
                    background: #28a745; /* New file button color */
                    color: white; /* Button text color */
                    border: none;
                    border-radius: 4px; /* Rounded corners */
                    cursor: pointer;
                    margin-left: 5px; /* Space from the last tab */
                    transition: background 0.3s;
                }

                .new-file:hover {
                    background: #218838; /* Darker green on hover */
                }

                textarea {
                    height: 500px; /* Set a height for the editor */
                    width: 100%; /* Make the editor full width */
                    border: 1px solid #ccc; /* Border for textarea */
                }
            `}</style>
        </div>
    );
};

export default Editor;

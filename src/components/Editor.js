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
import { AiFillFileAdd } from "react-icons/ai";

const Editor = ({ socketRef, roomId, onCodeChange }) => {
    const editorRef = useRef(null);
    const [files, setFiles] = useState({
        'index.html': '',
        'styles.css': '',
        'script.js': ''
    });
    const [activeFile, setActiveFile] = useState('index.html');

    const getModeForFile = (fileName) => {
        if (fileName.endsWith('.html')) return 'xml'; // Correct mode for HTML
        if (fileName.endsWith('.css')) return 'css';
        if (fileName.endsWith('.js')) return 'javascript';
        return 'xml'; // Default to XML mode
    };

    useEffect(() => {
        // Initialize CodeMirror editor
        editorRef.current = Codemirror.fromTextArea(
            document.getElementById('realtimeEditor'),
            {
                mode: getModeForFile(activeFile),
                theme: 'dracula',
                autoCloseTags: true,
                autoCloseBrackets: true,
                lineNumbers: true,
                direction: 'ltr',
            }
        );

        // Add 'change' listener
        editorRef.current.on('change', (instance, changes) => {
            const { origin } = changes;
            const code = instance.getValue();
            onCodeChange(code);

            if (origin !== 'setValue') {
                const updatedFiles = { ...files, [activeFile]: code };
                setFiles(updatedFiles);

                // Emit code change event
                socketRef.current.emit(ACTIONS.CODE_CHANGE, {
                    roomId,
                    files: updatedFiles,
                });
            }
        });

        return () => {
            if (editorRef.current) {
                editorRef.current.toTextArea(); // Cleanup
            }
        };
    }, []); // Empty dependency array ensures the editor is only initialized once

    // Update editor mode when active file changes
    useEffect(() => {
        if (editorRef.current) {
            // Update the mode, but do not reset the value
            editorRef.current.setOption('mode', getModeForFile(activeFile));
            editorRef.current.setValue(files[activeFile] || '');
        }
    }, [activeFile]); // Only re-run when active file changes

    // Socket listener for code changes
    useEffect(() => {
        if (socketRef.current) {
            const handleCodeChange = ({ files: newFiles }) => {
                if (newFiles) {
                    setFiles(newFiles);
                    if (editorRef.current) {
                        // Update the editor only if the content is different
                        if (editorRef.current.getValue() !== newFiles[activeFile]) {
                            editorRef.current.setValue(newFiles[activeFile] || '');
                        }
                    }
                }
            };

            socketRef.current.on(ACTIONS.CODE_CHANGE, handleCodeChange);
            return () => {
                socketRef.current.off(ACTIONS.CODE_CHANGE, handleCodeChange);
            };
        }
    }, [socketRef, activeFile]);

    // Create a new file with validation
    const createNewFile = () => {
        const fileName = prompt("Enter new file name (e.g., newFile.js):");
        if (fileName && !files[fileName]) {
            setFiles(prevFiles => ({ ...prevFiles, [fileName]: '' }));
            setActiveFile(fileName);
        } else if (files[fileName]) {
            alert('File already exists!');
        }
    };

    // Delete file and handle empty state
    const deleteFile = (file) => {
        setFiles(prevFiles => {
            const updatedFiles = { ...prevFiles };
            delete updatedFiles[file];
            const remainingFiles = Object.keys(updatedFiles);
            setActiveFile(remainingFiles.length ? remainingFiles[0] : null);
            return updatedFiles;
        });
    };

    // Download the current files as a JSON
    const downloadCode = () => {
        const zipContent = Object.keys(files).map(fileName => ({
            name: fileName,
            content: files[fileName]
        }));
        const blob = new Blob([JSON.stringify(zipContent, null, 2)], { type: 'text/plain' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'code_files.json';
        link.click();
    };

    return (
        <div className="editor-container">
            <div className="flex">
                {Object.keys(files).map(file => (
                    <div key={file} className="file-tab-container">
                        <button 
                            className={`file-tab ${activeFile === file ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-300'} hover:bg-blue-600 focus:outline-none transition-colors px-4 py-2 rounded`}
                            onClick={() => setActiveFile(file)}
                        >
                            {file}
                        </button>
                        <button 
                            className="delete-file text-red-500 hover:text-red-700 transition-colors focus:outline-none ml-2"
                            onClick={() => deleteFile(file)}
                        >
                            🗑️
                        </button>
                    </div>
                ))}
                <button onClick={createNewFile}>
                    <AiFillFileAdd size={28} color="blue" />
                </button>
            </div>
            <textarea id="realtimeEditor" className="w-full h-96 border-gray-300 border rounded mt-4"></textarea>
        </div>
    );
};

export default Editor;

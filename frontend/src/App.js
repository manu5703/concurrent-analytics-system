import React, { useState, useEffect } from 'react';
import FileUploader from './components/FileUploader';
import JobList from './components/JobList';
import { socket } from './socket';

// Mock user identification for this demonstration
const MOCK_USER_ID = "Analyst_001";

const App = () => {
    const [jobs, setJobs] = useState([]);
    const [socketId, setSocketId] = useState(null);

    useEffect(() => {
        // --- 1. Handle Socket Connection and Session Join ---
        const onConnect = () => {
            const currentSid = socket.id;
            setSocketId(currentSid);
            console.log('Connected to server with SID:', currentSid);
            // Tell the server which room (the client's SID) to send targeted updates to
            socket.emit('join_session', { userId: MOCK_USER_ID });
        };

        // --- 2. Handle Real-time Job Updates ---
        const onJobUpdate = (data) => {
            console.log('Received real-time job update:', data);
            
            setJobs(prevJobs => {
                const existingJobIndex = prevJobs.findIndex(job => job.job_id === data.job_id);
                
                if (existingJobIndex !== -1) {
                    // Update existing job's status and results
                    const newJobs = [...prevJobs];
                    newJobs[existingJobIndex] = { ...newJobs[existingJobIndex], ...data };
                    return newJobs;
                } else if (data.status) {
                    // Add new job (for robustness, in case it wasn't added immediately after API call)
                    return [data, ...prevJobs]; 
                }
                return prevJobs;
            });
        };

        const onDisconnect = () => {
            setSocketId(null);
            console.log('Disconnected from server.');
        };

        // Set up listeners
        socket.on('connect', onConnect);
        socket.on('job_update', onJobUpdate);
        socket.on('disconnect', onDisconnect);

        // Cleanup: remove listeners when the component unmounts
        return () => {
            socket.off('connect', onConnect);
            socket.off('job_update', onJobUpdate);
            socket.off('disconnect', onDisconnect);
        };
    }, []);

    const handleJobSubmission = (initialJob) => {
        // Add the job to the list immediately after the API returns the initial QUEUED status
        setJobs(prevJobs => [initialJob, ...prevJobs]);
    };

    return (
        <div id="root">
            <h1>Multi-User Concurrent Processing Dashboard 📈</h1>
            <p style={{ color: '#555' }}>
                **User:** **{MOCK_USER_ID}** | **Session Status:** {socketId ? '🟢 Connected' : '🔴 Disconnected'}
            </p>
            <p style={{ fontSize: '12px', color: '#777' }}>
                Your unique session ID (**SID**) is: *{socketId || 'Connecting...'}*. This ID is used by the server to push **targeted real-time updates** only to your browser.
            </p>
            <hr />
            
            <h2>1. Submit File for Concurrent Analysis</h2>
            <FileUploader 
                userId={MOCK_USER_ID} 
                userSid={socketId} 
                onJobSubmitted={handleJobSubmission} 
            />
            
            <hr />
            
            <h2>2. Processing Queue and Results</h2>
            <JobList jobs={jobs} />
        </div>
    );
};

export default App;
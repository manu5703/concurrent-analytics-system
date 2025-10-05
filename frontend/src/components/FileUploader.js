import React, { useState } from 'react';
import axios from 'axios';

const FileUploader = ({ userId, userSid, onJobSubmitted }) => {
    // State now holds a FileList object (or null)
    const [files, setFiles] = useState(null); 
    const [message, setMessage] = useState('');
    const [isUploading, setIsUploading] = useState(false);

    const handleFileChange = (e) => {
        // e.target.files is a FileList object
        setFiles(e.target.files); 
        setMessage('');
    };

    const resetFileInput = () => {
        setFiles(null); 
        // Reset the file input field visually
        document.getElementById('file-input').value = null; 
    };

    // --- 1. ASYNCHRONOUS Upload (Concurrent System) ---
    const handleAsyncUpload = async () => {
        if (!files || files.length === 0 || !userSid) {
            setMessage('Error: Please select one or more files and ensure the system is connected.');
            return;
        }

        setIsUploading(true);
        setMessage(`Submitting ${files.length} jobs for ASYNC processing...`);

        const totalFiles = files.length;
        let successfulSubmissions = 0;
        
        // Loop through each selected file and send a separate request for each
        for (let i = 0; i < totalFiles; i++) {
            const file = files[i];
            const formData = new FormData();
            formData.append('file', file);
            formData.append('userId', userId);
            formData.append('userSid', userSid); 
            
            try {
                // Send job request (Producer action)
                const response = await axios.post('http://localhost:5000/api/upload', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                
                // Add the job to the list immediately
                onJobSubmitted(response.data.initial_status);
                successfulSubmissions++;
                
            } catch (error) {
                console.error(`ASYNC Upload Error for ${file.name}:`, error);
                // Log failure, but continue with the next file
            }
        }
        
        // Final message after all files have been submitted
        setMessage(`✅ All ${totalFiles} file(s) submitted! (${successfulSubmissions} successfully queued). Check table for real-time status.`);
        
        resetFileInput();
        setIsUploading(false);
    };

    // --- 2. SYNCHRONOUS Upload (Blocking System) ---
    // This function now loops through all selected files, blocking the browser for ~3s per file.
    const handleSyncUpload = async () => {
        // Allow multiple files
        if (!files || files.length === 0) {
             setMessage('Error: Please select one or more files to demonstrate sequential blocking.');
             return;
        }
        
        const totalFiles = files.length;
        // Calculate expected blocking time: 3 seconds per file.
        const expectedTime = (totalFiles * 3).toFixed(0); 
        
        setIsUploading(true);
        setMessage(`Submitting ${totalFiles} jobs for SYNC processing... The browser will now block for approximately ${expectedTime} seconds...`);

        let successfulSubmissions = 0;
        
        // Loop through each selected file and send a separate, SEQUENTIAL, blocking request
        for (let i = 0; i < totalFiles; i++) {
            const file = files[i];
            const formData = new FormData();
            formData.append('file', file); 

            try {
                // NOTE: The main thread is BLOCKED by the server for ~3 seconds for *each* iteration.
                const response = await axios.post('http://localhost:5000/api/sync-upload', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                
                const results = response.data.results;
                
                // Manually create a COMPLETED entry to display for the sync job.
                const syncJobResult = {
                    job_id: `SYNC-${Date.now()}-${i}`, // Unique ID for each file in the batch
                    file_name: response.data.filename,
                    status: 'COMPLETED',
                    submitted_at: Date.now() / 1000,
                    report: results.report, 
                    line_count: results.line_count 
                };

                onJobSubmitted(syncJobResult);
                successfulSubmissions++;

            } catch (error) {
                console.error(`SYNC Upload Error for ${file.name}:`, error);
                setMessage(`❌ SYNC Upload failed during file ${i + 1}/${totalFiles}: ${error.response?.data?.error || 'Server error'}`);
                // Break the loop if one file fails during synchronous processing
                break; 
            }
        }
        
        // Final message
        if (successfulSubmissions === totalFiles) {
            setMessage(`✅ All ${totalFiles} SYNC jobs finished! Total estimated blocking time: ${expectedTime}s. (See table below)`);
        }
        
        resetFileInput();
        setIsUploading(false);
    };


    return (
        <div style={{ padding: '15px', border: '1px dashed #007bff', borderRadius: '5px' }}>
            <input 
                type="file" 
                id="file-input"
                onChange={handleFileChange} 
                disabled={isUploading} 
                multiple // <--- Allows multiple selection for both tests
                style={{ marginBottom: '15px' }}
            />
            
            <p style={{ fontWeight: 'bold' }}>
                {files ? `File(s) Selected: ${files.length}` : 'Select file(s) to begin comparison.'}
            </p>

            <div style={{ display: 'flex', gap: '10px' }}>
                
                <button 
                    onClick={handleAsyncUpload} 
                    disabled={!files || isUploading}
                    style={{ backgroundColor: '#28a745', flexGrow: 1 }}
                >
                    1. ASYNC (Concurrent) Test ({files ? files.length : 0} Jobs)
                </button>

            </div>
            
            <p style={{ marginTop: '10px', fontSize: '14px', color: message.includes('failed') ? 'red' : '#333' }}>
                {message || 'Ready to test the difference in performance.'}
            </p>
        </div>
    );
};

export default FileUploader;

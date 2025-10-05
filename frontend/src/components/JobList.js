

import React from 'react';

// Utility function to apply color based on job status
const getStatusStyle = (status) => {
    const baseStyle = { padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold' };
    switch (status) {
        case 'COMPLETED': return { ...baseStyle, color: 'white', backgroundColor: '#28a745' }; // Green
        case 'PROCESSING': return { ...baseStyle, color: 'white', backgroundColor: '#ffc107' }; // Yellow/Orange
        case 'QUEUED': return { ...baseStyle, color: 'white', backgroundColor: '#007bff' }; // Blue
        case 'FAILED': return { ...baseStyle, color: 'white', backgroundColor: '#dc3545' }; // Red
        default: return { ...baseStyle, color: '#6c757d', backgroundColor: '#f8f9fa' };
    }
};

const JobList = ({ jobs }) => {
    // Ensure the most recent jobs appear at the top
    const sortedJobs = [...jobs].sort((a, b) => b.submitted_at - a.submitted_at);

    return (
        <div style={{ marginTop: '20px' }}>
            {sortedJobs.length === 0 ? (
                <p style={{ fontStyle: 'italic', color: '#6c757d' }}>No jobs submitted yet. Upload a file to begin concurrent processing.</p>
            ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ borderBottom: '2px solid #333' }}>
                            <th style={{ padding: '10px' }}>File Name</th>
                            <th style={{ padding: '10px' }}>Status</th>
                            <th style={{ padding: '10px' }}>Analytics Result</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedJobs.map((job) => (
                            <tr key={job.job_id} style={{ borderBottom: '1px solid #eee' }}>
                                <td style={{ padding: '10px', wordBreak: 'break-all' }}>{job.file_name}</td>
                                <td style={{ padding: '10px' }}>
                                    <span style={getStatusStyle(job.status)}>
                                        {job.status}
                                    </span>
                                </td>
                                <td style={{ padding: '10px', fontSize: '13px', color: '#555' }}>
                                    {job.report || job.error || 'Awaiting worker assignment...'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default JobList;
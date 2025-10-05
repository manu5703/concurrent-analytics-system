# Multi-User Concurrent File Processing and Analytics System

This project demonstrates a **concurrent file processing and analytics system** using Flask, SocketIO, and a worker queue. The app allows multiple users to upload files, which are processed in the background without blocking the server, providing a fast and responsive experience.

---

## Features

- **File Upload:** Users can upload CSV or text files through a web interface.  
- **Concurrent Processing:** Uploaded files are queued and processed independently by worker threads.  
- **Real-Time Updates:** The frontend receives live updates on job progress via WebSockets.  
- **Fast Response:** Users get an immediate response after submitting a file, even if processing takes several seconds.  

---
<img width="843" height="800" alt="Screenshot 2025-10-05 130236" src="https://github.com/user-attachments/assets/17af549e-324e-430c-a505-591155adc6e9" />

<img width="811" height="825" alt="Screenshot 2025-10-05 130302" src="https://github.com/user-attachments/assets/b26266dc-9f3c-403d-9c4b-216c22c4b257" />

<img width="546" height="557" alt="Screenshot 2025-10-05 130310" src="https://github.com/user-attachments/assets/13a2fa12-d128-44d2-aa11-003c50ec2614" />

## Technologies Used

- **Backend:** Flask, Flask-SocketIO  
- **Frontend:** React (optional, can serve static HTML)  
- **Concurrency:** Python `threading`, `queue.Queue`  
- **File Handling:** Uploaded files are stored temporarily and removed after processing  

---

## How It Works

1. The user uploads a file through the frontend.  
2. Flask receives the file and saves it locally.  
3. The job is added to a queue, and a unique job ID is generated.  
4. Worker threads pick up jobs from the queue and process them independently.  
5. Results are stored in a shared dictionary, and updates are sent to the frontend in real-time via SocketIO.  

---

## Running the App

1. **Clone the repository:**

```bash
git clone https://github.com/your-username/concurrent-file-processing.git
cd concurrent-file-processing
```

## Synchronous vs Concurrent Processing

| Feature                 | Concurrent Processing                        | Synchronous Processing                     |
| ----------------------- | -------------------------------------------- | ------------------------------------------ |
| **Execution**           | Jobs run in parallel, main server is free    | Jobs run one at a time, server waits       |
| **Response Time**       | Immediate response after job submission      | Response only after job completes          |
| **User Experience**     | Smooth, multiple users/files handled at once | Slow, UI waits for each job to finish      |
| **Example in this App** | Worker threads handle queued jobs            | Traditional blocking processing (not used) |


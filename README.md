# Multi-User Concurrent File Processing and Analytics System

This project demonstrates a **concurrent file processing and analytics system** using Flask, SocketIO, and a worker queue. The app allows multiple users to upload files, which are processed in the background without blocking the server, providing a fast and responsive experience.

---

## Features

- **File Upload:** Users can upload CSV or text files through a web interface.  
- **Concurrent Processing:** Uploaded files are queued and processed independently by worker threads.  
- **Real-Time Updates:** The frontend receives live updates on job progress via WebSockets.  
- **Fast Response:** Users get an immediate response after submitting a file, even if processing takes several seconds.  

---

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

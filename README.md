# 🧩 Multi-User Concurrent File Processing and Analytics System

A **full-stack, scalable system** designed to handle **concurrent file processing and analytics** without blocking the user interface.  
This project demonstrates an efficient solution for environments where **multiple users** upload files for **background analysis** — such as log parsing, data aggregation, or report generation.

---

## 🚀 Overview

The system uses a combination of the **Producer-Consumer Pattern** and **WebSockets** to achieve:
- **High concurrency**
- **Asynchronous task processing**
- **Real-time feedback**

Users can upload files and continue interacting with the app while analytics run in the background.  
Live updates on job status are pushed instantly via **Flask-SocketIO**, creating a seamless, responsive experience.

---

## ⚙️ Key Concepts & Features

### 🔁 Asynchronous Processing  
Uploads are handled instantly. Users don’t wait for long-running analytics — the backend queues the job for background processing.

### ⚡ Concurrency  
A **Worker Pool** (Python threads) enables multiple files from different users to be processed **simultaneously**, reducing overall latency.

### 🧮 Producer-Consumer Pattern  
- **Producer:** Flask API — receives files and places them into a **thread-safe queue**.  
- **Consumer:** Worker threads — pick jobs from the queue and execute analytics.

### 📡 Real-Time Status Updates  
Each job’s progress (`QUEUED → PROCESSING → COMPLETED`) is **pushed live** to the user’s browser via **WebSocket events**, with no manual page refresh required.

### 📊 Structured Analytics  
Workers perform simple but extensible analysis on uploaded CSV/TXT files, such as:
- Line count
- Unique user ID activity breakdown
- Summary metrics per file

---

## 🧱 Technology Stack

| Component | Technology | Role |
|------------|-------------|------|
| **Backend / API** | Flask (Python) | Handles routing, file uploads, and acts as the producer. |
| **Concurrency Layer** | Python `threading`, `queue` | Implements worker pool and job queue for background processing. |
| **Real-Time Push** | Flask-SocketIO | Establishes WebSocket connections for live status updates. |
| **Frontend** | React, Axios, Socket.io-client | Provides upload UI and live job tracking dashboard. |

---

## 🧩 System Architecture


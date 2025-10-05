Multi-User Concurrent File Processing and Analytics System
Overview
This project implements a full-stack, scalable system designed to handle heavy, time-consuming file processing tasks concurrently without blocking the web application's user interface. It demonstrates a robust solution for environments where multiple users submit data for background analysis (e.g., log processing, financial data aggregation).

The core strength of the system is its use of the Producer-Consumer Pattern combined with WebSockets to deliver a responsive, real-time user experience.

Key Concepts and Features
Asynchronous Processing: File uploads are immediately accepted, allowing the user to continue interacting with the application while the heavy analytics run in the background.

Concurrency: A dedicated Worker Pool (using Python threads) processes multiple user files simultaneously, drastically reducing wait times.

Producer-Consumer Pattern: The Flask API acts as the Producer, quickly placing jobs into a thread-safe Queue, which is consumed by the slower Worker Threads.

Real-Time Status: Job status updates (QUEUED, PROCESSING, COMPLETED) are pushed directly to the specific user's browser via Flask-SocketIO, eliminating the need for manual polling or page refreshes.

Structured Analytics: Workers perform basic file analysis (e.g., line counting, UserID activity breakdown) on CSV/TXT files.

Technology Stack
Component

Technology

Role

Backend / API

Python, Flask

Handles routing, file saving, and acts as the API Producer.

Concurrency

Python threading, queue

Manages the worker thread pool and the job buffer.

Real-Time Push

Flask-SocketIO

Establishes the WebSocket connection for instant status updates.

Frontend

React, Axios, Socket.io-client

Dynamic user interface for upload and real-time job tracking.

Quick Start Guide
Backend Setup:

cd backend
pip install Flask Flask-SocketIO gevent gevent-websocket
python app.py


(Runs on http://localhost:5000)

Frontend Setup:

cd frontend
npm install axios socket.io-client
npm start


(Runs on http://localhost:3000)

Test: Upload a file (like server_log_2025.csv). Immediately upload another one. Observe the concurrent processing logs in the Python terminal and the real-time status updates on the React dashboard.

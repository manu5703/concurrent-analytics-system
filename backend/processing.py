import threading
import queue
import time
import os
import re
import uuid
import json # <-- ADDED FOR DEBUGGING OUTPUT
from typing import Dict, Any

# --- Shared Global Resources ---
job_queue = queue.Queue()
results_store: Dict[str, Any] = {}
results_lock = threading.Lock()
socketio = None # Placeholder for Flask-SocketIO instance

# --- Configuration ---
SIMULATED_WORK_TIME = 2 # Seconds

def set_socketio_instance(sio):
    global socketio
    socketio = sio

def perform_analytics(file_path: str) -> Dict[str, Any]:
    
    time.sleep(SIMULATED_WORK_TIME) 
    
    line_count = 0
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            for line_count, _ in enumerate(f, 1):
                pass
        
        # Simple analysis result
        return {
            'status': 'COMPLETED',
            'line_count': line_count,
            'report': f"Processed {line_count} lines successfully."
        }
    except FileNotFoundError:
        return {'status': 'FAILED', 'error': 'File not found on server.'}
    except Exception as e:
        return {'status': 'FAILED', 'error': f"Processing error: {str(e)}"}

def worker_thread(worker_id: int):
    """Worker function (Consumer) that processes jobs from the queue."""
    print(f"Worker {worker_id} started and waiting for jobs.")
    while True:
        try:
            # Retrieves job; times out after 1s if queue is empty
            job_info = job_queue.get(timeout=1)
            job_id = job_info['job_id']
            file_path = job_info['file_path']
            user_sid = job_info['user_sid']
            original_file_name = job_info['original_file_name']

            print(f"Worker {worker_id} STARTING Job ID: {job_id[:8]}... for file: {original_file_name}")

            # Update status to PROCESSING (and push to frontend)
            with results_lock:
                results_store[job_id]['status'] = 'PROCESSING'
            if socketio and user_sid:
                socketio.emit('job_update', {'job_id': job_id, 'status': 'PROCESSING'}, room=user_sid)
            
            # --- EXECUTE ANALYTICS ---
            analytics_result = perform_analytics(file_path)

            # Update final result (and push to frontend)
            with results_lock:
                results_store[job_id].update(analytics_result)
                
                print("\n========================================================")
                print(f"DEBUG DUMP: results_store after Worker {worker_id} finished:")
                # Prints the entire dictionary contents formatted as JSON
                print(json.dumps(results_store, indent=2)) 
                print("========================================================\n")

            if socketio and user_sid:
                socketio.emit('job_update', results_store[job_id], room=user_sid)

            print(f"Worker {worker_id} FINISHED Job ID: {job_id[:8]}...")

            # Clean up the uploaded file
            try:
                os.remove(file_path)
            except Exception as e:
                print(f"Error cleaning up file {file_path}: {e}")

            job_queue.task_done()

        except queue.Empty:
            # Queue empty, keep waiting
            pass
        except Exception as e:
            # Catches unexpected threading/system errors
            print(f"Worker {worker_id} encountered a critical error: {e}")
            job_queue.task_done()
            break

def start_worker_pool(num_workers: int):
    """Initializes and starts the worker thread pool."""
    for i in range(num_workers):
        t = threading.Thread(target=worker_thread, args=(i + 1,), daemon=True)
        t.start()

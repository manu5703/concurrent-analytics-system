from flask import Flask, request, jsonify, send_from_directory
from flask_socketio import SocketIO, join_room, emit, disconnect
import os
import uuid
import time
# Importing the processing logic, including perform_analytics
from processing import job_queue, results_store, results_lock, start_worker_pool, set_socketio_instance, perform_analytics

# --- Configuration ---
UPLOAD_FOLDER = 'uploads'
NUM_WORKERS = 3
app = Flask(__name__, static_folder='../frontend/build', static_url_path='/')
app.config['SECRET_KEY'] = 'your_strong_secret_key'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Initialize SocketIO (Critical: Enable CORS)

socketio = SocketIO(app, cors_allowed_origins="*", async_mode='gevent') 
set_socketio_instance(socketio) 

os.makedirs(UPLOAD_FOLDER, exist_ok=True) 

# --- Utility Function to Handle File Saving ---

def save_uploaded_file(file_obj):
    """Saves file to disk and returns unique file path."""
    if file_obj.filename == '':
        return None, "No selected file"
        
    unique_filename = f"{uuid.uuid4()}_{file_obj.filename}"
    file_path = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
    
    try:
        file_obj.save(file_path)
        return file_path, file_obj.filename
    except Exception as e:
        return None, f'Failed to save file: {str(e)}'

# --- API Routes ---

@app.route('/')
def index():
    """Serve the index.html file for the React application."""
    try:
        return send_from_directory(app.static_folder, 'index.html')
    except Exception as e:
        return f"Error loading frontend: {e}. Did you run 'npm run build' in the frontend directory?"


# 1. ASYNCHRONOUS (NON-BLOCKING) API ROUTE

@app.route('/api/upload', methods=['POST'])
def upload_file_async():
    """ASYNCHRONOUS: Puts job in queue and returns instantly (fast response time)."""
    start_time = time.time()
    
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['file']
    user_id = request.form.get('userId', 'anonymous')
    user_sid = request.form.get('userSid') 

    file_path, filename = save_uploaded_file(file)

    if not file_path:
        return jsonify({'error': filename}), 400

    job_id = str(uuid.uuid4())
    current_time = time.time()
    
    job_info = {
        'job_id': job_id,
        'user_id': user_id,
        'file_path': file_path,
        'user_sid': user_sid,
        'original_file_name': filename
    }
    
    # Initialize status in shared store (QUEUED)
    with results_lock:
        results_store[job_id] = {
            'job_id': job_id,
            'file_name': filename,
            'status': 'QUEUED',
            'submitted_at': current_time
        }
        
    # Put job into the queue (The Producer action)
    job_queue.put(job_info)
    
    response_time = time.time() - start_time
    print(f"\nAPI: ASYNC Job {job_id[:8]} queued. Flask Response Time: {response_time:.4f}s (FAST)")
    
    return jsonify({
        'message': 'File queued for processing.', 
        'job_id': job_id,
        'initial_status': results_store[job_id]
    }), 202 # 202 Accepted


# 2. SYNCHRONOUS (BLOCKING) API ROUTE

@app.route('/api/sync-upload', methods=['POST'])
def upload_file_sync():
    """Blocking route for comparison. Executes work in the main thread."""
    start_api_time = time.time()
    file_path = None # Initialize path outside try block

    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['file']

    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    # 1. Save file
    unique_filename = f"{uuid.uuid4()}_{file.filename}"
    file_path = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
    original_file_name = file.filename
    
    try:
        file.save(file_path)
        
        # 2. Execute Blocking Analytics
        print(f"API: SYNC Job STARTING for file: {original_file_name}. *** MAIN THREAD IS NOW BLOCKED ***")
        
        # Ensure perform_analytics is imported from processing.py
        # THIS IS THE CRITICAL CALL TO AVOID CRASHING DUE TO MISSING ARGUMENT
        analytics_result = perform_analytics(file_path, is_sync=True)
        
        # 3. Finish and Log
        end_api_time = time.time()
        response_time = end_api_time - start_api_time
        
        print(f"API: SYNC Job FINISHED. Total Response Time: {response_time:.2f}s (SLOW)")
        
        # Prepare final report structure to return
        final_report = analytics_result['report'].replace("Analysis duration", "API Response Time")
        
        # Update report with final response time
        analytics_result['report'] = f"{final_report}, API Response Time: {response_time:.2f}s"


        return jsonify({
            'filename': original_file_name,
            'results': analytics_result
        }), 200

    except Exception as e:
        # Log the detailed server error before returning a generic response
        print(f"!!! CRITICAL SYNC ERROR: {e} during processing of {original_file_name}")
        return jsonify({'error': 'Internal server error during synchronous processing.'}), 500
        
    finally:
        # 4. Cleanup the file path
        if file_path and os.path.exists(file_path):
            try:
                os.remove(file_path)
                print(f"Cleaned up file: {file_path}")
            except Exception as e:
                print(f"Error during SYNC cleanup: {e}")

# --- WebSocket Events ---

@socketio.on('connect')
def handle_connect():
    print(f"Socket: Client connected. SID: {request.sid}")

@socketio.on('join_session')
def on_join_session(data):
    join_room(request.sid)
    print(f"Socket: Client joined room: {request.sid}")

@socketio.on('disconnect')
def handle_disconnect():
    print(f"Socket: Client disconnected. SID: {request.sid}")

# --- Run Application ---
if __name__ == '__main__':
    start_worker_pool(NUM_WORKERS)
    print(f"Starting Flask API and SocketIO with {NUM_WORKERS} workers...")
    socketio.run(app, host='0.0.0.0', port=5000, debug=True, use_reloader=False)

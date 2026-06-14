import os
import json
import sqlite3
from http.server import BaseHTTPRequestHandler, HTTPServer

# Define the absolute path to the exact same database file your PHP server created
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
DB_DIR = os.path.abspath(os.path.join(CURRENT_DIR, "..", "..", "Database"))
DB_PATH = os.path.join(DB_DIR, "todo.db")

class PolyglotAPIHandler(BaseHTTPRequestHandler):

    # ==========================================
    # CORE ROUTING & HELPER LAYERS
    # ==========================================
    def parse_request_context(self):
        """Slices the URL path and extracts the resource target and optional ID."""
        # Strip query strings if present (e.g., /api/todos?filter=all -> /api/todos)
        path = self.path.split('?')[0]
        segments = [s for s in path.split('/') if s]
        
        # Guard rail: Must match /api/todos
        if len(segments) < 2 or segments[0] != 'api' or segments[1] != 'todos':
            return None, None
            
        todo_id = None
        if len(segments) == 3:
            try:
                todo_id = int(segments[2])
            except ValueError:
                pass # Invalid non-integer ID passed
                
        return segments[1], todo_id

    def send_json_response(self, status_code, data_payload):
        """Utility engine to cleanly bundle CORS headers and stream JSON payloads."""
        self.send_response(status_code)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Content-Type", "application/json; charset=UTF-8")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With")
        self.end_headers()
        
        if data_payload is not None:
            self.wfile.write(json.dumps(data_payload).encode('utf-8'))

    # ==========================================
    # BROWSER PRE-FLIGHT HANDLER
    # ==========================================
    def do_OPTIONS(self):
        """Intercepts browser pre-flight validation security requests immediately."""
        self.send_json_response(200, None)

    # ==========================================
    # READ OPERATION (GET /api/todos)
    # ==========================================
    def do_GET(self):
        resource, todo_id = self.parse_request_context()
        if resource is None:
            return self.send_json_response(404, {"status": "error", "message": "Endpoint not found"})

        try:
            conn = sqlite3.connect(DB_PATH)
            # Configure row factory to return clean dictionaries instead of tuple arrays
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            
            cursor.execute("SELECT * FROM todos ORDER BY created_at DESC")
            rows = cursor.fetchall()
            
            # Map sqlite3 rows into standard JSON-serializable dictionaries
            todos = []
            for row in rows:
                todos.append({
                    "id": row["id"],
                    "title": row["title"],
                    "description": row["description"],
                    "is_completed": row["is_completed"],
                    "due_date": row["due_date"]
                })
                
            conn.close()
            self.send_json_response(200, todos)
            
        except Exception as e:
            self.send_json_response(500, {"status": "error", "message": f"Read Failure: {str(e)}"})

    # ==========================================
    # CREATE OPERATION (POST /api/todos)
    # ==========================================
    def do_POST(self):
        resource, _ = self.parse_request_context()
        if resource is None:
            return self.send_json_response(404, {"status": "error", "message": "Endpoint not found"})

        try:
            # Read the incoming stream bytes based on Content-Length header
            content_length = int(self.headers['Content-Length'])
            raw_body = self.rfile.read(content_length)
            data = json.loads(raw_body.decode('utf-8'))

            if 'title' not in data or not data['title'].strip():
                return self.send_json_response(400, {"status": "error", "message": "Validation Failure: Title required"})

            conn = sqlite3.connect(DB_PATH)
            cursor = conn.cursor()
            
            cursor.execute(
                "INSERT INTO todos (title, description, due_date) VALUES (?, ?, ?)",
                (data['title'].strip(), data.get('description'), data.get('due_date'))
            )
            conn.commit()
            new_id = cursor.lastrowid
            conn.close()

            self.send_json_response(201, {
                "id": new_id,
                "title": data['title'].strip(),
                "description": data.get('description'),
                "is_completed": 0,
                "due_date": data.get('due_date')
            })
            
        except Exception as e:
            self.send_json_response(500, {"status": "error", "message": f"Insertion Failure: {str(e)}"})

    # ==========================================
    # UPDATE OPERATION (PUT /api/todos/{id})
    # ==========================================
    def do_PUT(self):
        resource, todo_id = self.parse_request_context()
        if resource is None or todo_id is None:
            return self.send_json_response(400, {"status": "error", "message": "Target Identifier required"})

        try:
            content_length = int(self.headers['Content-Length'])
            raw_body = self.rfile.read(content_length)
            data = json.loads(raw_body.decode('utf-8'))

            conn = sqlite3.connect(DB_PATH)
            cursor = conn.cursor()
            
            cursor.execute(
                "UPDATE todos SET title = ?, description = ?, is_completed = ?, due_date = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
                (data['title'].strip(), data.get('description'), int(data.get('is_completed', 0)), data.get('due_date'), todo_id)
            )
            conn.commit()
            conn.close()

            self.send_json_response(200, {"status": "success", "message": "Record updated successfully"})
            
        except Exception as e:
            self.send_json_response(500, {"status": "error", "message": f"Mutation Failure: {str(e)}"})

    # ==========================================
    # DELETE OPERATION (DELETE /api/todos/{id})
    # ==========================================
    def do_DELETE(self):
        resource, todo_id = self.parse_request_context()
        if resource is None or todo_id is None:
            return self.send_json_response(400, {"status": "error", "message": "Target Identifier required"})

        try:
            conn = sqlite3.connect(DB_PATH)
            cursor = conn.cursor()
            
            cursor.execute("DELETE FROM todos WHERE id = ?", (todo_id,))
            conn.commit()
            conn.close()

            self.send_json_response(200, {"status": "success", "message": "Record destroyed"})
            
        except Exception as e:
            self.send_json_response(500, {"status": "error", "message": f"Erasure Failure: {str(e)}"})

# ==========================================================================
# SYSTEM IGNITION SEQUENCE
# ==========================================================================
def run_server(port=8000):
    # Ensure database directory exists automatically
    if not os.path.exists(DB_DIR):
        os.makedirs(DB_DIR)
        
    server_address = ('', port)
    httpd = HTTPServer(server_address, PolyglotAPIHandler)
    print(f"🚀 Interchangeable Python Server streaming live on http://localhost:{port}")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n🛑 Server shutting down gracefully.")

if __name__ == '__main__':
    run_server()
<?php
/**
 * ==========================================================================
 * MASTER ENTRY POINT & DATA MUTATION SWAPBOARD
 * ==========================================================================
 */

// 1. Core Component Dependencies
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/router.php';

// 2. Initial Execution Trace & Request Extraction
$request = parseIncomingRequest();
$db = getDatabaseConnection();

$method = $request['method'];
$id = $request['id'];

// 3. Command Execution Routing Pass
switch ($method) {
    
    // ==========================================
    // READ OPERATION (GET /api/todos)
    // ==========================================
    case 'GET':
        try {
            $stmt = $db->query("SELECT * FROM todos ORDER BY created_at DESC");
            $todos = $stmt->fetchAll();
            
            // Map integer database binary formats (0/1) back to standard JSON integers/booleans
            foreach ($todos as &$todo) {
                $todo['id'] = (int)$todo['id'];
                $todo['is_completed'] = (int)$todo['is_completed'];
            }
            
            http_response_code(200);
            echo json_encode($todos);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => "Read Failure: " . $e->getMessage()]);
        }
        break;

    // ==========================================
    // CREATE OPERATION (POST /api/todos)
    // ==========================================
    case 'POST':
        // Capture raw incoming JSON stream byte contents
        $rawInput = file_get_contents('php://input');
        $data = json_decode($rawInput, true);

        if (!isset($data['title']) || trim($data['title']) === '') {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Validation Failure: Title field required."]);
            break;
        }

        try {
            $sql = "INSERT INTO todos (title, description, due_date) VALUES (:title, :description, :due_date)";
            $stmt = $db->prepare($sql);
            
            $stmt->execute([
                ':title' => trim($data['title']),
                ':description' => isset($data['description']) ? trim($data['description']) : null,
                ':due_date' => isset($data['due_date']) && $data['due_date'] !== '' ? $data['due_date'] : null
            ]);

            // Retrieve structural ID allocation assigned by SQLite auto-increment engine
            $newId = $db->lastInsertId();

            http_response_code(201); // Created
            echo json_encode([
                "id" => (int)$newId,
                "title" => $data['title'],
                "description" => $data['description'] ?? null,
                "is_completed" => 0,
                "due_date" => $data['due_date'] ?? null
            ]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => "Insertion Failure: " . $e->getMessage()]);
        }
        break;

    // ==========================================
    // UPDATE OPERATION (PUT /api/todos/{id})
    // ==========================================
    case 'PUT':
        if (!$id) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Target Identifier required for mutation requests."]);
            break;
        }

        $rawInput = file_get_contents('php://input');
        $data = json_decode($rawInput, true);

        try {
            $sql = "UPDATE todos 
                    SET title = :title, description = :description, is_completed = :is_completed, due_date = :due_date, updated_at = CURRENT_TIMESTAMP 
                    WHERE id = :id";
            $stmt = $db->prepare($sql);
            
            $stmt->execute([
                ':title' => trim($data['title']),
                ':description' => isset($data['description']) ? trim($data['description']) : null,
                ':is_completed' => isset($data['is_completed']) ? (int)$data['is_completed'] : 0,
                ':due_date' => isset($data['due_date']) && $data['due_date'] !== '' ? $data['due_date'] : null,
                ':id' => $id
            ]);

            http_response_code(200);
            echo json_encode(["status" => "success", "message" => "Record updated successfully."]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => "Mutation Failure: " . $e->getMessage()]);
        }
        break;

    // ==========================================
    // DELETE OPERATION (DELETE /api/todos/{id})
    // ==========================================
    case 'DELETE':
        if (!$id) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Target Identifier required for erasure requests."]);
            break;
        }

        try {
            $sql = "DELETE FROM todos WHERE id = :id";
            $stmt = $db->prepare($sql);
            $stmt->execute([':id' => $id]);

            http_response_code(200);
            echo json_encode(["status" => "success", "message" => "Record destroyed."]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => "Erasure Failure: " . $e->getMessage()]);
        }
        break;

    // Default Fallback Boundary Defenses
    default:
        http_response_code(405); // Method Not Allowed
        echo json_encode(["status" => "error", "message" => "HTTP Method Paradigm unsupported."]);
        break;
}
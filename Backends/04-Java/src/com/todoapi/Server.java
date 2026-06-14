package com.todoapi;

import com.sun.net.httpserver.HttpServer;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpExchange;

import java.io.*;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class Server {
    private static String dbUrl;

    public static void main(String[] args) throws Exception {
        // 1. Establish absolute pathing to the shared Database layer
        File currentDir = new File(System.getProperty("user.dir"));

        // Move UP out of 04-Java, and UP out of Backends, into the root folder
        File rootDir = currentDir.getParentFile().getParentFile();
        File dbFile = new File(rootDir, "Database/todo.db");
        dbUrl = "jdbc:sqlite:" + dbFile.getAbsolutePath();

        // 2. Initialize Database Schema
        initializeDatabase();

        // 3. Start Native HTTP Server on port 8000
        HttpServer server = HttpServer.create(new InetSocketAddress(8000), 0);
        server.createContext("/api/todos", new TodoHandler());
        server.setExecutor(null); // default executor
        System.out.println("🚀 Interchangeable Java Server streaming live on http://127.0.0.1:8000/api/todos");
        server.start();
    }

    private static void initializeDatabase() {
        String sql = "CREATE TABLE IF NOT EXISTS todos (" +
                "id INTEGER PRIMARY KEY AUTOINCREMENT, " +
                "title TEXT NOT NULL, " +
                "description TEXT, " +
                "is_completed INTEGER NOT NULL DEFAULT 0, " +
                "due_date TEXT, " +
                "created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, " +
                "updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP" +
                ");";
        try {
            // FORCE REGISTER THE DRIVER
            Class.forName("org.sqlite.JDBC");

            try (Connection conn = DriverManager.getConnection(dbUrl);
                    Statement stmt = conn.createStatement()) {
                stmt.execute(sql);
            }
        } catch (Exception e) {
            System.out.println("⚠️ DB Init Error: " + e.getMessage());
        }
    }

    static class TodoHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            // Inject CORS Security Headers exactly like our other backends
            exchange.getResponseHeaders().add("Access-Control-Allow-Origin", "*");
            exchange.getResponseHeaders().add("Content-Type", "application/json; charset=UTF-8");
            exchange.getResponseHeaders().add("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
            exchange.getResponseHeaders().add("Access-Control-Allow-Headers",
                    "Content-Type, Authorization, X-Requested-With");

            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                exchange.sendResponseHeaders(200, -1);
                return;
            }

            String path = exchange.getRequestURI().getPath();
            String method = exchange.getRequestMethod();
            String responseJson = "";
            int statusCode = 200;

            try {
                // Route parsing execution matrix
                String[] segments = path.split("/");
                Integer todoId = null;
                if (segments.length >= 4) {
                    todoId = Integer.parseInt(segments[3]);
                }

                if ("GET".equalsIgnoreCase(method)) {
                    responseJson = handleGet();
                    statusCode = 200;
                } else if ("POST".equalsIgnoreCase(method)) {
                    responseJson = handlePost(exchange.getRequestBody());
                    statusCode = 21; // Created
                } else if ("PUT".equalsIgnoreCase(method)) {
                    responseJson = handlePut(todoId, exchange.getRequestBody());
                    statusCode = 200;
                } else if ("DELETE".equalsIgnoreCase(method)) {
                    responseJson = handleDelete(todoId);
                    statusCode = 200;
                } else {
                    statusCode = 405; // Method Not Allowed
                }
            } catch (Exception e) {
                statusCode = 500;
                responseJson = "{\"status\":\"error\",\"message\":\"" + e.getMessage() + "\"}";
            }

            byte[] responseBytes = responseJson.getBytes(StandardCharsets.UTF_8);
            exchange.sendResponseHeaders(statusCode, responseBytes.length);
            try (OutputStream os = exchange.getResponseBody()) {
                os.write(responseBytes);
            }
        }

        private String handleGet() throws Exception {
            List<String> jsonItems = new ArrayList<>();
            String sql = "SELECT id, title, description, is_completed, due_date FROM todos ORDER BY created_at DESC";

            // FORCE REGISTER THE DRIVER
            Class.forName("org.sqlite.JDBC");

            try (Connection conn = DriverManager.getConnection(dbUrl);
                    Statement stmt = conn.createStatement();
                    ResultSet rs = stmt.executeQuery(sql)) {

                while (rs.next()) {
                    String desc = rs.getString("description");
                    String dueDate = rs.getString("due_date");

                    String item = String.format(
                            "{\"id\":%d,\"title\":\"%s\",\"description\":%s,\"is_completed\":%d,\"due_date\":%s}",
                            rs.getInt("id"),
                            rs.getString("title").replace("\"", "\\\""),
                            desc == null ? "null" : "\"" + desc.replace("\"", "\\\"") + "\"",
                            rs.getInt("is_completed"),
                            dueDate == null ? "null" : "\"" + dueDate + "\"");
                    jsonItems.add(item);
                }
            }
            return "[" + String.join(",", jsonItems) + "]";
        }

        private String handlePost(InputStream requestBody) throws Exception {
            String body = new String(requestBody.readAllBytes(), StandardCharsets.UTF_8);

            // Simple micro-parser for raw JSON fields
            String title = extractJsonField(body, "title");
            String description = extractJsonField(body, "description");
            String dueDate = extractJsonField(body, "due_date");

            if (title == null || title.trim().isEmpty()) {
                throw new IllegalArgumentException("Validation Failure: Title required");
            }

            String sql = "INSERT INTO todos (title, description, due_date) VALUES (?, ?, ?)";
            long newId = 0;

            try (Connection conn = DriverManager.getConnection(dbUrl);
                    PreparedStatement pstmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
                pstmt.setString(1, title.trim());
                pstmt.setString(2, description);
                pstmt.setString(3, dueDate);
                pstmt.executeUpdate();

                try (ResultSet generatedKeys = pstmt.getGeneratedKeys()) {
                    if (generatedKeys.next()) {
                        newId = generatedKeys.getLong(1);
                    }
                }
            }

            return String.format(
                    "{\"id\":%d,\"title\":\"%s\",\"description\":%s,\"is_completed\":0,\"due_date\":%s}",
                    newId,
                    title.trim().replace("\"", "\\\""),
                    description == null ? "null" : "\"" + description.replace("\"", "\\\"") + "\"",
                    dueDate == null ? "null" : "\"" + dueDate + "\"");
        }

        private String handlePut(Integer id, InputStream requestBody) throws Exception {
            if (id == null)
                throw new IllegalArgumentException("Target Identifier required");

            String body = new String(requestBody.readAllBytes(), StandardCharsets.UTF_8);
            String title = extractJsonField(body, "title");
            String description = extractJsonField(body, "description");
            String isCompletedStr = extractJsonField(body, "is_completed");
            String dueDate = extractJsonField(body, "due_date");

            int isCompleted = "1".equals(isCompletedStr) || "true".equalsIgnoreCase(isCompletedStr) ? 1 : 0;

            String sql = "UPDATE todos SET title = ?, description = ?, is_completed = ?, due_date = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?";
            try (Connection conn = DriverManager.getConnection(dbUrl);
                    PreparedStatement pstmt = conn.prepareStatement(sql)) {
                pstmt.setString(1, title != null ? title.trim() : "");
                pstmt.setString(2, description);
                pstmt.setInt(3, isCompleted);
                pstmt.setString(4, dueDate);
                pstmt.setInt(5, id);
                pstmt.executeUpdate();
            }

            return "{\"status\":\"success\",\"message\":\"Record updated successfully\"}";
        }

        private String handleDelete(Integer id) throws SQLException {
            if (id == null)
                throw new IllegalArgumentException("Target Identifier required");

            String sql = "DELETE FROM todos WHERE id = ?";
            try (Connection conn = DriverManager.getConnection(dbUrl);
                    PreparedStatement pstmt = conn.prepareStatement(sql)) {
                pstmt.setInt(1, id);
                pstmt.executeUpdate();
            }
            return "{\"status\":\"success\",\"message\":\"Record destroyed\"}";
        }

        private static String extractJsonField(String json, String field) {
            // This regex looks for "field" followed by a colon, optional spaces, and grabs
            // the value
            // It captures either a quoted string or unquoted text (like numbers, booleans,
            // or null)
            java.util.regex.Pattern pattern = java.util.regex.Pattern.compile(
                    "\"" + field + "\"\\s*:\\s*(?:\"([^\"]*)\"|([^,}\\s]+))");
            java.util.regex.Matcher matcher = pattern.matcher(json);

            if (matcher.find()) {
                // If group 1 matched, it was a quoted string. If group 2 matched, it was raw
                // text (like null/numbers).
                String value = matcher.group(1) != null ? matcher.group(1) : matcher.group(2);

                if (value == null || "null".equalsIgnoreCase(value.trim())) {
                    return null;
                }
                return value.trim();
            }
            return null; // Key wasn't even in the JSON payload
        }
    }
}
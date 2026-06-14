using System;
using System.IO;
using System.Net;
using System.Text;
using System.Text.Json;
using System.Collections.Generic;
using Microsoft.Data.Sqlite;
using System.Text.Json.Serialization;

namespace _03_CSharp
{
    class Program
    {
        private static string DbPath = string.Empty;

        static void Main(string[] args)
        {
            // 1. Establish absolute pathing to the shared Database layer
            string currentDir = Directory.GetCurrentDirectory();
            string dbDir = Path.GetFullPath(Path.Combine(currentDir, "..", "..", "Database"));
            Directory.CreateDirectory(dbDir);
            DbPath = Path.Combine(dbDir, "todo.db");

            // 2. Self-Healing Schema Initialization
            InitializeDatabase();

            // 3. Instantiate Native HTTP Listener Engine
            string prefix = "http://localhost:8000/api/todos/";
            HttpListener listener = new HttpListener();
            listener.Prefixes.Add(prefix);

            try
            {
                listener.Start();
                Console.WriteLine($"🚀 Interchangeable C# Server streaming live on {prefix}");

                while (true)
                {
                    HttpListenerContext context = listener.GetContext();
                    HttpListenerRequest request = context.Request;
                    HttpListenerResponse response = context.Response;

                    // Inject CORS Security Headers
                    response.Headers.Add("Access-Control-Allow-Origin", "*");
                    response.Headers.Add("Content-Type", "application/json; charset=UTF-8");
                    response.Headers.Add("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
                    response.Headers.Add("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");

                    if (request.HttpMethod == "OPTIONS")
                    {
                        response.StatusCode = (int)HttpStatusCode.OK;
                        response.Close();
                        continue;
                    }

                    string path = request.Url?.AbsolutePath ?? "";
                    string[] segments = path.Split(new char[] { '/' }, StringSplitOptions.RemoveEmptyEntries);

                    int? todoId = null;
                    if (segments.Length >= 3 && int.TryParse(segments[2], out int parsedId))
                    {
                        todoId = parsedId;
                    }

                    try
                    {
                        string jsonResponse = "";
                        switch (request.HttpMethod)
                        {
                            case "GET":
                                jsonResponse = HandleGet();
                                response.StatusCode = (int)HttpStatusCode.OK;
                                break;
                            case "POST":
                                jsonResponse = HandlePost(request);
                                response.StatusCode = (int)HttpStatusCode.Created;
                                break;
                            case "PUT":
                                jsonResponse = HandlePut(todoId, request);
                                response.StatusCode = (int)HttpStatusCode.OK;
                                break;
                            case "DELETE":
                                jsonResponse = HandleDelete(todoId);
                                response.StatusCode = (int)HttpStatusCode.OK;
                                break;
                            default:
                                response.StatusCode = (int)HttpStatusCode.MethodNotAllowed;
                                break;
                        }

                        if (!string.IsNullOrEmpty(jsonResponse))
                        {
                            byte[] buffer = Encoding.UTF8.GetBytes(jsonResponse);
                            response.ContentLength64 = buffer.Length;
                            response.OutputStream.Write(buffer, 0, buffer.Length);
                        }
                    }
                    catch (Exception ex)
                    {
                        response.StatusCode = (int)HttpStatusCode.InternalServerError;
                        string errorJson = JsonSerializer.Serialize(new { status = "error", message = ex.Message });
                        byte[] buffer = Encoding.UTF8.GetBytes(errorJson);
                        response.OutputStream.Write(buffer, 0, buffer.Length);
                    }
                    finally
                    {
                        response.OutputStream.Close();
                    }
                }
            }
            catch (HttpListenerException ex)
            {
                Console.WriteLine($"⚠️ Listener Exception encountered: {ex.Message}");
            }
        }

        private static void InitializeDatabase()
        {
            using (var connection = new SqliteConnection($"Data Source={DbPath}"))
            {
                connection.Open();
                var command = connection.CreateCommand();
                command.CommandText = @"
                    CREATE TABLE IF NOT EXISTS todos (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        title TEXT NOT NULL,
                        description TEXT,
                        is_completed INTEGER NOT NULL DEFAULT 0,
                        due_date TEXT,
                        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
                    );";
                command.ExecuteNonQuery();
            }
        }

        private static string HandleGet()
        {
            var todos = new List<TodoResponse>();
            using (var connection = new SqliteConnection($"Data Source={DbPath}"))
            {
                connection.Open();
                var command = connection.CreateCommand();
                command.CommandText = "SELECT id, title, description, is_completed, due_date FROM todos ORDER BY created_at DESC";
                using (var reader = command.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        todos.Add(new TodoResponse
                        {
                            Id = reader.GetInt32(0),
                            Title = reader.GetString(1),
                            Description = reader.IsDBNull(2) ? null : reader.GetString(2),
                            IsCompleted = reader.GetInt32(3),
                            DueDate = reader.IsDBNull(4) ? null : reader.GetString(4)
                        });
                    }
                }
            }
            return JsonSerializer.Serialize(todos, new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase
            });
        }

        private static string HandlePost(HttpListenerRequest request)
        {
            TodoInput? inputTodo;
            using (var reader = new StreamReader(request.InputStream, request.ContentEncoding))
            {
                string body = reader.ReadToEnd();
                inputTodo = JsonSerializer.Deserialize<TodoInput>(body, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
            }

            if (inputTodo == null || string.IsNullOrWhiteSpace(inputTodo.Title))
            {
                throw new ArgumentException("Validation Failure: Title required");
            }

            long newId = 0;
            using (var connection = new SqliteConnection($"Data Source={DbPath}"))
            {
                connection.Open();
                var command = connection.CreateCommand();
                command.CommandText = @"
                    INSERT INTO todos (title, description, due_date) 
                    VALUES (@title, @description, @dueDate)";

                command.Parameters.AddWithValue("@title", inputTodo.Title.Trim());
                command.Parameters.AddWithValue("@description", (object?)inputTodo.Description ?? DBNull.Value);
                command.Parameters.AddWithValue("@dueDate", (object?)inputTodo.DueDate ?? DBNull.Value);

                command.ExecuteNonQuery();

                command.CommandText = "SELECT last_insert_rowid()";
                var scalarResult = command.ExecuteScalar();
                if (scalarResult != null && scalarResult != DBNull.Value)
                {
                    newId = (long)scalarResult;
                }
            }

            var responsePayload = new TodoResponse
            {
                Id = (int)newId,
                Title = inputTodo.Title.Trim(),
                Description = inputTodo.Description,
                IsCompleted = 0,
                DueDate = inputTodo.DueDate
            };

            return JsonSerializer.Serialize(responsePayload);
        }

        private static string HandlePut(int? id, HttpListenerRequest request)
        {
            if (!id.HasValue) throw new ArgumentException("Target Identifier required for mutation requests");

            TodoInput? inputTodo;
            using (var reader = new StreamReader(request.InputStream, request.ContentEncoding))
            {
                string body = reader.ReadToEnd();
                inputTodo = JsonSerializer.Deserialize<TodoInput>(body, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
            }

            if (inputTodo == null) throw new ArgumentException("Invalid payload structure received");

            using (var connection = new SqliteConnection($"Data Source={DbPath}"))
            {
                connection.Open();
                var command = connection.CreateCommand();
                command.CommandText = @"
                    UPDATE todos 
                    SET title = @title, description = @description, is_completed = @isCompleted, due_date = @dueDate, updated_at = CURRENT_TIMESTAMP
                    WHERE id = @id";

                command.Parameters.AddWithValue("@title", inputTodo.Title.Trim());
                command.Parameters.AddWithValue("@description", (object?)inputTodo.Description ?? DBNull.Value);
                command.Parameters.AddWithValue("@isCompleted", inputTodo.IsCompleted);
                command.Parameters.AddWithValue("@dueDate", (object?)inputTodo.DueDate ?? DBNull.Value);
                command.Parameters.AddWithValue("@id", id.Value);

                command.ExecuteNonQuery();
            }

            return JsonSerializer.Serialize(new { status = "success", message = "Record updated successfully" });
        }

        private static string HandleDelete(int? id)
        {
            if (!id.HasValue) throw new ArgumentException("Target Identifier required for erasure requests");

            using (var connection = new SqliteConnection($"Data Source={DbPath}"))
            {
                connection.Open();
                var command = connection.CreateCommand();
                command.CommandText = "DELETE FROM todos WHERE id = @id";
                command.Parameters.AddWithValue("@id", id.Value);
                command.ExecuteNonQuery();
            }

            return JsonSerializer.Serialize(new { status = "success", message = "Record destroyed" });
        }
    }

    public class TodoInput
    {
        [JsonPropertyName("title")]
        public required string Title { get; set; }

        [JsonPropertyName("description")]
        public string? Description { get; set; }

        [JsonPropertyName("is_completed")]
        public int IsCompleted { get; set; }

        [JsonPropertyName("due_date")]
        public string? DueDate { get; set; }
    }

    public class TodoResponse
    {
        [JsonPropertyName("id")]
        public int Id { get; set; }

        [JsonPropertyName("title")]
        public string Title { get; set; } = "";

        [JsonPropertyName("description")]
        public string? Description { get; set; }

        [JsonPropertyName("is_completed")]
        public int IsCompleted { get; set; }

        [JsonPropertyName("due_date")]
        public string? DueDate { get; set; }
    }
}
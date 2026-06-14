# The Polyglot Workspace (V1)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![PHP](https://img.shields.io/badge/PHP-777BB4?style=for-the-badge&logo=php&logoColor=white)
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![C#](https://img.shields.io/badge/C%23-239120?style=for-the-badge&logo=c-sharp&logoColor=white)
![Java](https://img.shields.io/badge/Java-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-074D5B?style=for-the-badge&logo=sqlite&logoColor=white)

A decoupled, full-stack sandbox demonstrating how four completely different backend architectures can seamlessly swap places to power the exact same frontend application and shared database.

---
## 🚀 The Architecture
This project implements a unified API contract. You can stop any backend server, boot up another, refresh your browser, and the application will continue running seamlessly without structural friction.

| Language | Port | Technology | DB System | JSON Strategy |
| :--- | :--- | :--- | :--- | :--- |
| **PHP** | `8000` | `PDO` | SQLite | Native Arrays |
| **Python** | `8000` | `http.server` | SQLite | Built-in `sqlite3` |
| **C#** | `8000` | `HttpListener` | SQLite | `Microsoft.Data.Sqlite` + Pascal Mapping |
| **Java** | `8000` | `HttpServer` | SQLite | Raw JDBC + Custom Regex Parser |

## 📁 Repository Structure
```plaintext
The-Polyglot-Workspace/
├── Frontend/                 # Vanilla client layer (HTML5, CSS3, ES6 JavaScript Fetch API)
├── Database/                 # Auto-generated SQLite local binary home (Excluded from Git tracking)
└── Backends/                 # Isolated server environments
    ├── 01-PHP/               # Dynamic procedural route array processing
    ├── 02-Python/            # Minimal override handler processing loop
    ├── 03-CSharp/            # Asynchronous infrastructure multi-threaded listener
    └── 04-Java/              # Raw JVM classpath mappings & regex parameter tokenizer
```
## 🚦 Quick Start & Server Deployment
To spin up any backend engine, navigate to its respective directory inside your terminal and run the designated start command:
### 🐘 Run PHP Backend
```PowerShell

cd Backends/01-PHP
php -S localhost:8000 index.php
```
### 🐍 Run Python Backend
```PowerShell

cd Backends/02-Python
python server.py
```
### 🎯 Run C# Backend
```PowerShell

cd Backends/03-CSharp
dotnet build
dotnet run
```
### ☕ Run Java Backend
```PowerShell

cd Backends/04-Java
javac -cp "sqlite-jdbc.jar" -d bin src/com/todoapi/Server.java
java -cp "bin;sqlite-jdbc.jar;slf4j-simple.jar;slf4j-api.jar" com.todoapi.Server
```
> [!TIP]
> *The shared todo.db platform file will seamlessly auto-provision on its very first execution loop within any engine.*

## 🧠 Core Lessons Learned
1. **HTTP Trailing Slashes:** Navigating strict low-level URL prefixes across different runtime engines.
2. **JSON Serialization:** Overcoming the case-sensitivity mismatch between database `snake_case` fields and C# `PascalCase` objects.
3. **JVM Classpath Isolation:** Manually binding core interfaces (`slf4j-api`) and providers (`slf4j-simple`) to a raw compiled Java runtime via terminal execution flags.
# Java Native HttpServer Backend
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Java](https://img.shields.io/badge/Java-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-074D5B?style=for-the-badge&logo=sqlite&logoColor=white)

A zero-framework, low-level Java API server that handles manual HTTP routing and direct JDBC communication with the shared SQLite database.

---
## Tech Stack & Strategies
**Server Core:** `com.sun.net.httpserver.HttpServer` (Embedded JDK server)

**Database Driver:** SQLite JDBC (Java Database Connectivity)

**JSON Strategy:** Manual escaped string building for serialization, and custom Regular Expressions (Regex) for incoming payload deserialization to bypass third-party framework dependencies.

**Logging System:** SLF4J (Simple Logging Facade for Java) coupled with the `slf4j-simple` backend implementation to route database and server logs to the console window.

## Required Dependencies
To execute this server successfully without a heavy build tool like Maven or Gradle, the following `.jar` binaries must reside in your workspace directory:
* sqlite-jdbc.jar
* slf4j-api.jar
* slf4j-simple.jar

## Execution Commands
Execute these commands in your PowerShell terminal from within the `Backends/04-Java/` directory:

```powershell
javac -cp "sqlite-jdbc.jar" -d bin src/com/todoapi/Server.java

java -cp "bin;sqlite-jdbc.jar;slf4j-simple.jar;slf4j-api.jar" com.todoapi.Server
```
## API Behavior
**Network Host & Port:** `http://localhost:8000`

**CORS Policy:** Explicitly injects manual HTTP response headers (`Access-Control-Allow-Origin`, `Access-Control-Allow-Methods`, `Access-Control-Allow-Headers`) to authorize cross-origin browser traffic coming from your HTML frontend.

**Database Target:** Automatically resolves the parent pathway to write data inside the unified `Database/todo.db` space.
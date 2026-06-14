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
| **PHP** | `8000` | Native PDO | SQLite | Native Arrays |
| **Python** | `8000` | `http.server` | SQLite | Built-in `sqlite3` |
| **C#** | `8000` | `HttpListener` | SQLite | `Microsoft.Data.Sqlite` + Pascal Mapping |
| **Java** | `8000` | `HttpServer` | SQLite | Raw JDBC + Custom Regex Parser |

## 📁 Repository Structure
* `/Frontend` - Vanilla HTML, CSS, and JavaScript. Communicates with `http://localhost:8000/api/todos`.
* `/Database` - Shared location for the auto-generated `todo.db` file (Excluded from Git tracking).
* `/Backends` - Individual, zero-framework microservices isolated by language.
    * `/01-PHP`
    * `/02-Python`
    * `/03-CSharp`
    * `/04-Java`

## 🧠 Core Lessons Learned
1. **HTTP Trailing Slashes:** Navigating strict low-level URL prefixes across different runtime engines.
2. **JSON Serialization:** Overcoming the case-sensitivity mismatch between database `snake_case` fields and C# `PascalCase` objects.
3. **JVM Classpath Isolation:** Manually binding core interfaces (`slf4j-api`) and providers (`slf4j-simple`) to a raw compiled Java runtime via terminal execution flags.
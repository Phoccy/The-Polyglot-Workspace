# Python Raw http.server Backend
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-074D5B?style=for-the-badge&logo=sqlite&logoColor=white)

A minimal, boilerplate-free REST API backend built entirely using Python's standard library modules.

---
## Tech Stack & Strategies
**Server Core:** `http.server.BaseHTTPRequestHandler` and `http.server.HTTPServer`

**Database Driver:** Standard built-in `sqlite3` driver module

**JSON Strategy:** Native json parsing package (`json.loads()` and `json.dumps()`)

*Python translates JSON text inputs effortlessly into standard internal dictionaries.*

## Execution Commands

Execute this command in your PowerShell terminal from within the `Backends/02-Python/` directory:

```powershell
python server.py
```

## API Behavior
**Network Host & Port:** `http://localhost:8000`

**Routing Paradigm:** Implements custom class overrides on `do_GET()`, `do_POST()`, `do_PUT()`, and `do_DELETE()`. It scans incoming URL strings using string splits or matching utilities to extract resource records.

**Auto-Provisioning:** On initialization, the connection channel checks `../Database/todo.db`. If the database file isn't found, it executes a raw SQL statement string to create the necessary layout automatically.
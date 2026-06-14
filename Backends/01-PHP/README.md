# PHP Native Router Backend
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![PHP](https://img.shields.io/badge/PHP-777BB4?style=for-the-badge&logo=php&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-074D5B?style=for-the-badge&logo=sqlite&logoColor=white)

A high-velocity, lightweight web endpoint layer that serves as a direct web interface to the database without the weight of enterprise frameworks.

---
## Tech Stack & Strategies
**Server Core:** Built-in PHP Development Server Engine

**Database Driver:** PDO (PHP Data Objects) utilizing the `sqlite` extension driver

**JSON Strategy:** Built-in native conversion methods via `json_encode()` and `json_decode()`

*Data is converted dynamically to associative arrays, cutting down boilerplate code.*

## Execution Commands

Execute this command in your PowerShell terminal from within the `Backends/01-PHP/` directory:

```powershell
php -S localhost:8000 index.php
```

## API Behavior

**Network Host & Port:** `http://localhost:8000`

**Routing Paradigm:** Intercepts traffic via an explicit `index.php` front controller. It splits incoming requests by checking standard environment variables like `$_SERVER['REQUEST_URI']` and `$_SERVER['REQUEST_METHOD']`.

**State Management:** Fully synchronous processing. PHP instantiates a connection to `../../Database/todo.db`, handles the query statement, builds the HTTP response string, and instantly exits memory.
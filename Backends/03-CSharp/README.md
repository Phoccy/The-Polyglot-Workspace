# C# .NET Core Low-Level HttpListener Backend
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![C#](https://img.shields.io/badge/C%23-239120?style=for-the-badge&logo=c-sharp&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-074D5B?style=for-the-badge&logo=sqlite&logoColor=white)

A high-performance, strictly-typed API architecture constructed without the standard ASP.NET Web API or Minimal API scaffolding boilerplate.

---
## Tech Stack & Strategies
**Server Core:** `System.Net.HttpListener` asynchronously listening for system ports.

**Database Driver:** `Microsoft.Data.Sqlite` NuGet provider package.

**JSON Strategy:** Uses standard library text utilities (`System.Text.Json`)

*It maps data to Data Transfer Objects (DTOs) and addresses casing differences (like `snake_case` database fields matching up with native PascalCase `Property` names) using customized serializer configuration options.*

## Execution Commands

Execute these commands in your PowerShell terminal from within the `Backends/03-CSharp/` directory:

```powershell
dotnet build

dotnet run
```

## API Behavior
**Network Host & Port:** `http://localhost:8000/`

*(Requires a trailing slash configuration on the internal prefix binding array).*

**Routing Paradigm:** Runs a continuous asynchronous processing loop (`GetContextAsync()`). It extracts specific request contexts, verifies HTTP operations, and maps them to structural methods.

**Data Mapping Management:** Strictly checks incoming property payloads against strongly-typed structures, catching data inconsistencies before the database query is finalized.
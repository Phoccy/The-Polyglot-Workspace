/**
 * ==========================================================================
 * NATIVE FRONTIER STATE ENGINE (VANILLA ARCHITECTURE Baseline)
 * ==========================================================================
 */

// 1. Core Reactive Memory Store
const AppState = {
    todos: [],
    filter: 'all', // 'all' | 'active' | 'completed'
    isLoading: false,
    errorMessage: null
};

// 2. DOM Node Registry Hooks
const DOM = {
    form: document.getElementById('todoForm'),
    titleInput: document.getElementById('titleInput'),
    descInput: document.getElementById('descInput'),
    dateInput: document.getElementById('dateInput'),
    container: document.getElementById('todoContainer'),
    errorBanner: document.getElementById('errorBanner'),
    errorText: document.getElementById('errorMessageText'),
    closeErrorBtn: document.getElementById('closeErrorBtn'),
    filterButtons: document.querySelectorAll('.btn-filter')
};

// ==========================================================================
// CENTRAL APPLICATION RENDERING LOOP (The Single Source of Truth)
// ==========================================================================
function render() {
    // A. Error Management Pass
    if (AppState.errorMessage) {
        DOM.errorText.textContent = AppState.errorMessage;
        DOM.errorBanner.classList.remove('view-hidden');
    } else {
        DOM.errorBanner.classList.add('view-hidden');
    }

    // B. Loading Overlay Pass
    if (AppState.isLoading) {
        DOM.container.innerHTML = `<div class="status-info-text">Syncing operations payload with database stream...</div>`;
        return;
    }

    // C. Filter Implementation Pass
    const filteredTodos = AppState.todos.filter(todo => {
        if (AppState.filter === 'active') return todo.is_completed === 0;
        if (AppState.filter === 'completed') return todo.is_completed === 1;
        return true;
    });

    // D. Empty State Evaluation
    if (filteredTodos.length === 0) {
        DOM.container.innerHTML = `<div class="status-info-text">No active operational logs matched standard criteria.</div>`;
        return;
    }

    // E. Structural Compilation Pass (Virtual String Construction)
    let dynamicHTML = '';
    
    filteredTodos.forEach(todo => {
        const isDone = todo.is_completed === 1;
        
        // Format local date string context if present
        const dateTag = todo.due_date 
            ? `<span class="todo-meta">⏳ Due: ${new Date(todo.due_date).toLocaleString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>` 
            : '';

        dynamicHTML += `
            <div class="todo-item ${isDone ? 'state-completed' : ''}" data-id="${todo.id}">
                <input type="checkbox" class="todo-checkbox" ${isDone ? 'checked' : ''} data-action="toggle">
                <div class="todo-content">
                    <div class="todo-title">${escapeHTML(todo.title)}</div>
                    ${todo.description ? `<div class="todo-desc">${escapeHTML(todo.description)}</div>` : ''}
                    ${dateTag}
                </div>
                <button class="btn-delete" data-action="delete">✕</button>
            </div>
        `;
    });

    DOM.container.innerHTML = dynamicHTML;
}

// ==========================================================================
// CORE DATA OPERATIONS HANDLERS (Local Mock Engines for Phase 1)
// ==========================================================================

// // Mock Engine Actions: Swap seamlessly out later for asynchronous fetch chains
// const Actions = {
//     loadInitialData: () => {
//         AppState.isLoading = true;
//         render();
        
//         // Simulating mild structural database latency network stream
//         setTimeout(() => {
//             AppState.todos = [
//                 {
//                     id: 1718234501,
//                     title: "Establish Core Architecture Blueprint",
//                     description: "Complete loose configuration file variables for CSS layout validation.",
//                     is_completed: 1,
//                     due_date: "2026-06-15T12:00"
//                 },
//                 {
//                     id: 1718234502,
//                     title: "Debug State Management Machine Flow",
//                     description: "Trace data updates through pure memory mutation layers without third-party tools.",
//                     is_completed: 0,
//                     due_date: "2026-06-20T18:30"
//                 }
//             ];
//             AppState.isLoading = false;
//             render();
//         }, 600);
//     },

//     addTask: (title, description, dueDate) => {
//         const payload = {
//             id: Date.now(), // Transient localized baseline key identifier
//             title,
//             description,
//             due_date: dueDate || null,
//             is_completed: 0
//         };
        
//         AppState.todos.unshift(payload);
//         render();
//     },

//     toggleTask: (id) => {
//         const target = AppState.todos.find(item => item.id === id);
//         if (target) {
//             target.is_completed = target.is_completed === 1 ? 0 : 1;
//             render();
//         }
//     },

//     deleteTask: (id) => {
//         AppState.todos = AppState.todos.filter(item => item.id !== id);
//         render();
//     }
// };

// ==========================================================================
// CORE DATA OPERATIONS HANDLERS (Asynchronous Production REST Driver)
// ==========================================================================
const API_BASE_URL = "http://localhost:8000/api";

const Actions = {
    // GET: Fetch all operational tasks from active database engine
    loadInitialData: async () => {
        AppState.isLoading = true;
        AppState.errorMessage = null;
        render();
        
        try {
            const response = await fetch(`${API_BASE_URL}/todos`);
            
            if (!response.ok) {
                throw new Error(`HTTP Error Status context returned: ${response.status}`);
            }
            
            // Hydrate local AppState object layout with real database records
            AppState.todos = await response.json();
        } catch (error) {
            console.error("Fetch Engine Crash:", error);
            AppState.errorMessage = `Could not synchronize data matrix: ${error.message}`;
        } finally {
            AppState.isLoading = false;
            render();
        }
    },

    // POST: Transmit a fresh structural requirement payload down to server
    addTask: async (title, description, dueDate) => {
        AppState.errorMessage = null;
        
        const payload = {
            title: title,
            description: description || null,
            due_date: dueDate || null
        };
        
        try {
            const response = await fetch(`${API_BASE_URL}/todos`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            
            if (!response.ok) {
                throw new Error(`Server execution blocked with code: ${response.status}`);
            }
            
            const newTodo = await response.json();
            
            // Prepend the real database record directly to our local tracking state
            AppState.todos.unshift(newTodo);
            render();
        } catch (error) {
            console.error("Write Engine Failure:", error);
            AppState.errorMessage = `Failed to commit target: ${error.message}`;
            render();
        }
    },

    // PUT: Toggle active boolean state binaries on server variables
    toggleTask: async (id) => {
        AppState.errorMessage = null;
        
        // Find local object target data attributes reference
        const localTarget = AppState.todos.find(item => item.id === id);
        if (!localTarget) return;
        
        // Construct inverse toggle value parameters
        const updatedCompletedState = localTarget.is_completed === 1 ? 0 : 1;
        
        const payload = {
            title: localTarget.title,
            description: localTarget.description,
            due_date: localTarget.due_date,
            is_completed: updatedCompletedState
        };
        
        try {
            const response = await fetch(`${API_BASE_URL}/todos/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            
            if (!response.ok) {
                throw new Error(`Mutation engine blocked with status: ${response.status}`);
            }
            
            // Upon API server confirmation update local reactive client state directly
            localTarget.is_completed = updatedCompletedState;
            render();
        } catch (error) {
            console.error("State Mutation Crash:", error);
            AppState.errorMessage = `Could not update structural status flags: ${error.message}`;
            render();
        }
    },

    // DELETE: Issue strict destructive erasure target instructions to database context
    deleteTask: async (id) => {
        AppState.errorMessage = null;
        
        try {
            const response = await fetch(`${API_BASE_URL}/todos/${id}`, {
                method: 'DELETE'
            });
            
            if (!response.ok) {
                throw new Error(`Server database erasure failure code: ${response.status}`);
            }
            
            // Clean local AppState arrays memory immediately upon server verification
            AppState.todos = AppState.todos.filter(item => item.id !== id);
            render();
        } catch (error) {
            console.error("Erasure Operation Crash:", error);
            AppState.errorMessage = `Target removal script failure: ${error.message}`;
            render();
        }
    }
};

// ==========================================================================
// BINDINGS & COMPONENT ROUTING HANDLERS
// ==========================================================================

// Intercept Input Submissions
DOM.form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const title = DOM.titleInput.value.trim();
    const desc = DOM.descInput.value.trim();
    let date = DOM.dateInput.value;

    if (!title) return;

    Actions.addTask(title, desc, date);
    DOM.form.reset();
});

// Dynamic Delegation Node Target Routing Selector Pattern
// Hooks cleanly into structural elements without re-binding memory logic loops on every draw pass
DOM.container.addEventListener('click', (e) => {
    const targetNode = e.target;
    const action = targetNode.getAttribute('data-action');
    if (!action) return;

    const wrapperRow = targetNode.closest('.todo-item');
    const targetId = parseInt(wrapperRow.getAttribute('data-id'));

    if (action === 'toggle') {
        Actions.toggleTask(targetId);
    } else if (action === 'delete') {
        Actions.deleteTask(targetId);
    }
});

// Interface Filter Selection Logic
DOM.filterButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
        DOM.filterButtons.forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        
        AppState.filter = e.target.getAttribute('data-filter');
        render();
    });
});

// Structural Clear Event for Error Contexts
DOM.closeErrorBtn.addEventListener('click', () => {
    AppState.errorMessage = null;
    render();
});

// XSS Sanitizer Engine Utility Context
// function escapeHTML(str) {
//     return str.replace(/[&<>'"]/g, tag => ({
//         '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
//     }[tag] || tag));
// }
function escapeHTML(str) {
    // FIX: If the value is null, undefined, or missing, immediately return an empty string
    if (str === null || str === undefined) {
        return '';
    }
    
    // Force convert to string just in case it's a number, then clean it
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// System Startup Ignition Sequence Trace
Actions.loadInitialData();
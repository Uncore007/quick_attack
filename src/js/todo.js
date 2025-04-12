import { getLocalStorage, setLocalStorage, qs } from './utils.mjs';

class TodoModule {
  constructor() {
    this.todoList = qs('.todo ul');
    this.LOCAL_STORAGE_KEY = 'quick_attack_todos';
  }

  init() {
    // Load existing todos
    this.loadTodos();
    
    // Add the input field for new todos
    this.addTodoInput();
    
    // Add event listeners
    this.addEventListeners();
  }

  loadTodos() {
    const todos = getLocalStorage(this.LOCAL_STORAGE_KEY) || [];
    this.renderTodos(todos);
  }

  renderTodos(todos) {
    if (!this.todoList) return;
    
    if (todos.length === 0) {
      this.todoList.innerHTML = '<li class="empty-todo"><i class="fas fa-check" aria-hidden="true"></i> No tasks yet! Add one below.</li>';
      return;
    }
    
    this.todoList.innerHTML = todos.map(todo => `
      <li data-id="${todo.id}" class="${todo.completed ? 'completed' : ''}">
        <input 
          type="checkbox" 
          ${todo.completed ? 'checked' : ''} 
          aria-label="${todo.completed ? 'Mark as incomplete' : 'Mark as complete'}: ${todo.text}"
        >
        <span class="todo-text">${todo.text}</span>
        <button class="delete-todo" aria-label="Delete task: ${todo.text}">
          <i class="fas fa-times" aria-hidden="true"></i>
        </button>
      </li>
    `).join('');
  }

  addTodoInput() {
    const todoSection = qs('.todo');
    
    // Check if the input already exists
    if (qs('.todo-input-container', todoSection)) return;
    
    const inputContainer = document.createElement('div');
    inputContainer.className = 'todo-input-container';
    inputContainer.innerHTML = `
      <input 
        type="text" 
        class="todo-input" 
        placeholder="Add a new task..." 
        aria-label="Enter a new task"
      >
      <button class="add-todo" aria-label="Add task">
        <i class="fas fa-plus" aria-hidden="true"></i>
      </button>
    `;
    
    todoSection.appendChild(inputContainer);
  }

  addEventListeners() {
    // Add event listener for the add button
    const addButton = qs('.add-todo');
    if (addButton) {
      addButton.addEventListener('click', () => this.addTodo());
    }
    
    // Add event listener for the input field (pressing Enter)
    const inputField = qs('.todo-input');
    if (inputField) {
      inputField.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          this.addTodo();
        }
      });
    }
    
    // Add event delegation for checkboxes and delete buttons
    if (this.todoList) {
      this.todoList.addEventListener('click', (e) => {
        const li = e.target.closest('li');
        if (!li) return;
        
        const id = parseInt(li.dataset.id);
        
        // Handle checkbox clicks
        if (e.target.type === 'checkbox') {
          this.toggleTodoComplete(id);
        }
        
        // Handle delete button clicks
        if (e.target.closest('.delete-todo')) {
          this.deleteTodo(id);
        }
      });
    }
  }

  addTodo() {
    const inputField = qs('.todo-input');
    if (!inputField) return;
    
    const text = inputField.value.trim();
    if (!text) return;
    
    const todos = getLocalStorage(this.LOCAL_STORAGE_KEY) || [];
    
    const newTodo = {
      id: Date.now(),
      text: text,
      completed: false
    };
    
    todos.push(newTodo);
    setLocalStorage(this.LOCAL_STORAGE_KEY, todos);
    
    // Clear the input field
    inputField.value = '';
    
    // Re-render the todo list
    this.renderTodos(todos);
    
    // Show a notification for accessibility
    this.announceForScreenReader(`Task added: ${text}`);
  }

  toggleTodoComplete(id) {
    const todos = getLocalStorage(this.LOCAL_STORAGE_KEY) || [];
    let updatedText = '';
    
    const updatedTodos = todos.map(todo => {
      if (todo.id === id) {
        updatedText = todo.text;
        return { ...todo, completed: !todo.completed };
      }
      return todo;
    });
    
    setLocalStorage(this.LOCAL_STORAGE_KEY, updatedTodos);
    this.renderTodos(updatedTodos);
    
    // Find the updated todo to check completion status
    const updatedTodo = updatedTodos.find(todo => todo.id === id);
    // Announce the status change for screen readers
    this.announceForScreenReader(
      `Task "${updatedText}" marked as ${updatedTodo.completed ? 'completed' : 'incomplete'}`
    );
  }

  deleteTodo(id) {
    const todos = getLocalStorage(this.LOCAL_STORAGE_KEY) || [];
    
    // Find the text before deleting
    const todoToDelete = todos.find(todo => todo.id === id);
    const deletedText = todoToDelete ? todoToDelete.text : '';
    
    const updatedTodos = todos.filter(todo => todo.id !== id);
    
    setLocalStorage(this.LOCAL_STORAGE_KEY, updatedTodos);
    this.renderTodos(updatedTodos);
    
    // Announce deletion for screen readers
    this.announceForScreenReader(`Task deleted: ${deletedText}`);
  }
  
  announceForScreenReader(message) {
    // Create an aria-live region if it doesn't exist
    let announcer = document.getElementById('sr-announcer');
    
    if (!announcer) {
      announcer = document.createElement('div');
      announcer.id = 'sr-announcer';
      announcer.setAttribute('aria-live', 'polite');
      announcer.setAttribute('aria-atomic', 'true');
      announcer.classList.add('sr-only');
      document.body.appendChild(announcer);
    }
    
    // Set the message
    announcer.textContent = message;
    
    // Clear the announcer after a delay
    setTimeout(() => {
      announcer.textContent = '';
    }, 3000);
  }
}

function initTodo() {
  const todoModule = new TodoModule();
  todoModule.init();
}

export { initTodo };
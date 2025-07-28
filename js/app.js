// DOM Elements
const todoInput = document.getElementById('todo-input');
const addButton = document.getElementById('add-button');
const todoList = document.querySelector('.todo-list');
const filterButtons = document.querySelectorAll('.filter-buttons button');
const clearCompletedButton = document.getElementById('clear-completed');
const tasksCount = document.getElementById('tasks-count');
const themeToggle = document.querySelector('.theme-toggle');

// App State
let todos = JSON.parse(localStorage.getItem('vikram-todos')) || [];
let currentFilter = 'all';

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadTheme();
    renderTodos();
    updateTasksCount();
});

// Theme Toggle
themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-theme');
    localStorage.setItem('vikram-dark-theme', document.body.classList.contains('dark-theme'));
});

function loadTheme() {
    if (localStorage.getItem('vikram-dark-theme') === 'true') {
        document.body.classList.add('dark-theme');
    }
}

// Event Listeners
addButton.addEventListener('click', addTodo);
todoInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addTodo();
    }
});

clearCompletedButton.addEventListener('click', clearCompleted);

filterButtons.forEach(button => {
    button.addEventListener('click', () => {
        // Remove active class from all buttons
        filterButtons.forEach(btn => btn.classList.remove('active'));
        // Add active class to clicked button
        button.classList.add('active');
        
        currentFilter = button.getAttribute('data-filter');
        renderTodos();
    });
});

// Functions
function addTodo() {
    const todoText = todoInput.value.trim();
    
    if (todoText === '') return;
    
    const newTodo = {
        id: Date.now(),
        text: todoText,
        completed: false,
        createdAt: new Date()
    };
    
    todos.push(newTodo);
    saveTodos();
    renderTodos();
    updateTasksCount();
    
    todoInput.value = '';
    todoInput.focus();
}

function toggleTodo(id) {
    todos = todos.map(todo => {
        if (todo.id === id) {
            return { ...todo, completed: !todo.completed };
        }
        return todo;
    });
    
    saveTodos();
    renderTodos();
    updateTasksCount();
}

function deleteTodo(id) {
    todos = todos.filter(todo => todo.id !== id);
    saveTodos();
    renderTodos();
    updateTasksCount();
}

function clearCompleted() {
    todos = todos.filter(todo => !todo.completed);
    saveTodos();
    renderTodos();
    updateTasksCount();
}

function saveTodos() {
    localStorage.setItem('vikram-todos', JSON.stringify(todos));
}

function updateTasksCount() {
    const activeTodos = todos.filter(todo => !todo.completed).length;
    tasksCount.textContent = `${activeTodos} task${activeTodos !== 1 ? 's' : ''} left`;
}

function renderTodos() {
    // Clear the list
    todoList.innerHTML = '';
    
    // Filter todos based on current filter
    let filteredTodos = todos;
    if (currentFilter === 'pending') {
        filteredTodos = todos.filter(todo => !todo.completed);
    } else if (currentFilter === 'completed') {
        filteredTodos = todos.filter(todo => todo.completed);
    }
    
    // Sort todos by creation date (newest first)
    filteredTodos.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    // Create todo items
    if (filteredTodos.length === 0) {
        const emptyMessage = document.createElement('li');
        emptyMessage.textContent = currentFilter === 'all' 
            ? 'Your todo list is empty!' 
            : `No ${currentFilter} tasks found.`;
        emptyMessage.style.justifyContent = 'center';
        emptyMessage.style.color = '#9495a5';
        todoList.appendChild(emptyMessage);
        return;
    }
    
    filteredTodos.forEach(todo => {
        const li = document.createElement('li');
        if (todo.completed) {
            li.classList.add('completed');
        }
        
        const todoCheck = document.createElement('div');
        todoCheck.classList.add('todo-check');
        todoCheck.innerHTML = '<i class="fas fa-check"></i>';
        todoCheck.addEventListener('click', () => toggleTodo(todo.id));
        
        const todoText = document.createElement('div');
        todoText.classList.add('todo-text');
        todoText.textContent = todo.text;
        todoText.addEventListener('click', () => toggleTodo(todo.id));
        
        const deleteButton = document.createElement('button');
        deleteButton.classList.add('delete-button');
        deleteButton.innerHTML = '<i class="fas fa-times"></i>';
        deleteButton.addEventListener('click', () => deleteTodo(todo.id));
        
        li.appendChild(todoCheck);
        li.appendChild(todoText);
        li.appendChild(deleteButton);
        
        todoList.appendChild(li);
    });
}

// Add drag and drop functionality
let draggedItem = null;

function setupDragAndDrop() {
    const items = document.querySelectorAll('.todo-list li');
    
    items.forEach(item => {
        item.setAttribute('draggable', 'true');
        
        item.addEventListener('dragstart', function() {
            draggedItem = this;
            setTimeout(() => this.style.opacity = '0.5', 0);
        });
        
        item.addEventListener('dragend', function() {
            draggedItem = null;
            this.style.opacity = '1';
        });
        
        item.addEventListener('dragover', function(e) {
            e.preventDefault();
        });
        
        item.addEventListener('dragenter', function(e) {
            e.preventDefault();
            this.style.backgroundColor = 'rgba(0, 0, 0, 0.05)';
        });
        
        item.addEventListener('dragleave', function() {
            this.style.backgroundColor = '';
        });
        
        item.addEventListener('drop', function(e) {
            e.preventDefault();
            this.style.backgroundColor = '';
            
            if (this !== draggedItem) {
                // Get the index of the dragged item
                const draggedIndex = Array.from(todoList.children).indexOf(draggedItem);
                // Get the index of the drop target
                const targetIndex = Array.from(todoList.children).indexOf(this);
                
                // Reorder the todos array
                const movedTodo = todos.splice(draggedIndex, 1)[0];
                todos.splice(targetIndex, 0, movedTodo);
                
                saveTodos();
                renderTodos();
            }
        });
    });
}

// Every time we render, set up drag and drop
const originalRenderTodos = renderTodos;
renderTodos = function() {
    originalRenderTodos();
    setupDragAndDrop();
};
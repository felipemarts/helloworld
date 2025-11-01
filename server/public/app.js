// Task List Application - Frontend JavaScript

class TaskListApp {
    constructor() {
        this.taskForm = document.getElementById('taskForm');
        this.tasksList = document.getElementById('tasksList');
        this.loadingState = document.getElementById('loadingState');
        this.emptyState = document.getElementById('emptyState');
        this.taskTitleInput = document.getElementById('taskTitle');
        this.taskDescriptionInput = document.getElementById('taskDescription');

        this.init();
    }

    init() {
        // Event listeners
        this.taskForm.addEventListener('submit', (e) => this.handleAddTask(e));
        
        // Load tasks on startup
        this.loadTasks();
    }

    async loadTasks() {
        try {
            this.showLoading();
            const response = await fetch('/api/tasks');
            
            if (!response.ok) {
                throw new Error('Failed to load tasks');
            }

            const tasks = await response.json();
            this.renderTasks(tasks);
        } catch (error) {
            console.error('Error loading tasks:', error);
            alert('Erro ao carregar tarefas: ' + error.message);
        }
    }

    async handleAddTask(e) {
        e.preventDefault();

        const title = this.taskTitleInput.value.trim();
        const description = this.taskDescriptionInput.value.trim();

        if (!title) {
            alert('Por favor, insira um título para a tarefa');
            return;
        }

        try {
            const response = await fetch('/api/tasks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ title, description })
            });

            if (!response.ok) {
                throw new Error('Failed to create task');
            }

            // Clear form
            this.taskTitleInput.value = '';
            this.taskDescriptionInput.value = '';

            // Reload tasks
            await this.loadTasks();
        } catch (error) {
            console.error('Error adding task:', error);
            alert('Erro ao adicionar tarefa: ' + error.message);
        }
    }

    async toggleTask(id, currentStatus) {
        try {
            const response = await fetch(`/api/tasks/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ completed: !currentStatus })
            });

            if (!response.ok) {
                throw new Error('Failed to update task');
            }

            // Reload tasks
            await this.loadTasks();
        } catch (error) {
            console.error('Error toggling task:', error);
            alert('Erro ao atualizar tarefa: ' + error.message);
        }
    }

    async deleteTask(id) {
        if (!confirm('Tem certeza que deseja excluir esta tarefa?')) {
            return;
        }

        try {
            const response = await fetch(`/api/tasks/${id}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error('Failed to delete task');
            }

            // Reload tasks
            await this.loadTasks();
        } catch (error) {
            console.error('Error deleting task:', error);
            alert('Erro ao excluir tarefa: ' + error.message);
        }
    }

    renderTasks(tasks) {
        this.hideLoading();

        if (tasks.length === 0) {
            this.showEmptyState();
            return;
        }

        this.hideEmptyState();

        // Sort tasks: incomplete first, then by creation date (newest first)
        tasks.sort((a, b) => {
            if (a.completed !== b.completed) {
                return a.completed ? 1 : -1;
            }
            return new Date(b.createdAt) - new Date(a.createdAt);
        });

        this.tasksList.innerHTML = tasks.map(task => this.createTaskHTML(task)).join('');

        // Add event listeners to buttons
        tasks.forEach(task => {
            const toggleBtn = document.querySelector(`[data-toggle-id="${task.id}"]`);
            const deleteBtn = document.querySelector(`[data-delete-id="${task.id}"]`);

            if (toggleBtn) {
                toggleBtn.addEventListener('click', () => this.toggleTask(task.id, task.completed));
            }

            if (deleteBtn) {
                deleteBtn.addEventListener('click', () => this.deleteTask(task.id));
            }
        });
    }

    createTaskHTML(task) {
        const completedClass = task.completed ? 'completed' : '';
        const toggleText = task.completed ? '↩ Reabrir' : '✓ Concluir';
        
        return `
            <li class="task-item ${completedClass}">
                <div class="task-header">
                    <div class="task-title">${this.escapeHTML(task.title)}</div>
                </div>
                ${task.description ? `<div class="task-description">${this.escapeHTML(task.description)}</div>` : ''}
                <div class="task-actions">
                    <button class="btn-small btn-toggle" data-toggle-id="${task.id}">
                        ${toggleText}
                    </button>
                    <button class="btn-small btn-delete" data-delete-id="${task.id}">
                        🗑 Excluir
                    </button>
                </div>
            </li>
        `;
    }

    escapeHTML(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    showLoading() {
        this.loadingState.style.display = 'block';
        this.tasksList.style.display = 'none';
        this.emptyState.style.display = 'none';
    }

    hideLoading() {
        this.loadingState.style.display = 'none';
        this.tasksList.style.display = 'block';
    }

    showEmptyState() {
        this.tasksList.style.display = 'none';
        this.emptyState.style.display = 'block';
    }

    hideEmptyState() {
        this.emptyState.style.display = 'none';
        this.tasksList.style.display = 'block';
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TaskListApp();
});

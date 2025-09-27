import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DragDropModule, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, NgFor, NgIf, DragDropModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  tasks: any[] = [];
  newTask = { title: '', description: '', category: 'Work' };
  editingTaskId: number | null = null;
  editedTask: any = null;
  errorMessage: string | null = null;

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {
    const token = localStorage.getItem('token');
    if (!token) {
      this.router.navigate(['/auth/login']);
      return;
    }
    this.loadTasks();
  }

  loadTasks() {
    const token = localStorage.getItem('token');
    if (!token) return;

    this.http.get<any[]>('/api/tasks', {
      headers: { Authorization: `Bearer ${token}` },
    }).subscribe({
      next: (data) => (this.tasks = data),
      error: () => (this.errorMessage = 'Failed to load tasks'),
    });
  }

  createTask() {
    const token = localStorage.getItem('token');
    if (!token) return;

    this.http.post('/api/tasks', this.newTask, {
      headers: { Authorization: `Bearer ${token}` },
    }).subscribe({
      next: (task: any) => {
        this.tasks.push(task);
        this.newTask = { title: '', description: '', category: 'Work' };
      },
      error: () => (this.errorMessage = 'Task creation failed'),
    });
  }

  startEdit(task: any) {
    this.editingTaskId = task.id;
    this.editedTask = { ...task };
  }

  cancelEdit() {
    this.editingTaskId = null;
    this.editedTask = null;
  }

  saveEdit() {
    const token = localStorage.getItem('token');
    if (!token || !this.editedTask) return;

    this.http.put(`/api/tasks/${this.editedTask.id}`, this.editedTask, {
      headers: { Authorization: `Bearer ${token}` },
    }).subscribe({
      next: (updated: any) => {
        const idx = this.tasks.findIndex((t) => t.id === updated.id);
        if (idx !== -1) this.tasks[idx] = updated;
        this.cancelEdit();
      },
      error: () => (this.errorMessage = 'Update failed'),
    });
  }

  deleteTask(id: number) {
    const token = localStorage.getItem('token');
    if (!token) return;

    this.http.delete(`/api/tasks/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    }).subscribe({
      next: () => {
        this.tasks = this.tasks.filter((t) => t.id !== id);
      },
      error: () => (this.errorMessage = 'Delete failed'),
    });
  }

  drop(event: CdkDragDrop<any[]>) {
    moveItemInArray(this.tasks, event.previousIndex, event.currentIndex);
    // Optional: Call API to persist order if needed
  }
}

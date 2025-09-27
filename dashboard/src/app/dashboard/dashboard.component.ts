import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, NgFor, NgIf],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  tasks: any[] = [];
  newTask = { title: '', description: '', category: 'Work' };

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {
    const token = localStorage.getItem('token');
    if (!token) {
      this.router.navigate(['/auth/login']);
      return;
    }

    this.http.get<any[]>('/api/tasks', {
      headers: { Authorization: `Bearer ${token}` },
    }).subscribe({
      next: (data) => this.tasks = data,
      error: (err) => console.error('Failed to load tasks', err),
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
        this.newTask = { title: '', description: '', category: 'Work' }; // reset
      },
      error: (err) => console.error('Task creation failed', err),
    });
  }
}

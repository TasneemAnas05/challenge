import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ApiService } from './services/api.service';
import { DashboardSummary } from './models/dashboard-summary.interface';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  summary: DashboardSummary | null = null;

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.api.getDashboardSummary().subscribe({
      next: (data) => {
        console.log('Success! Data received:', data);
        this.summary = data;
      },
      error: (err) => console.error('Connection failed:', err)
    });
  }
}
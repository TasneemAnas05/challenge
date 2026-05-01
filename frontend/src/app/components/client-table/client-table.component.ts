import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router'; 
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { ClientService } from '../../services/client.service';
import { Client } from '../../models/client.interface';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-client-table',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, LucideAngularModule],
  templateUrl: './client-table.component.html'
})
export class ClientTableComponent implements OnInit {
  private _searchTerm: string = '';
  clients: Client[] = [];
  filteredClients: Client[] = [];

  get searchTerm(): string {
    return this._searchTerm;
  }

  set searchTerm(value: string) {
    this._searchTerm = value;
    this.filterClients();
  }

  constructor(private clientService: ClientService) {}

  ngOnInit(): void {
   this.clientService.clients$.subscribe(data => {
    this.clients = data || [];
    this.filterClients(); // Ensure filter applies to the newly fetched data
    console.log('Data received in component:', data); 
  });

    // Always fetch clients from DB when entering the page to ensure we see the whole list.
    this.loadClients();
  }

  loadClients(): void {
    console.log('Fetching all clients from DB...');
    this.clientService.loadClients(); // Fetch all without passing a search term
  }

  filterClients(): void {
    const term = this._searchTerm.toLowerCase().trim();
    if (!term) {
      this.filteredClients = [...this.clients];
    } else {
      this.filteredClients = this.clients.filter(client => 
        client.name?.toLowerCase().includes(term) ||
        client.email?.toLowerCase().includes(term) ||
        client.company?.toLowerCase().includes(term) ||
        client.address?.toLowerCase().includes(term)
      );
    }
  }
}
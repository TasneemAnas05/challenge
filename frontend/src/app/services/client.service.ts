import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Client } from '../models/client.interface';

@Injectable({
  providedIn: 'root'
})
export class ClientService {
  private apiUrl = 'http://localhost:8000/api/clients';

  private clientsSource = new BehaviorSubject<Client[]>([]);
  clients$ = this.clientsSource.asObservable();

  constructor(private http: HttpClient) {}

  loadClients(): void {
    this.http.get<any>(this.apiUrl).subscribe({
      next: (data) => {
        const clientsArray = Array.isArray(data) ? data : (data['hydra:member'] || []);
        this.clientsSource.next(clientsArray.reverse());
      },
      error: (err) => console.error('Failed to load clients', err)
    });
  }

  createClient(clientData: Partial<Client>): Observable<Client> {
    return this.http.post<Client>(this.apiUrl, clientData).pipe(
      tap((newClient) => {
        const current = this.clientsSource.value;
        this.clientsSource.next([newClient, ...current]);
      })
    );
  }

  bulkCreateClients(clients: Partial<Client>[]): Observable<{ importedCount: number, importedClients: Client[] }> {
    return this.http.post<{ importedCount: number, importedClients: Client[] }>(`${this.apiUrl}/bulk`, { clients }).pipe(
      tap((response) => {
        const current = this.clientsSource.value;
        this.clientsSource.next([...response.importedClients.reverse(), ...current]);
      })
    );
  }

  deleteClient(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        const current = this.clientsSource.value;
        this.clientsSource.next(current.filter(client => client.id !== id));
      })
    );
  }
}
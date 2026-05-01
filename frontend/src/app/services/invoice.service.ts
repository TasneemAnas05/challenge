import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Invoice } from '../models/invoice.interface';

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {
  private apiUrl = 'http://localhost:8000/api/invoices';
  
  private invoicesSource = new BehaviorSubject<Invoice[]>([]);
  invoices$ = this.invoicesSource.asObservable();

  constructor(private http: HttpClient) {}

  loadInvoices(): void {
    this.http.get<any>(this.apiUrl).subscribe({
      next: (data) => {
        const invoicesArray = Array.isArray(data) ? data : (data['hydra:member'] || []);
        this.invoicesSource.next(invoicesArray.reverse());
      },
      error: (err) => console.error('Failed to load invoices', err)
    });
  }

  createInvoice(invoiceData: Partial<Invoice>): Observable<Invoice> {
    return this.http.post<Invoice>(this.apiUrl, invoiceData).pipe(
      tap((newInv) => {
        const current = this.invoicesSource.value;
        this.invoicesSource.next([newInv, ...current]);
      })
    );
  }

  bulkCreateInvoices(invoices: Partial<Invoice>[]): Observable<{ importedCount: number, importedInvoices: Invoice[] }> {
    return this.http.post<{ importedCount: number, importedInvoices: Invoice[] }>(`${this.apiUrl}/bulk`, { invoices }).pipe(
      tap((response) => {
        const current = this.invoicesSource.value;
        this.invoicesSource.next([...response.importedInvoices.reverse(), ...current]);
      })
    );
  }

  deleteInvoice(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        const current = this.invoicesSource.value;
        this.invoicesSource.next(current.filter(inv => inv.id !== id));
      })
    );
  }
}
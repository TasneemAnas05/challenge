import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import * as Papa from 'papaparse';

import { InvoiceService } from '../../services/invoice.service';
import { ClientService } from '../../services/client.service';
import { Invoice } from '../../models/invoice.interface';
import { Client } from '../../models/client.interface';

@Component({
  selector: 'app-bulk-import',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './bulk-import.component.html',
})
export class BulkImportComponent implements OnInit, OnDestroy {
  isDragging = false;
  selectedFile: File | null = null;
  isUploading = false;
  uploadMessage: string | null = null;
  isError = false;
  importType: 'clients' | 'invoices' = 'clients';
  importedInvoices: Invoice[] = [];
  importedClients: Client[] = [];
  clients: Client[] = [];

  private destroy$ = new Subject<void>();

  constructor(
    private invoiceService: InvoiceService,
    private clientService: ClientService
  ) {}

  ngOnInit(): void {
    this.clientService.clients$.pipe(takeUntil(this.destroy$)).subscribe(clients => {
      this.clients = clients;
    });
    this.clientService.loadClients();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  setImportType(type: 'clients' | 'invoices'): void {
    this.importType = type;
    this.clearSelection();
  }

  onFileSelected(event: any): void {
    const files = event.dataTransfer ? event.dataTransfer.files : event.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      this.clearSelection();
      this.selectedFile = file;

      if (event.target && event.target.value) {
        event.target.value = ''; // Reset input value to allow selecting the same file again
      }
    }
  }

  clearSelection(): void {
    this.selectedFile = null;
    this.uploadMessage = null;
    this.isError = false;
    this.importedInvoices = [];
    this.importedClients = [];
  }

  getTemplateUrl(): string {
    if (this.importType === 'clients') {
      return '/assets/templates/clients-template.csv';
    }
    return '/assets/templates/invoices-template.csv';
  }

  onUpload(): void {
    if (!this.selectedFile) return;

    this.isUploading = true;
    this.uploadMessage = null;
    this.isError = false;

    Papa.parse(this.selectedFile as File, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        if (this.importType === 'clients') {
          this.handleClientImport(result.data);
        } else {
          this.handleInvoiceImport(result.data);
        }
      },
      error: (error) => {
        this.isUploading = false;
        this.isError = true;
        this.uploadMessage = `CSV parsing error: ${error.message}`;
      }
    });
  }

  private handleClientImport(data: any[]): void {
    const clientsToCreate: Partial<Client>[] = data.map(item => ({
        name: item.name,
        email: item.email,
        phone: item.phone,
        address: item.address
    }));

    this.clientService.bulkCreateClients(clientsToCreate).subscribe({
      next: (response) => {
        this.isUploading = false;
        this.isError = false;
        this.uploadMessage = `Successfully imported ${response.importedCount} clients.`;
        this.importedClients = response.importedClients || [];
      },
      error: (err) => {
        this.isUploading = false;
        this.isError = true;
        this.uploadMessage = `Error importing clients: ${err.error?.message || err.message}`;
      }
    });
  }

  private handleInvoiceImport(data: any[]): void {
    try {
      const invoices: Partial<Invoice>[] = data.map(item => {
        let items: any[] = [];
        if (item.items) {
          items = typeof item.items === 'string' ? JSON.parse(item.items) : item.items;
        }
        return {
          invoiceNumber: item.invoiceNumber,
          invoiceDate: item.invoiceDate,
          dueDate: item.dueDate,
          clientId: Number(item.clientId),
          status: item.status,
          items: items
        };
      });

      this.invoiceService.bulkCreateInvoices(invoices).subscribe({
        next: (response) => {
          this.isUploading = false;
          this.isError = false;
          this.uploadMessage = `Successfully imported ${response.importedCount} invoices.`;
          this.importedInvoices = response.importedInvoices || [];
        },
        error: (err) => {
          this.isUploading = false;
          this.isError = true;
          this.uploadMessage = `Error importing invoices: ${err.error?.message || err.message}`;
        }
      });
    } catch (e: any) {
      this.isUploading = false;
      this.isError = true;
      this.uploadMessage = `Error parsing invoice items: ${e.message}`;
    }
  }
  
  getClientName(clientId: number | undefined): string {
    if (clientId === undefined) return 'N/A';
    const client = this.clients.find(c => c.id === clientId);
    return client ? client.name : 'Unknown Client';
  }
}
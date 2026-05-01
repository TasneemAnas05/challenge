import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { InvoiceService } from '../../services/invoice.service';
import { Invoice } from '../../models/invoice.interface';

@Component({
  selector: 'app-invoice-list',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideAngularModule],
  templateUrl: './invoice-list.component.html'
})
export class InvoiceListComponent implements OnInit {
  invoices: Invoice[] = [];

  constructor(private invoiceService: InvoiceService) {}

  ngOnInit(): void {
    this.invoiceService.invoices$.subscribe(data => {
      this.invoices = data;
    });
    this.invoiceService.loadInvoices();
  }

  deleteInvoice(id: number | undefined): void {
    if (id !== undefined && confirm('Are you sure you want to delete this invoice?')) {
      this.invoiceService.deleteInvoice(id).subscribe(() => {
        this.invoiceService.loadInvoices(); 
      });
    }
  }
}
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { ClientService } from '../../services/client.service';
import { InvoiceService } from '../../services/invoice.service';
import { Client } from '../../models/client.interface';

@Component({
  selector: 'app-invoice-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './invoice-form.component.html'
})
export class InvoiceFormComponent implements OnInit, OnDestroy {
  invoiceForm: FormGroup;
  clients: Client[] = [];

  subtotal: number = 0;
  taxAmount: number = 0;
  totalAmount: number = 0;
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private clientService: ClientService,
    private invoiceService: InvoiceService,
    private router: Router
  ) {
    this.invoiceForm = this.fb.group({
      invoiceNumber: ['', Validators.required],
      invoiceDate: [new Date().toISOString().split('T')[0], Validators.required],
      clientId: ['', Validators.required],
      dueDate: ['', Validators.required],
      status: ['Draft', Validators.required],
      items: this.fb.array([this.createItem()])
    });
  }

  ngOnInit(): void {
    this.clientService.clients$.pipe(takeUntil(this.destroy$)).subscribe(data => {
      this.clients = data;
    });
    this.clientService.loadClients();

    this.invoiceForm.get('items')?.valueChanges.pipe(
      takeUntil(this.destroy$)
    ).subscribe(items => this.calculateTotals(items));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get items(): FormArray {
    return this.invoiceForm.get('items') as FormArray;
  }

  createItem(): FormGroup {
    return this.fb.group({
      description: ['', Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
      unitPrice: [0, [Validators.required, Validators.min(0)]],
      vatRate: [10] // Sends fixed 10% tax to the backend
    });
  }

  addItem(): void {
    this.items.push(this.createItem());
  }

  removeItem(index: number): void {
    this.items.removeAt(index);
  }

  calculateTotals(items: any[]): void {
    this.subtotal = items.reduce((acc, item) => {
      const qty = item.quantity || 0;
      const price = item.unitPrice || 0;
      return acc + (qty * price);
    }, 0);

    this.taxAmount = this.subtotal * 0.10; 
    this.totalAmount = this.subtotal + this.taxAmount;
  }

  onSubmit(): void {
    if (this.invoiceForm.valid) {
      const payload = { ...this.invoiceForm.value };
      payload.clientId = Number(payload.clientId); 
      
      this.invoiceService.createInvoice(payload).subscribe({
        next: () => {
          this.router.navigate(['/invoices']); 
        },
        error: (err) => {
          console.error('Error saving invoice:', err);
          alert('Failed to create the invoice. Check console for details.');
        }
      });
    } else {
      this.invoiceForm.markAllAsTouched();
      alert('Please fill out all required fields (e.g., Client, Invoice Number, and Item Descriptions).');
    }
  }
}
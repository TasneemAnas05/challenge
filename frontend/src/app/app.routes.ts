import { Routes } from '@angular/router';
import { ClientTableComponent } from './components/client-table/client-table.component';
import { ClientFormComponent } from './components/client-form/client-form.component';
import { InvoiceListComponent } from './components/invoice-list/invoice-list.component';
import { InvoiceFormComponent } from './components/invoice-form/invoice-form.component';
import { BulkImportComponent } from './components/bulk-import/bulk-import.component';

export const routes: Routes = [
  { path: 'clients', component: ClientTableComponent },
  { path: 'clients/new', component: ClientFormComponent },
  { path: 'invoices', component: InvoiceListComponent },
  { path: 'invoices/new', component: InvoiceFormComponent },
  { path: 'import', component: BulkImportComponent },
  { path: '', redirectTo: 'clients', pathMatch: 'full' }
];
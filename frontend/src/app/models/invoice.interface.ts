import { Client } from './client.interface';
import { InvoiceItem } from './invoice-item.interface';

export interface Invoice {
  id?: number;
  invoiceNumber: string;
  status: string;
  totalAmountNet: string | number;
  totalAmountVat: string | number;
  totalAmountGross: string | number;
  invoiceDate: string | Date;
  dueDate: string | Date;
  client?: Client;
  clientId?: number;
  items?: InvoiceItem[];
}
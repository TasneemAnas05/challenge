export interface InvoiceItem {
  id?: number;
  description: string;
  quantity: number;
  unitPrice: number;
  vatRate?: number;
  totalLineNet?: string | number;
}
export enum TableStatus {
  Available = 'Disponível',
  Occupied = 'Ocupada',
  Closing = 'Fechando',
}

export interface Table {
  id: string;
  name: string;
  status: TableStatus;
  orderId: string | null;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
}

export interface Order {
  id: string;
  tableId: string;
  items: OrderItem[];
  total: number;
  waiterId: string;
  createdAt: Date;
  closedAt?: Date;
  paymentMethod?: string;
  status: 'open' | 'closed';
}

export interface Waiter {
  id: string;
  name: string;
}

export interface PaymentMethod {
    id: string;
    name: string;
    enabled: boolean;
}

export enum ReportType {
    Sales = 'Vendas',
    Products = 'Produtos',
    Commissions = 'Comissões'
}
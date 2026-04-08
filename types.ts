
export enum OrderStatus {
  EMITTED = 'Emitido',
  PAID = 'Pago'
}

export interface Client {
  id: string;
  name: string;
  cpf_cnpj?: string;
  address?: string;
  email?: string;
  phone?: string;
}

export interface Product {
  id: string;
  code: string;
  name: string;
  unit: string;
  defaultPrice?: number;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  unit: string;
  price: number;
  quantity: number;
  total: number;
}

export interface Order {
  id: string;
  number: number;
  date: string;
  time: string;
  paymentDate?: string;
  paymentTime?: string;
  clientId: string;
  clientName: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  total: number;
  observations: string;
  status: OrderStatus;
}

export interface CompanyConfig {
  name: string;
  subtitle: string;
  cnpj: string;
  address: string;
  phone: string;
  footerMsg: string;
  logo?: string;
}

export type View = 'LOGIN' | 'ORDER_FORM' | 'ORDER_HISTORY' | 'CLIENT_MANAGEMENT' | 'PRODUCT_MANAGEMENT' | 'COMPANY_SETTINGS';

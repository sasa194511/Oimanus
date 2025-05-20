// Definição de tipos para o sistema de estoque
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  avatar?: string;
}

export interface Item {
  id: string;
  name: string;
  description?: string;
  category: string;
  quantity: number;
  minQuantity: number;
  price: number;
  location?: string;
  lastUpdated: string;
  createdAt: string;
}

export interface Transaction {
  id: string;
  itemId: string;
  itemName: string;
  type: 'add' | 'remove' | 'update' | 'delete';
  quantity: number;
  previousQuantity?: number;
  date: string;
  user: string;
  notes?: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
}

export interface DashboardStats {
  totalItems: number;
  totalValue: number;
  lowStockItems: number;
  categories: number;
}

export interface ChartData {
  name: string;
  value: number;
}

export interface TransactionHistoryData {
  date: string;
  entradas: number;
  saídas: number;
}

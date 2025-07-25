// Tipos comuns utilizados em toda a aplicação

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface Transaction {
  id: string;
  amount: number;
  category_id: string;
  description: string;
  date: string;
  responsible_name: string;
}

export interface Category {
  id: string;
  name: string;
  icon?: string;
}

export interface DashboardSummary {
  totalBalance: number;
  income: number;
  expenses: number;
  recentTransactions: Transaction[];
}
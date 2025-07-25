import { create } from 'zustand';
import { Transaction } from '../types';
import { supabase } from '../supabaseConfig';

interface TransactionStore {
  transactions: Transaction[];
  loadTransactions: () => Promise<void>;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => Promise<void>;
  removeTransaction: (id: string) => Promise<void>;
  updateTransaction: (id: string, transaction: Partial<Transaction>) => Promise<void>;
  getTransactionsByCategory: (category: string, startDate?: Date | null, endDate?: Date | null, responsibleId?: string | null) => Transaction[];
  getTransactionsByResponsible: (responsibleId: string, startDate?: Date | null, endDate?: Date | null) => Transaction[];
  getTotalBalance: (startDate?: Date | null, endDate?: Date | null, responsibleId?: string | null) => number;
  getTotalIncome: (startDate?: Date | null, endDate?: Date | null, responsibleId?: string | null) => number;
  getTotalExpenses: (startDate?: Date | null, endDate?: Date | null, responsibleId?: string | null) => number;
  getRecentTransactions: (limit?: number, startDate?: Date | null, endDate?: Date | null, responsibleId?: string | null) => Transaction[];
  getTransactionById: (id: string) => Transaction | undefined;
  getUniqueResponsibles: () => { id: string; name: string }[];
}

export const useTransactionStore = create<TransactionStore>((set, get) => ({
  loadTransactions: async () => {
    const { data: transactions, error } = await supabase
      .from('transactions')
      .select('*')
      .order('date', { ascending: false });

    if (error) {
      console.error('Erro ao carregar transações:', error);
      return;
    }

    set({ transactions: transactions || [] });
  },
  transactions: [],

  addTransaction: async (newTransaction) => {
    const { data: transaction, error } = await supabase
      .from('transactions')
      .insert([newTransaction])
      .select()
      .single();

    if (error) {
      console.error('Erro ao adicionar transação:', error);
      return;
    }

    set((state) => ({ transactions: [...state.transactions, transaction] }));
  },

  removeTransaction: async (id) => {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erro ao remover transação:', error);
      return;
    }

    set((state) => ({ transactions: state.transactions.filter((t) => t.id !== id) }));
  },

  updateTransaction: async (id, updatedTransaction) => {
    const { data: transaction, error } = await supabase
      .from('transactions')
      .update(updatedTransaction)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar transação:', error);
      return;
    }

    set((state) => ({
      transactions: state.transactions.map((t) =>
        t.id === id ? { ...t, ...transaction } : t
      )
    }));
  },

  getTransactionsByCategory: (category, startDate?: Date | null, endDate?: Date | null, responsibleId?: string | null) => {
    let transactions = get().transactions.filter((t) => t.category_id === category);
    
    if (startDate && endDate) {
      transactions = transactions.filter((t) => {
        const transactionDate = new Date(t.date);
        return transactionDate >= startDate && transactionDate <= endDate;
      });
    }

    if (responsibleId) {
      transactions = transactions.filter((t) => t.responsible_name === responsibleId);
    }
    
    return transactions;
  },

  getTransactionsByResponsible: (responsibleId, startDate?: Date | null, endDate?: Date | null) => {
    let transactions = get().transactions.filter((t) => t.responsible_name === responsibleId);

    if (startDate && endDate) {
      transactions = transactions.filter((t) => {
        const transactionDate = new Date(t.date);
        return transactionDate >= startDate && transactionDate <= endDate;
      });
    }

    return transactions;
  },

  getTotalBalance: (startDate?: Date | null, endDate?: Date | null, responsibleId?: string | null) => {
    let transactions = get().transactions;
    
    if (startDate && endDate) {
      transactions = transactions.filter((t) => {
        const transactionDate = new Date(t.date);
        return transactionDate >= startDate && transactionDate <= endDate;
      });
    }

    if (responsibleId) {
      transactions = transactions.filter((t) => t.responsible_name === responsibleId);
    }
    
    return transactions.reduce((acc, curr) => acc + curr.amount, 0);
  },

  getTotalIncome: (startDate?: Date | null, endDate?: Date | null, responsibleId?: string | null) => {
    let transactions = get().transactions.filter((t) => t.amount > 0);
    
    if (startDate && endDate) {
      transactions = transactions.filter((t) => {
        const transactionDate = new Date(t.date);
        return transactionDate >= startDate && transactionDate <= endDate;
      });
    }

    if (responsibleId) {
      transactions = transactions.filter((t) => t.responsible_name === responsibleId);
    }
    
    return transactions.reduce((acc, curr) => acc + curr.amount, 0);
  },

  getTotalExpenses: (startDate?: Date | null, endDate?: Date | null, responsibleId?: string | null) => {
    let transactions = get().transactions.filter((t) => t.amount < 0);
    
    if (startDate && endDate) {
      transactions = transactions.filter((t) => {
        const transactionDate = new Date(t.date);
        return transactionDate >= startDate && transactionDate <= endDate;
      });
    }

    if (responsibleId) {
      transactions = transactions.filter((t) => t.responsible_name === responsibleId);
    }
    
    return transactions.reduce((acc, curr) => acc + curr.amount, 0);
  },

  getRecentTransactions: (limit = 150, startDate?: Date | null, endDate?: Date | null, responsibleId?: string | null) => {
    let transactions = [...get().transactions];
    
    if (startDate && endDate) {
      transactions = transactions.filter((t) => {
        const transactionDate = new Date(t.date);
        return transactionDate >= startDate && transactionDate <= endDate;
      });
    }

    if (responsibleId) {
      transactions = transactions.filter((t) => t.responsible_name === responsibleId);
    }
    
    return transactions
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, limit);
  },

  getTransactionById: (id: string) => {
    return get().transactions.find((t) => t.id === id);
  },

  getUniqueResponsibles: () => {
    const transactions = get().transactions;
    const uniqueResponsibles = new Set<string>();
    
    transactions.forEach((transaction) => {
      if (transaction.responsible_name) {
        uniqueResponsibles.add(transaction.responsible_name);
      }
    });

    return Array.from(uniqueResponsibles).map(name => ({
      id: name,
      name: name
    }));
  },
}));

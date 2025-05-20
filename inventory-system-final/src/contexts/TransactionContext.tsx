import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Transaction } from "@/types";

interface TransactionContextType {
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, "id" | "date">) => void;
  getRecentTransactions: (limit?: number) => Transaction[];
  getTransactionsByItem: (itemId: string) => Transaction[];
  getTransactionsByType: (type: Transaction['type']) => Transaction[];
  clearTransactions: () => void;
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

export function TransactionProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Carregar transações do localStorage ao iniciar
  useEffect(() => {
    const storedTransactions = localStorage.getItem("transactions");
    if (storedTransactions) {
      try {
        setTransactions(JSON.parse(storedTransactions));
      } catch (error) {
        console.error("Erro ao carregar transações:", error);
        setTransactions([]);
      }
    }
  }, []);

  // Salvar transações no localStorage quando mudar
  useEffect(() => {
    localStorage.setItem("transactions", JSON.stringify(transactions));
  }, [transactions]);

  // Adicionar nova transação
  const addTransaction = (transaction: Omit<Transaction, "id" | "date">) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: Date.now().toString(),
      date: new Date().toISOString(),
    };

    setTransactions((prev) => [newTransaction, ...prev]);
  };

  // Obter transações recentes
  const getRecentTransactions = (limit = 10): Transaction[] => {
    return [...transactions]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, limit);
  };

  // Obter transações por item
  const getTransactionsByItem = (itemId: string): Transaction[] => {
    return transactions.filter((transaction) => transaction.itemId === itemId);
  };

  // Obter transações por tipo
  const getTransactionsByType = (type: Transaction['type']): Transaction[] => {
    return transactions.filter((transaction) => transaction.type === type);
  };

  // Limpar todas as transações
  const clearTransactions = () => {
    setTransactions([]);
  };

  return (
    <TransactionContext.Provider
      value={{
        transactions,
        addTransaction,
        getRecentTransactions,
        getTransactionsByItem,
        getTransactionsByType,
        clearTransactions,
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
}

export function useTransactions() {
  const context = useContext(TransactionContext);
  if (context === undefined) {
    throw new Error("useTransactions must be used within a TransactionProvider");
  }
  return context;
}

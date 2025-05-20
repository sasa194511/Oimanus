import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Item } from "@/types";
import { useTransactions } from "./TransactionContext";

interface InventoryContextType {
  items: Item[];
  addItem: (item: Omit<Item, "id" | "createdAt" | "lastUpdated">) => string;
  updateItem: (id: string, updates: Partial<Omit<Item, "id" | "createdAt" | "lastUpdated">>) => boolean;
  deleteItem: (id: string) => boolean;
  getItem: (id: string) => Item | undefined;
  getLowStockItems: () => Item[];
  getItemsByCategory: (category: string) => Item[];
  searchItems: (query: string) => Item[];
  clearInventory: () => void;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export function InventoryProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Item[]>([]);
  const { addTransaction } = useTransactions();

  // Carregar itens do localStorage ao iniciar
  useEffect(() => {
    const storedItems = localStorage.getItem("inventory");
    if (storedItems) {
      try {
        setItems(JSON.parse(storedItems));
      } catch (error) {
        console.error("Erro ao carregar inventário:", error);
        setItems([]);
      }
    }
  }, []);

  // Salvar itens no localStorage quando mudar
  useEffect(() => {
    localStorage.setItem("inventory", JSON.stringify(items));
  }, [items]);

  // Adicionar novo item
  const addItem = (item: Omit<Item, "id" | "createdAt" | "lastUpdated">): string => {
    const now = new Date().toISOString();
    const newItem: Item = {
      ...item,
      id: Date.now().toString(),
      createdAt: now,
      lastUpdated: now,
    };

    setItems((prev) => [...prev, newItem]);
    
    // Registrar transação
    addTransaction({
      itemId: newItem.id,
      itemName: newItem.name,
      type: "add",
      quantity: newItem.quantity,
      user: "Admin", // Idealmente, usar o usuário atual
      notes: `Item adicionado ao inventário`
    });

    return newItem.id;
  };

  // Atualizar item existente
  const updateItem = (id: string, updates: Partial<Omit<Item, "id" | "createdAt" | "lastUpdated">>): boolean => {
    const itemIndex = items.findIndex((item) => item.id === id);
    
    if (itemIndex === -1) return false;
    
    const oldItem = items[itemIndex];
    const updatedItem: Item = {
      ...oldItem,
      ...updates,
      lastUpdated: new Date().toISOString(),
    };
    
    const newItems = [...items];
    newItems[itemIndex] = updatedItem;
    setItems(newItems);
    
    // Registrar transação se a quantidade mudou
    if (updates.quantity !== undefined && updates.quantity !== oldItem.quantity) {
      addTransaction({
        itemId: id,
        itemName: updatedItem.name,
        type: "update",
        quantity: updates.quantity,
        previousQuantity: oldItem.quantity,
        user: "Admin", // Idealmente, usar o usuário atual
        notes: `Quantidade atualizada de ${oldItem.quantity} para ${updates.quantity}`
      });
    }
    
    return true;
  };

  // Excluir item
  const deleteItem = (id: string): boolean => {
    const item = items.find((item) => item.id === id);
    
    if (!item) return false;
    
    setItems((prev) => prev.filter((item) => item.id !== id));
    
    // Registrar transação
    addTransaction({
      itemId: id,
      itemName: item.name,
      type: "delete",
      quantity: item.quantity,
      user: "Admin", // Idealmente, usar o usuário atual
      notes: `Item removido do inventário`
    });
    
    return true;
  };

  // Obter item por ID
  const getItem = (id: string): Item | undefined => {
    return items.find((item) => item.id === id);
  };

  // Obter itens com estoque baixo
  const getLowStockItems = (): Item[] => {
    return items.filter((item) => item.quantity <= item.minQuantity);
  };

  // Obter itens por categoria
  const getItemsByCategory = (category: string): Item[] => {
    return items.filter((item) => item.category === category);
  };

  // Buscar itens
  const searchItems = (query: string): Item[] => {
    const lowerQuery = query.toLowerCase();
    return items.filter(
      (item) =>
        item.name.toLowerCase().includes(lowerQuery) ||
        item.category.toLowerCase().includes(lowerQuery) ||
        (item.description && item.description.toLowerCase().includes(lowerQuery))
    );
  };

  // Limpar inventário
  const clearInventory = () => {
    setItems([]);
  };

  return (
    <InventoryContext.Provider
      value={{
        items,
        addItem,
        updateItem,
        deleteItem,
        getItem,
        getLowStockItems,
        getItemsByCategory,
        searchItems,
        clearInventory,
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
}

export function useInventory() {
  const context = useContext(InventoryContext);
  if (context === undefined) {
    throw new Error("useInventory must be used within an InventoryProvider");
  }
  return context;
}

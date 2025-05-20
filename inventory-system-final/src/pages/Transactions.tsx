import { useState, useEffect } from "react";
import { useTransactions } from "@/contexts/TransactionContext";
import { useInventory } from "@/contexts/InventoryContext";
import { Transaction } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { ArrowUpIcon, ArrowDownIcon, RefreshCwIcon, FilterIcon, SearchIcon, DownloadIcon, CalendarIcon } from "lucide-react";

export default function Transactions() {
  const { transactions, getRecentTransactions } = useTransactions();
  const { getItem } = useInventory();
  
  // State for the transactions list
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [sortField, setSortField] = useState<keyof Transaction>("date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  // Loading state
  const [isLoading, setIsLoading] = useState(true);
  
  // Initialize
  useEffect(() => {
    // Simulate loading delay
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Filter and sort transactions whenever dependencies change
  useEffect(() => {
    let result = [...transactions];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        transaction => 
          transaction.itemName.toLowerCase().includes(query) || 
          transaction.user.toLowerCase().includes(query) ||
          (transaction.notes && transaction.notes.toLowerCase().includes(query))
      );
    }
    
    // Apply type filter
    if (typeFilter !== "all") {
      result = result.filter(transaction => transaction.type === typeFilter);
    }
    
    // Apply date filter
    if (dateFilter !== "all") {
      const now = new Date();
      let startDate: Date | null = null;
      
      switch (dateFilter) {
        case "today":
          startDate = new Date(now.setHours(0, 0, 0, 0));
          break;
        case "yesterday":
          startDate = new Date(now.setDate(now.getDate() - 1));
          startDate.setHours(0, 0, 0, 0);
          break;
        case "week":
          startDate = new Date(now.setDate(now.getDate() - 7));
          break;
        case "month":
          startDate = new Date(now.setMonth(now.getMonth() - 1));
          break;
        default:
          startDate = null;
      }
      
      if (startDate) {
        result = result.filter(transaction => new Date(transaction.date) >= startDate!);
      }
    }
    
    // Apply sorting
    result.sort((a, b) => {
      if (sortField === "date") {
        return sortDirection === "asc" 
          ? new Date(a.date).getTime() - new Date(b.date).getTime()
          : new Date(b.date).getTime() - new Date(a.date).getTime();
      }
      
      const valueA = a[sortField];
      const valueB = b[sortField];
      
      // Handle string comparison
      if (typeof valueA === 'string' && typeof valueB === 'string') {
        return sortDirection === "asc" 
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA);
      }
      
      // Handle number comparison
      if (typeof valueA === 'number' && typeof valueB === 'number') {
        return sortDirection === "asc" ? valueA - valueB : valueB - valueA;
      }
      
      return 0;
    });
    
    setFilteredTransactions(result);
  }, [transactions, searchQuery, typeFilter, dateFilter, sortField, sortDirection]);
  
  // Get current transactions for pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTransactions = filteredTransactions.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  
  // Format date
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Get transaction type badge
  const getTransactionTypeBadge = (type: Transaction['type']) => {
    switch (type) {
      case "add":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Entrada</Badge>;
      case "remove":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Saída</Badge>;
      case "update":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Atualização</Badge>;
      case "delete":
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Exclusão</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };
  
  // Get transaction type icon
  const getTransactionTypeIcon = (type: Transaction['type']) => {
    switch (type) {
      case "add":
        return <ArrowUpIcon className="h-4 w-4 text-green-600" />;
      case "remove":
        return <ArrowDownIcon className="h-4 w-4 text-red-600" />;
      case "update":
        return <RefreshCwIcon className="h-4 w-4 text-blue-600" />;
      default:
        return null;
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Histórico de Movimentações</h1>
          <p className="text-muted-foreground">
            Visualize e filtre todas as movimentações de estoque.
          </p>
        </div>
        <div className="flex items-center space-x-2 mt-4 md:mt-0">
          <Button variant="outline" size="sm">
            <DownloadIcon className="mr-2 h-4 w-4" />
            Exportar
          </Button>
        </div>
      </div>
      
      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="search">Buscar</Label>
              <div className="relative">
                <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Produto, usuário, notas..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="type">Tipo de Movimentação</Label>
              <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value)}>
                <SelectTrigger id="type">
                  <SelectValue placeholder="Todos os tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  <SelectItem value="add">Entradas</SelectItem>
                  <SelectItem value="remove">Saídas</SelectItem>
                  <SelectItem value="update">Atualizações</SelectItem>
                  <SelectItem value="delete">Exclusões</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="date">Período</Label>
              <Select value={dateFilter} onValueChange={(value) => setDateFilter(value)}>
                <SelectTrigger id="date">
                  <SelectValue placeholder="Todos os períodos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todo o período</SelectItem>
                  <SelectItem value="today">Hoje</SelectItem>
                  <SelectItem value="yesterday">Ontem</SelectItem>
                  <SelectItem value="week">Últimos 7 dias</SelectItem>
                  <SelectItem value="month">Últimos 30 dias</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="sort">Ordenar por</Label>
              <Select 
                value={`${sortField}-${sortDirection}`} 
                onValueChange={(value) => {
                  const [field, direction] = value.split('-') as [keyof Transaction, "asc" | "desc"];
                  setSortField(field);
                  setSortDirection(direction);
                }}
              >
                <SelectTrigger id="sort">
                  <SelectValue placeholder="Data (mais recente)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date-desc">Data (mais recente)</SelectItem>
                  <SelectItem value="date-asc">Data (mais antiga)</SelectItem>
                  <SelectItem value="itemName-asc">Produto (A-Z)</SelectItem>
                  <SelectItem value="itemName-desc">Produto (Z-A)</SelectItem>
                  <SelectItem value="quantity-desc">Quantidade (maior)</SelectItem>
                  <SelectItem value="quantity-asc">Quantidade (menor)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex justify-between items-center mt-6">
            <div className="text-sm text-muted-foreground">
              Mostrando {currentTransactions.length} de {filteredTransactions.length} movimentações
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={() => {
                setSearchQuery("");
                setTypeFilter("all");
                setDateFilter("all");
                setSortField("date");
                setSortDirection("desc");
              }}>
                <RefreshCwIcon className="mr-2 h-4 w-4" />
                Limpar Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Transactions Table */}
      <Card>
        <CardContent className="p-0">
          <div className="relative w-full overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Tipo</TableHead>
                  <TableHead>Produto</TableHead>
                  <TableHead>Quantidade</TableHead>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Notas</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentTransactions.length > 0 ? (
                  currentTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getTransactionTypeIcon(transaction.type)}
                          <span>{getTransactionTypeBadge(transaction.type)}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{transaction.itemName}</TableCell>
                      <TableCell>
                        {transaction.type === "update" ? (
                          <span>
                            {transaction.previousQuantity} → {transaction.quantity}
                          </span>
                        ) : (
                          <span>{transaction.quantity}</span>
                        )}
                      </TableCell>
                      <TableCell>{transaction.user}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                          <span>{formatDate(transaction.date)}</span>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {transaction.notes || "-"}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      Nenhuma movimentação encontrada.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        <CardFooter className="flex items-center justify-center p-4 border-t">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <PaginationItem key={page}>
                  <PaginationLink
                    onClick={() => setCurrentPage(page)}
                    isActive={currentPage === page}
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ))}
              
              <PaginationItem>
                <PaginationNext 
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </CardFooter>
      </Card>
    </div>
  );
}

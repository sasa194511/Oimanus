import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useInventory } from "@/contexts/InventoryContext";
import { useTransactions } from "@/contexts/TransactionContext";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { ArrowUpIcon, ArrowDownIcon, ArchiveIcon, AlertTriangleIcon, TrendingUpIcon, PackageIcon, RefreshCwIcon, HistoryIcon } from "lucide-react";

export default function Dashboard() {
  const { items, lowStockItems, totalItems, totalValue, categories } = useInventory();
  const { getRecentTransactions } = useTransactions();
  const { user } = useAuth();
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [stockStatusData, setStockStatusData] = useState([]);
  const [transactionHistory, setTransactionHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading delay
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    // Prepare data for charts
    const categoryMap = new Map();
    items.forEach(item => {
      const category = item.category;
      const currentValue = categoryMap.get(category) || 0;
      categoryMap.set(category, currentValue + item.quantity);
    });

    const categoryChartData = Array.from(categoryMap.entries()).map(([name, value]) => ({
      name,
      value
    }));

    setCategoryData(categoryChartData);

    // Stock status data
    const lowStock = items.filter(item => item.quantity <= item.minQuantity).length;
    const normalStock = items.length - lowStock;
    
    setStockStatusData([
      { name: 'Estoque Normal', value: normalStock },
      { name: 'Estoque Baixo', value: lowStock }
    ]);

    // Transaction history data (last 7 days)
    const transactions = getRecentTransactions(30);
    setRecentTransactions(transactions);

    // Group transactions by date for the line chart
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();

    const transactionsByDate = last7Days.map(date => {
      const dayTransactions = transactions.filter(t => 
        t.date.split('T')[0] === date
      );
      
      const adds = dayTransactions.filter(t => t.type === 'add')
        .reduce((sum, t) => sum + t.quantity, 0);
      
      const removes = dayTransactions.filter(t => t.type === 'remove')
        .reduce((sum, t) => sum + t.quantity, 0);
      
      return {
        date: new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        entradas: adds,
        saídas: removes
      };
    });

    setTransactionHistory(transactionsByDate);

    return () => clearTimeout(timer);
  }, [items, getRecentTransactions]);

  // Colors for charts
  const COLORS = ['#4361ee', '#3a0ca3', '#4895ef', '#4cc9f0', '#7209b7', '#f72585', '#480ca8'];
  const STATUS_COLORS = ['#4cc9f0', '#f72585'];

  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
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
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Bem-vindo, {user?.name}! Aqui está o resumo do seu inventário.
          </p>
        </div>
        <div className="flex items-center space-x-2 mt-4 md:mt-0">
          <Button variant="outline" size="sm">
            <RefreshCwIcon className="mr-2 h-4 w-4" />
            Atualizar
          </Button>
          <Button variant="outline" size="sm">
            <HistoryIcon className="mr-2 h-4 w-4" />
            Histórico
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Itens</CardTitle>
            <PackageIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalItems}</div>
            <p className="text-xs text-muted-foreground">
              {items.length} produtos diferentes
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
            <TrendingUpIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalValue)}</div>
            <p className="text-xs text-muted-foreground">
              Valor médio por item: {formatCurrency(totalValue / totalItems)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estoque Baixo</CardTitle>
            <AlertTriangleIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lowStockItems.length}</div>
            <p className="text-xs text-muted-foreground">
              {((lowStockItems.length / items.length) * 100).toFixed(1)}% do total de produtos
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categorias</CardTitle>
            <ArchiveIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categories.length}</div>
            <p className="text-xs text-muted-foreground">
              {categories.slice(0, 2).join(', ')}
              {categories.length > 2 ? ` e mais ${categories.length - 2}` : ''}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="categories">Categorias</TabsTrigger>
          <TabsTrigger value="transactions">Transações</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Movimentações Recentes</CardTitle>
                <CardDescription>
                  Entradas e saídas nos últimos 7 dias
                </CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={transactionHistory}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="entradas" stroke="#4cc9f0" strokeWidth={2} />
                    <Line type="monotone" dataKey="saídas" stroke="#f72585" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Distribuição por Categoria</CardTitle>
                <CardDescription>
                  Quantidade de itens por categoria
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} itens`, 'Quantidade']} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Quantidade por Categoria</CardTitle>
              <CardDescription>
                Distribuição de itens entre as categorias
              </CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={categoryData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#4361ee" label={{ position: 'top' }}>
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Transações Recentes</CardTitle>
              <CardDescription>
                Últimas movimentações no estoque
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {recentTransactions.slice(0, 5).map((transaction) => (
                  <div key={transaction.id} className="flex items-center">
                    <div className={`mr-4 rounded-full p-2 ${
                      transaction.type === 'add' 
                        ? 'bg-green-100 text-green-600' 
                        : transaction.type === 'remove'
                          ? 'bg-red-100 text-red-600'
                          : 'bg-blue-100 text-blue-600'
                    }`}>
                      {transaction.type === 'add' && <ArrowUpIcon className="h-4 w-4" />}
                      {transaction.type === 'remove' && <ArrowDownIcon className="h-4 w-4" />}
                      {transaction.type === 'update' && <RefreshCwIcon className="h-4 w-4" />}
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {transaction.type === 'add' && 'Entrada de '}
                        {transaction.type === 'remove' && 'Saída de '}
                        {transaction.type === 'update' && 'Atualização de '}
                        {transaction.quantity} {transaction.itemName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(transaction.date).toLocaleString('pt-BR')} • {transaction.user}
                      </p>
                    </div>
                    <div className="ml-auto font-medium">
                      {transaction.notes && (
                        <span className="text-xs text-muted-foreground">{transaction.notes}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">Ver todas as transações</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Low Stock Items */}
      <Card>
        <CardHeader>
          <CardTitle>Itens com Estoque Baixo</CardTitle>
          <CardDescription>
            Produtos que precisam de reposição
          </CardDescription>
        </CardHeader>
        <CardContent>
          {lowStockItems.length > 0 ? (
            <div className="space-y-4">
              {lowStockItems.slice(0, 5).map((item) => (
                <div key={item.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="rounded-full bg-red-100 p-2">
                      <AlertTriangleIcon className="h-4 w-4 text-red-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Categoria: {item.category} • Fornecedor: {item.supplier}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="text-sm font-medium">
                      {item.quantity} / {item.minQuantity} unidades
                    </div>
                    <Button variant="outline" size="sm">Repor</Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="rounded-full bg-green-100 p-3 mb-4">
                <CheckIcon className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-medium">Todos os itens com estoque adequado</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Não há produtos com estoque abaixo do mínimo
              </p>
            </div>
          )}
        </CardContent>
        {lowStockItems.length > 5 && (
          <CardFooter>
            <Button variant="outline" className="w-full">
              Ver todos os {lowStockItems.length} itens com estoque baixo
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}

// CheckIcon component for the empty state
function CheckIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

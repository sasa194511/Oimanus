import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { ArrowUpIcon, ArrowDownIcon, ArchiveIcon, AlertTriangleIcon, TrendingUpIcon, PackageIcon, RefreshCwIcon, HistoryIcon } from "lucide-react";
import { ChartData, TransactionHistoryData } from "@/types";

// Dados de exemplo para o dashboard
const sampleData = {
  items: [
    { id: '1', name: 'Laptop Dell XPS 13', category: 'Eletrônicos', quantity: 15, minQuantity: 5, price: 7999.99, lastUpdated: new Date().toISOString(), createdAt: new Date().toISOString() },
    { id: '2', name: 'Monitor LG 27"', category: 'Eletrônicos', quantity: 8, minQuantity: 3, price: 1299.99, lastUpdated: new Date().toISOString(), createdAt: new Date().toISOString() },
    { id: '3', name: 'Teclado Mecânico', category: 'Periféricos', quantity: 25, minQuantity: 10, price: 499.99, lastUpdated: new Date().toISOString(), createdAt: new Date().toISOString() },
    { id: '4', name: 'Mouse Sem Fio', category: 'Periféricos', quantity: 30, minQuantity: 15, price: 149.99, lastUpdated: new Date().toISOString(), createdAt: new Date().toISOString() },
    { id: '5', name: 'Cadeira de Escritório', category: 'Móveis', quantity: 5, minQuantity: 2, price: 899.99, lastUpdated: new Date().toISOString(), createdAt: new Date().toISOString() },
    { id: '6', name: 'Mesa de Escritório', category: 'Móveis', quantity: 3, minQuantity: 2, price: 599.99, lastUpdated: new Date().toISOString(), createdAt: new Date().toISOString() },
    { id: '7', name: 'Papel A4 (Resma)', category: 'Papelaria', quantity: 50, minQuantity: 20, price: 24.99, lastUpdated: new Date().toISOString(), createdAt: new Date().toISOString() },
    { id: '8', name: 'Canetas (Caixa)', category: 'Papelaria', quantity: 40, minQuantity: 15, price: 29.99, lastUpdated: new Date().toISOString(), createdAt: new Date().toISOString() },
  ],
  transactions: [
    { id: '1', itemId: '1', itemName: 'Laptop Dell XPS 13', type: 'add' as const, quantity: 5, date: new Date(Date.now() - 86400000 * 2).toISOString(), user: 'Admin' },
    { id: '2', itemId: '2', itemName: 'Monitor LG 27"', type: 'add' as const, quantity: 3, date: new Date(Date.now() - 86400000 * 1).toISOString(), user: 'Admin' },
    { id: '3', itemId: '1', itemName: 'Laptop Dell XPS 13', type: 'remove' as const, quantity: 2, date: new Date(Date.now() - 3600000 * 5).toISOString(), user: 'João Silva' },
    { id: '4', itemId: '3', itemName: 'Teclado Mecânico', type: 'add' as const, quantity: 10, date: new Date(Date.now() - 3600000 * 2).toISOString(), user: 'Admin' },
    { id: '5', itemId: '4', itemName: 'Mouse Sem Fio', type: 'update' as const, quantity: 30, date: new Date(Date.now() - 1800000).toISOString(), user: 'Admin' },
  ]
};

export default function StaticDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [categoryData, setCategoryData] = useState<ChartData[]>([]);
  const [stockStatusData, setStockStatusData] = useState<ChartData[]>([]);
  const [transactionHistory, setTransactionHistory] = useState<TransactionHistoryData[]>([]);

  useEffect(() => {
    // Simular carregamento
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    // Preparar dados para gráficos
    const categoryMap = new Map<string, number>();
    sampleData.items.forEach(item => {
      const category = item.category;
      const currentValue = categoryMap.get(category) || 0;
      categoryMap.set(category, currentValue + item.quantity);
    });

    const categoryChartData: ChartData[] = Array.from(categoryMap.entries()).map(([name, value]) => ({
      name,
      value
    }));

    setCategoryData(categoryChartData);

    // Dados de status de estoque
    const lowStock = sampleData.items.filter(item => item.quantity <= item.minQuantity).length;
    const normalStock = sampleData.items.length - lowStock;
    
    setStockStatusData([
      { name: 'Estoque Normal', value: normalStock },
      { name: 'Estoque Baixo', value: lowStock }
    ]);

    // Dados de histórico de transações (últimos 7 dias)
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();

    const transactionsByDate: TransactionHistoryData[] = last7Days.map(date => {
      const dayTransactions = sampleData.transactions.filter(t => 
        t.date.split('T')[0] === date
      );
      
      const adds = dayTransactions.filter(t => t.type === 'add')
        .reduce((sum, t) => sum + t.quantity, 0);
      
      const removes = dayTransactions.filter(t => t.type === 'remove')
        .reduce((sum, t) => sum + t.quantity, 0);
      
      return {
        date: new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        entradas: adds || Math.floor(Math.random() * 10), // Dados aleatórios para demonstração
        saídas: removes || Math.floor(Math.random() * 5)  // Dados aleatórios para demonstração
      };
    });

    setTransactionHistory(transactionsByDate);

    return () => clearTimeout(timer);
  }, []);

  // Cores para gráficos
  const COLORS = ['#4361ee', '#3a0ca3', '#4895ef', '#4cc9f0', '#7209b7', '#f72585', '#480ca8'];
  
  // Formatar moeda
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Calcular totais
  const totalItems = sampleData.items.reduce((sum, item) => sum + item.quantity, 0);
  const totalValue = sampleData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const lowStockItems = sampleData.items.filter(item => item.quantity <= item.minQuantity);
  const categories = [...new Set(sampleData.items.map(item => item.category))];

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
            Bem-vindo ao Sistema de Estoque! Aqui está o resumo do seu inventário.
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

      {/* Cards de Estatísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Itens</CardTitle>
            <PackageIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalItems}</div>
            <p className="text-xs text-muted-foreground">
              {sampleData.items.length} produtos diferentes
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
              {((lowStockItems.length / sampleData.items.length) * 100).toFixed(1)}% do total de produtos
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

      {/* Gráficos */}
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
                      {categoryData.map((_, index) => (
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
                    {categoryData.map((_, index) => (
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
                {sampleData.transactions.slice(0, 5).map((transaction) => (
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

      {/* Itens com Estoque Baixo */}
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
              {lowStockItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="rounded-full bg-red-100 p-2">
                      <AlertTriangleIcon className="h-4 w-4 text-red-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Categoria: {item.category}
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
      </Card>
    </div>
  );
}

// CheckIcon component
function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
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

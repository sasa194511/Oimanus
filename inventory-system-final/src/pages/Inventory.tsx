import { useState, useEffect } from "react";
import { useInventory } from "@/contexts/InventoryContext";
import { useTransactions } from "@/contexts/TransactionContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { AlertCircle, Edit, Trash2, Plus, Search, Filter, RefreshCw, Download, Upload, Eye, ArrowUpDown } from "lucide-react";

export default function Inventory() {
  const { items, addItem, updateItem, deleteItem, categories, suppliers } = useInventory();
  const { addTransaction } = useTransactions();
  const { user } = useAuth();
  
  // State for the inventory list
  const [filteredItems, setFilteredItems] = useState(items);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [supplierFilter, setSupplierFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [sortField, setSortField] = useState("name");
  const [sortDirection, setSortDirection] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  // State for the item form
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    quantity: 0,
    minQuantity: 0,
    price: 0,
    supplier: "",
    description: "",
    image: ""
  });
  
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
  
  // Filter and sort items whenever dependencies change
  useEffect(() => {
    let result = [...items];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        item => 
          item.name.toLowerCase().includes(query) || 
          item.description?.toLowerCase().includes(query) ||
          item.category.toLowerCase().includes(query) ||
          item.supplier.toLowerCase().includes(query)
      );
    }
    
    // Apply category filter
    if (categoryFilter !== "all") {
      result = result.filter(item => item.category === categoryFilter);
    }
    
    // Apply supplier filter
    if (supplierFilter !== "all") {
      result = result.filter(item => item.supplier === supplierFilter);
    }
    
    // Apply stock filter
    if (stockFilter !== "all") {
      if (stockFilter === "low") {
        result = result.filter(item => item.quantity <= item.minQuantity);
      } else if (stockFilter === "normal") {
        result = result.filter(item => item.quantity > item.minQuantity);
      }
    }
    
    // Apply sorting
    result.sort((a, b) => {
      let valueA = a[sortField];
      let valueB = b[sortField];
      
      // Handle string comparison
      if (typeof valueA === 'string') {
        valueA = valueA.toLowerCase();
        valueB = valueB.toLowerCase();
      }
      
      if (valueA < valueB) return sortDirection === "asc" ? -1 : 1;
      if (valueA > valueB) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
    
    setFilteredItems(result);
  }, [items, searchQuery, categoryFilter, supplierFilter, stockFilter, sortField, sortDirection]);
  
  // Get current items for pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  
  // Handle sort
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };
  
  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === "quantity" || name === "minQuantity" || name === "price" 
        ? parseFloat(value) 
        : value
    }));
  };
  
  // Handle select changes
  const handleSelectChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Reset form
  const resetForm = () => {
    setFormData({
      name: "",
      category: "",
      quantity: 0,
      minQuantity: 0,
      price: 0,
      supplier: "",
      description: "",
      image: ""
    });
  };
  
  // Open add dialog
  const openAddDialog = () => {
    resetForm();
    setIsAddDialogOpen(true);
  };
  
  // Open edit dialog
  const openEditDialog = (item) => {
    setCurrentItem(item);
    setFormData({
      name: item.name,
      category: item.category,
      quantity: item.quantity,
      minQuantity: item.minQuantity,
      price: item.price,
      supplier: item.supplier,
      description: item.description || "",
      image: item.image || ""
    });
    setIsEditDialogOpen(true);
  };
  
  // Open view dialog
  const openViewDialog = (item) => {
    setCurrentItem(item);
    setIsViewDialogOpen(true);
  };
  
  // Open delete dialog
  const openDeleteDialog = (item) => {
    setCurrentItem(item);
    setIsDeleteDialogOpen(true);
  };
  
  // Handle add item
  const handleAddItem = () => {
    // Validate form
    if (!formData.name || !formData.category || !formData.supplier) {
      alert("Por favor, preencha todos os campos obrigatórios.");
      return;
    }
    
    // Add item
    addItem(formData);
    
    // Add transaction
    addTransaction({
      itemId: Date.now().toString(), // Temporary ID until we get the real one
      itemName: formData.name,
      type: "add",
      quantity: formData.quantity,
      user: user?.name || "Sistema",
      notes: "Novo item adicionado ao estoque"
    });
    
    // Close dialog and reset form
    setIsAddDialogOpen(false);
    resetForm();
  };
  
  // Handle edit item
  const handleEditItem = () => {
    // Validate form
    if (!formData.name || !formData.category || !formData.supplier) {
      alert("Por favor, preencha todos os campos obrigatórios.");
      return;
    }
    
    // Check if quantity changed
    const quantityChanged = currentItem.quantity !== formData.quantity;
    
    // Update item
    updateItem(currentItem.id, formData);
    
    // Add transaction if quantity changed
    if (quantityChanged) {
      addTransaction({
        itemId: currentItem.id,
        itemName: formData.name,
        type: "update",
        quantity: formData.quantity,
        previousQuantity: currentItem.quantity,
        user: user?.name || "Sistema",
        notes: `Quantidade atualizada de ${currentItem.quantity} para ${formData.quantity}`
      });
    }
    
    // Close dialog
    setIsEditDialogOpen(false);
    setCurrentItem(null);
  };
  
  // Handle delete item
  const handleDeleteItem = () => {
    // Delete item
    deleteItem(currentItem.id);
    
    // Add transaction
    addTransaction({
      itemId: currentItem.id,
      itemName: currentItem.name,
      type: "delete",
      quantity: currentItem.quantity,
      user: user?.name || "Sistema",
      notes: "Item removido do estoque"
    });
    
    // Close dialog
    setIsDeleteDialogOpen(false);
    setCurrentItem(null);
  };
  
  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };
  
  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
          <h1 className="text-3xl font-bold tracking-tight">Inventário</h1>
          <p className="text-muted-foreground">
            Gerencie seus produtos e controle seu estoque.
          </p>
        </div>
        <div className="flex items-center space-x-2 mt-4 md:mt-0">
          <Button onClick={openAddDialog}>
            <Plus className="mr-2 h-4 w-4" />
            Adicionar Produto
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
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Nome, categoria, fornecedor..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category">Categoria</Label>
              <Select value={categoryFilter} onValueChange={(value) => setCategoryFilter(value)}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Todas as categorias" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as categorias</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="supplier">Fornecedor</Label>
              <Select value={supplierFilter} onValueChange={(value) => setSupplierFilter(value)}>
                <SelectTrigger id="supplier">
                  <SelectValue placeholder="Todos os fornecedores" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os fornecedores</SelectItem>
                  {suppliers.map((supplier) => (
                    <SelectItem key={supplier} value={supplier}>
                      {supplier}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="stock">Status do Estoque</Label>
              <Select value={stockFilter} onValueChange={(value) => setStockFilter(value)}>
                <SelectTrigger id="stock">
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="low">Estoque Baixo</SelectItem>
                  <SelectItem value="normal">Estoque Normal</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex justify-between items-center mt-6">
            <div className="text-sm text-muted-foreground">
              Mostrando {currentItems.length} de {filteredItems.length} produtos
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={() => {
                setSearchQuery("");
                setCategoryFilter("all");
                setSupplierFilter("all");
                setStockFilter("all");
              }}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Limpar Filtros
              </Button>
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Exportar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Inventory Table */}
      <Card>
        <CardContent className="p-0">
          <div className="relative w-full overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Imagem</TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("name")}>
                    <div className="flex items-center">
                      Nome
                      {sortField === "name" && (
                        <ArrowUpDown className={`ml-2 h-4 w-4 ${sortDirection === "desc" ? "rotate-180" : ""}`} />
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("category")}>
                    <div className="flex items-center">
                      Categoria
                      {sortField === "category" && (
                        <ArrowUpDown className={`ml-2 h-4 w-4 ${sortDirection === "desc" ? "rotate-180" : ""}`} />
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("quantity")}>
                    <div className="flex items-center">
                      Quantidade
                      {sortField === "quantity" && (
                        <ArrowUpDown className={`ml-2 h-4 w-4 ${sortDirection === "desc" ? "rotate-180" : ""}`} />
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("price")}>
                    <div className="flex items-center">
                      Preço
                      {sortField === "price" && (
                        <ArrowUpDown className={`ml-2 h-4 w-4 ${sortDirection === "desc" ? "rotate-180" : ""}`} />
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("supplier")}>
                    <div className="flex items-center">
                      Fornecedor
                      {sortField === "supplier" && (
                        <ArrowUpDown className={`ml-2 h-4 w-4 ${sortDirection === "desc" ? "rotate-180" : ""}`} />
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentItems.length > 0 ? (
                  currentItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        {item.image ? (
                          <img 
                            src={item.image} 
                            alt={item.name} 
                            className="h-10 w-10 rounded-md object-cover"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center">
                            <span className="text-xs text-muted-foreground">N/A</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>{item.category}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Badge variant={item.quantity <= item.minQuantity ? "destructive" : "secondary"}>
                            {item.quantity}
                          </Badge>
                          {item.quantity <= item.minQuantity && (
                            <AlertCircle className="ml-2 h-4 w-4 text-destructive" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{formatCurrency(item.price)}</TableCell>
                      <TableCell>{item.supplier}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button variant="ghost" size="icon" onClick={() => openViewDialog(item)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => openEditDialog(item)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => openDeleteDialog(item)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      Nenhum produto encontrado.
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
      
      {/* Add Item Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Adicionar Novo Produto</DialogTitle>
            <DialogDescription>
              Preencha os detalhes do produto para adicioná-lo ao inventário.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome do Produto *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Ex: Laptop Dell XPS 13"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Categoria *</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(value) => handleSelectChange("category", value)}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                    <SelectItem value="Nova Categoria">Nova Categoria</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantidade *</Label>
                <Input
                  id="quantity"
                  name="quantity"
                  type="number"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  min="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="minQuantity">Quantidade Mínima *</Label>
                <Input
                  id="minQuantity"
                  name="minQuantity"
                  type="number"
                  value={formData.minQuantity}
                  onChange={handleInputChange}
                  min="0"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Preço Unitário (R$) *</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  value={formData.price}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="supplier">Fornecedor *</Label>
                <Select 
                  value={formData.supplier} 
                  onValueChange={(value) => handleSelectChange("supplier", value)}
                >
                  <SelectTrigger id="supplier">
                    <SelectValue placeholder="Selecione um fornecedor" />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers.map((supplier) => (
                      <SelectItem key={supplier} value={supplier}>
                        {supplier}
                      </SelectItem>
                    ))}
                    <SelectItem value="Novo Fornecedor">Novo Fornecedor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Descrição detalhada do produto..."
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="image">URL da Imagem</Label>
              <Input
                id="image"
                name="image"
                value={formData.image}
                onChange={handleInputChange}
                placeholder="https://exemplo.com/imagem.jpg"
              />
              {formData.image && (
                <div className="mt-2">
                  <img 
                    src={formData.image} 
                    alt="Preview" 
                    className="h-20 w-20 rounded-md object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://placehold.co/200x200?text=Imagem+Inválida";
                    }}
                  />
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddItem}>
              Adicionar Produto
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Item Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Editar Produto</DialogTitle>
            <DialogDescription>
              Atualize os detalhes do produto.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Nome do Produto *</Label>
                <Input
                  id="edit-name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-category">Categoria *</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(value) => handleSelectChange("category", value)}
                >
                  <SelectTrigger id="edit-category">
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-quantity">Quantidade *</Label>
                <Input
                  id="edit-quantity"
                  name="quantity"
                  type="number"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  min="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-minQuantity">Quantidade Mínima *</Label>
                <Input
                  id="edit-minQuantity"
                  name="minQuantity"
                  type="number"
                  value={formData.minQuantity}
                  onChange={handleInputChange}
                  min="0"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-price">Preço Unitário (R$) *</Label>
                <Input
                  id="edit-price"
                  name="price"
                  type="number"
                  value={formData.price}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-supplier">Fornecedor *</Label>
                <Select 
                  value={formData.supplier} 
                  onValueChange={(value) => handleSelectChange("supplier", value)}
                >
                  <SelectTrigger id="edit-supplier">
                    <SelectValue placeholder="Selecione um fornecedor" />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers.map((supplier) => (
                      <SelectItem key={supplier} value={supplier}>
                        {supplier}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-description">Descrição</Label>
              <Textarea
                id="edit-description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-image">URL da Imagem</Label>
              <Input
                id="edit-image"
                name="image"
                value={formData.image}
                onChange={handleInputChange}
              />
              {formData.image && (
                <div className="mt-2">
                  <img 
                    src={formData.image} 
                    alt="Preview" 
                    className="h-20 w-20 rounded-md object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://placehold.co/200x200?text=Imagem+Inválida";
                    }}
                  />
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleEditItem}>
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* View Item Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Detalhes do Produto</DialogTitle>
          </DialogHeader>
          {currentItem && (
            <div className="grid gap-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="md:w-1/3">
                  {currentItem.image ? (
                    <img 
                      src={currentItem.image} 
                      alt={currentItem.name} 
                      className="w-full h-auto rounded-lg object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://placehold.co/400x400?text=Sem+Imagem";
                      }}
                    />
                  ) : (
                    <div className="w-full aspect-square rounded-lg bg-muted flex items-center justify-center">
                      <span className="text-muted-foreground">Sem imagem</span>
                    </div>
                  )}
                </div>
                <div className="md:w-2/3 space-y-4">
                  <div>
                    <h3 className="text-xl font-semibold">{currentItem.name}</h3>
                    <p className="text-sm text-muted-foreground">ID: {currentItem.id}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium">Categoria</p>
                      <p>{currentItem.category}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Fornecedor</p>
                      <p>{currentItem.supplier}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Quantidade</p>
                      <div className="flex items-center">
                        <Badge variant={currentItem.quantity <= currentItem.minQuantity ? "destructive" : "secondary"}>
                          {currentItem.quantity}
                        </Badge>
                        {currentItem.quantity <= currentItem.minQuantity && (
                          <span className="ml-2 text-xs text-destructive">Estoque baixo</span>
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Quantidade Mínima</p>
                      <p>{currentItem.minQuantity}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Preço Unitário</p>
                      <p>{formatCurrency(currentItem.price)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Valor Total</p>
                      <p>{formatCurrency(currentItem.price * currentItem.quantity)}</p>
                    </div>
                  </div>
                  
                  {currentItem.description && (
                    <div>
                      <p className="text-sm font-medium">Descrição</p>
                      <p className="text-sm">{currentItem.description}</p>
                    </div>
                  )}
                  
                  <div>
                    <p className="text-sm font-medium">Última Atualização</p>
                    <p className="text-sm">{formatDate(currentItem.lastUpdated)}</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Ações Rápidas</h4>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" onClick={() => {
                    setIsViewDialogOpen(false);
                    openEditDialog(currentItem);
                  }}>
                    <Edit className="mr-2 h-4 w-4" />
                    Editar
                  </Button>
                  <Button variant="outline" size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Adicionar Estoque
                  </Button>
                  <Button variant="outline" size="sm">
                    <ArrowUpDown className="mr-2 h-4 w-4" />
                    Ver Movimentações
                  </Button>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Item Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir este produto? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          {currentItem && (
            <div className="py-4">
              <div className="flex items-center space-x-4">
                {currentItem.image ? (
                  <img 
                    src={currentItem.image} 
                    alt={currentItem.name} 
                    className="h-12 w-12 rounded-md object-cover"
                  />
                ) : (
                  <div className="h-12 w-12 rounded-md bg-muted flex items-center justify-center">
                    <span className="text-xs text-muted-foreground">N/A</span>
                  </div>
                )}
                <div>
                  <p className="font-medium">{currentItem.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {currentItem.category} • {currentItem.quantity} unidades
                  </p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteItem}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

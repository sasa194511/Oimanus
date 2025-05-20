import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, LogIn, UserPlus, AlertCircle } from "lucide-react";

export default function Layout() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("login");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  // Login form state
  const [loginData, setLoginData] = useState({
    email: "",
    password: ""
  });
  
  // Register form state
  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  
  // Handle login form input changes
  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle register form input changes
  const handleRegisterChange = (e) => {
    const { name, value } = e.target;
    setRegisterData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle login submission
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    
    // Validate form
    if (!loginData.email || !loginData.password) {
      setError("Por favor, preencha todos os campos.");
      return;
    }
    
    // Attempt login
    setIsLoading(true);
    try {
      const success = await login(loginData.email, loginData.password);
      if (!success) {
        setError("Email ou senha incorretos.");
      }
    } catch (err) {
      setError("Ocorreu um erro ao fazer login. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle register submission
  const handleRegister = (e) => {
    e.preventDefault();
    setError("");
    
    // Validate form
    if (!registerData.name || !registerData.email || !registerData.password || !registerData.confirmPassword) {
      setError("Por favor, preencha todos os campos.");
      return;
    }
    
    if (registerData.password !== registerData.confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }
    
    // In a real app, we would register the user here
    // For this demo, we'll just show a success message and switch to login
    alert("Registro realizado com sucesso! Por favor, faça login.");
    setActiveTab("login");
    setLoginData({
      email: registerData.email,
      password: ""
    });
  };
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-background to-muted/30 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Sistema de Estoque</h1>
          <p className="text-muted-foreground mt-2">
            Gerencie seu inventário de forma simples e eficiente
          </p>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Cadastro</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <Card>
              <CardHeader>
                <CardTitle>Login</CardTitle>
                <CardDescription>
                  Entre com suas credenciais para acessar o sistema
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleLogin}>
                <CardContent className="space-y-4">
                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="seu.email@exemplo.com"
                      value={loginData.email}
                      onChange={handleLoginChange}
                      disabled={isLoading}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Senha</Label>
                      <a href="#" className="text-xs text-primary hover:underline">
                        Esqueceu a senha?
                      </a>
                    </div>
                    <div className="relative">
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={loginData.password}
                        onChange={handleLoginChange}
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="remember"
                      className="rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <Label htmlFor="remember" className="text-sm font-normal">
                      Lembrar de mim
                    </Label>
                  </div>
                </CardContent>
                
                <CardFooter>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        <span>Entrando...</span>
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <LogIn className="mr-2 h-4 w-4" />
                        <span>Entrar</span>
                      </div>
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Card>
            
            <div className="mt-4 text-center text-sm text-muted-foreground">
              <p>
                Para fins de demonstração, você pode usar:
              </p>
              <p className="mt-1">
                <strong>Email:</strong> admin@example.com | <strong>Senha:</strong> admin123
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="register">
            <Card>
              <CardHeader>
                <CardTitle>Criar Conta</CardTitle>
                <CardDescription>
                  Preencha os dados abaixo para criar uma nova conta
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleRegister}>
                <CardContent className="space-y-4">
                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="register-name">Nome Completo</Label>
                    <Input
                      id="register-name"
                      name="name"
                      placeholder="Seu Nome Completo"
                      value={registerData.name}
                      onChange={handleRegisterChange}
                      disabled={isLoading}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="register-email">Email</Label>
                    <Input
                      id="register-email"
                      name="email"
                      type="email"
                      placeholder="seu.email@exemplo.com"
                      value={registerData.email}
                      onChange={handleRegisterChange}
                      disabled={isLoading}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="register-password">Senha</Label>
                    <div className="relative">
                      <Input
                        id="register-password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={registerData.password}
                        onChange={handleRegisterChange}
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="register-confirm-password">Confirmar Senha</Label>
                    <Input
                      id="register-confirm-password"
                      name="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      value={registerData.confirmPassword}
                      onChange={handleRegisterChange}
                      disabled={isLoading}
                    />
                  </div>
                </CardContent>
                
                <CardFooter>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        <span>Processando...</span>
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <UserPlus className="mr-2 h-4 w-4" />
                        <span>Criar Conta</span>
                      </div>
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
        </Tabs>
        
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>
            &copy; {new Date().getFullYear()} Sistema de Estoque. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </div>
  );
}

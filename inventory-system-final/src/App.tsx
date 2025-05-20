import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { InventoryProvider } from '@/contexts/InventoryContext';
import { TransactionProvider } from '@/contexts/TransactionContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import Dashboard from '@/pages/Dashboard';
import Inventory from '@/pages/Inventory';
import Transactions from '@/pages/Transactions';
import Login from '@/pages/Login';
import Layout from '@/components/Layout';

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="inventory-theme">
      <AuthProvider>
        <InventoryProvider>
          <TransactionProvider>
            <Router>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/" element={
                  <ProtectedRoute>
                    <Layout />
                  </ProtectedRoute>
                }>
                  <Route index element={<Dashboard />} />
                  <Route path="inventory" element={<Inventory />} />
                  <Route path="transactions" element={<Transactions />} />
                </Route>
              </Routes>
            </Router>
            <Toaster />
          </TransactionProvider>
        </InventoryProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

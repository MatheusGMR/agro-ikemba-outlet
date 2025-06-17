
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { DiagnosticLogger } from "@/components/ui/DiagnosticLogger";
import { AdvancedDiagnostics } from "@/components/debug/AdvancedDiagnostics";
import { Suspense, lazy } from "react";
import { LoadingFallback } from "@/components/ui/LoadingFallback";

// Lazy loading dos componentes para melhor performance
const Index = lazy(() => import("./pages/Index"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const NotFound = lazy(() => import("./pages/NotFound"));
const ProductCatalog = lazy(() => import("./pages/ProductCatalog"));
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const Checkout = lazy(() => import("./pages/Checkout"));
const Registration = lazy(() => import("./pages/Registration"));
const Admin = lazy(() => import("./pages/Admin"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        console.error(`Query failed ${failureCount} times:`, error);
        return failureCount < 2; // Reduzido para evitar loops
      },
      staleTime: 5 * 60 * 1000, // 5 minutos
      gcTime: 10 * 60 * 1000, // 10 minutos
    },
  },
});

const App = () => {
  console.log('🚀 App inicializando...');
  
  return (
    <ErrorBoundary>
      <DiagnosticLogger />
      <AdvancedDiagnostics />
      <QueryClientProvider client={queryClient}>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/products" element={<ProductCatalog />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/register" element={<Registration />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;

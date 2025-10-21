import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from 'react-helmet-async';
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';
import Index from "./pages/Index";
import About from "./pages/About";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import ProductCatalog from "./pages/ProductCatalog";
import ProductDetail from "./pages/ProductDetail";
import Checkout from "./pages/Checkout";
import Registration from "./pages/Registration";
import Login from "./pages/Login";
import Admin from "./pages/Admin";
import AdminInventoryManagement from "./pages/AdminInventoryManagement";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import AdminProtectedRoute from "./components/admin/AdminProtectedRoute";
import RepresentativeProtectedRoute from "./components/representative/RepresentativeProtectedRoute";
import RepresentativeRegistration from "./pages/RepresentativeRegistration";
import RepresentativeLogin from "./pages/RepresentativeLogin";
import RepresentativeAffiliate from "./pages/RepresentativeAffiliate";

import Simulador from './pages/Simulador';
import LandingPage from './pages/LandingPage';
import Representative from './pages/Representative';
import ProposalView from './pages/ProposalView';
import { TooltipProvider } from '@radix-ui/react-tooltip';
import { CartProvider } from '@/contexts/CartContext';
import { AuthProvider } from '@/hooks/useAuth';
import ScrollToTop from '@/components/layout/ScrollToTop';
import ApprovedProtectedRoute from '@/components/auth/ApprovedProtectedRoute';
import PendingApproval from '@/pages/PendingApproval';
import VideoBoasVindas from '@/pages/VideoBoasVindas';
import Revenda from '@/pages/Revenda';
import ResetPassword from '@/pages/ResetPassword';
import GlobalWhatsAppButton from '@/components/ui/GlobalWhatsAppButton';
import IaroRegistration from '@/pages/IaroRegistration';
import MariaValentinaRegistration from '@/pages/MariaValentinaRegistration';

const queryClient = new QueryClient();

function App() {
  const recaptchaSiteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY || '';
  
  // Warn if reCAPTCHA is not configured
  if (!recaptchaSiteKey) {
    console.warn('⚠️ VITE_RECAPTCHA_SITE_KEY não está configurado. reCAPTCHA não funcionará.');
  }

  const RecaptchaWrapper = ({ children }: { children: React.ReactNode }) => {
    // Only load reCAPTCHA in production
    if (import.meta.env.DEV) {
      console.warn('⚠️ MODO DEV: GoogleReCaptchaProvider desabilitado');
      return <>{children}</>;
    }
    
    return (
      <GoogleReCaptchaProvider 
        reCaptchaKey={recaptchaSiteKey}
        scriptProps={{
          async: true,
          defer: true,
          appendTo: 'head'
        }}
      >
        {children}
      </GoogleReCaptchaProvider>
    );
  };

  return (
    <QueryClientProvider client={queryClient}>
      <RecaptchaWrapper>
        <CartProvider>
          <HelmetProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
              <ScrollToTop />
            <AuthProvider>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/sobre" element={<About />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/products" element={<ProductCatalog />} />
                  <Route path="/product/:id" element={<ProductDetail />} />
                  <Route path="/checkout" element={
                    <ApprovedProtectedRoute>
                      <Checkout />
                    </ApprovedProtectedRoute>
                  } />
                  <Route path="/register" element={<Registration />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route path="/pending-approval" element={<PendingApproval />} />
                  <Route path="/representative/login" element={<RepresentativeLogin />} />
                  <Route path="/representative/register" element={<RepresentativeRegistration />} />
                  {/* Legacy route for backwards compatibility */}
                  <Route path="/representative-registration" element={<RepresentativeRegistration />} />
                  <Route path="/blog" element={<Blog />} />
                  <Route path="/blog/:slug" element={<BlogPost />} />
                  <Route path="/admin" element={
                    <AdminProtectedRoute>
                      <Admin />
                    </AdminProtectedRoute>
                  } />
                  <Route path="/admin/inventory" element={
                    <AdminProtectedRoute>
                      <AdminInventoryManagement />
                    </AdminProtectedRoute>
                  } />
                  <Route path="/representative" element={
                    <RepresentativeProtectedRoute>
                      <Representative />
                    </RepresentativeProtectedRoute>
                  } />
                  <Route path="/representante-afiliado" element={<RepresentativeAffiliate />} />
                  <Route path="/simulador" element={<Simulador />} />
                  <Route path="/landing" element={<LandingPage />} />
                   <Route path="/video/boas-vindas" element={<VideoBoasVindas />} />
                   <Route path="/proposta/:publicLink" element={<ProposalView />} />
                   <Route path="/cliente/iaro-registration" element={<IaroRegistration />} />
                   <Route path="/cliente/maria-valentina-registration" element={<MariaValentinaRegistration />} />
                   <Route path="/revenda" element={<Revenda />} />
                   
                   <Route path="*" element={<NotFound />} />
                </Routes>  
              </AuthProvider>
              <GlobalWhatsAppButton />
            </BrowserRouter>
          </TooltipProvider>
        </HelmetProvider>
      </CartProvider>
      </RecaptchaWrapper>
    </QueryClientProvider>
  );
}

export default App;
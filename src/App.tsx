import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import DailySales from "./pages/DailySales";
import NotFound from "./pages/NotFound";
import Example from "./pages/Example";
import Whatsapp from "./pages/Whatsapp";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/daily-sales" element={<DailySales />} />
          <Route path="/daily-sales/:sheet" element={<DailySales />} />
          <Route path="/eod-report" element={<Example />} />
          <Route path="/eod-report/:sheet" element={<Example />} />
          <Route path="/whatsapp" element={<Whatsapp />} />
          <Route path="/whatsapp/:sheet" element={<Whatsapp />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

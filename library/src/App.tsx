import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import BookDetail from "./pages/BookDetail.tsx";
import Index from "./pages/Index.tsx";
import Login from "./pages/Login.tsx";
import MyBooks from "./pages/MyBooks.tsx";
import NotFound from "./pages/NotFound.tsx";
import Saved from "./pages/Saved.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/my-books" element={<MyBooks />} />
          <Route path="/saved" element={<Saved />} />
          <Route path="/book/:id" element={<BookDetail />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

import "./global.css";

import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "@/components/Layout";

// Page imports
import Home from "@/pages/Home";
import QuizSelection from "@/pages/QuizSelection";
import Quiz from "@/pages/Quiz";
import Results from "@/pages/Results";
import Dashboard from "@/pages/Dashboard";
import Auth from "@/pages/Auth";
import Profile from "@/pages/Profile";
import Feedback from "@/pages/Feedback";
import Admin from "@/pages/Admin";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

function AppContent() {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem("quizmaster-theme");
    if (saved) {
      return saved === "dark";
    }
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    localStorage.setItem("quizmaster-theme", isDark ? "dark" : "light");
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  const handleThemeToggle = () => {
    setIsDark(!isDark);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route
              path="/"
              element={
                <Layout isDark={isDark} onThemeToggle={handleThemeToggle}>
                  <Home />
                </Layout>
              }
            />
            <Route
              path="/quizzes"
              element={
                <Layout isDark={isDark} onThemeToggle={handleThemeToggle}>
                  <QuizSelection />
                </Layout>
              }
            />
            <Route
              path="/quiz/:id"
              element={
                <Layout isDark={isDark} onThemeToggle={handleThemeToggle}>
                  <Quiz />
                </Layout>
              }
            />
            <Route
              path="/results/:id"
              element={
                <Layout isDark={isDark} onThemeToggle={handleThemeToggle}>
                  <Results />
                </Layout>
              }
            />
            <Route
              path="/dashboard"
              element={
                <Layout isDark={isDark} onThemeToggle={handleThemeToggle}>
                  <Dashboard />
                </Layout>
              }
            />
            <Route
              path="/auth"
              element={
                <Layout isDark={isDark} onThemeToggle={handleThemeToggle}>
                  <Auth />
                </Layout>
              }
            />
            <Route
              path="/signup"
              element={
                <Layout isDark={isDark} onThemeToggle={handleThemeToggle}>
                  <Auth />
                </Layout>
              }
            />
            <Route
              path="/profile"
              element={
                <Layout isDark={isDark} onThemeToggle={handleThemeToggle}>
                  <Profile />
                </Layout>
              }
            />
            <Route
              path="/feedback"
              element={
                <Layout isDark={isDark} onThemeToggle={handleThemeToggle}>
                  <Feedback />
                </Layout>
              }
            />
            <Route
              path="/admin"
              element={
                <Layout isDark={isDark} onThemeToggle={handleThemeToggle}>
                  <Admin />
                </Layout>
              }
            />
            <Route
              path="*"
              element={
                <Layout isDark={isDark} onThemeToggle={handleThemeToggle}>
                  <NotFound />
                </Layout>
              }
            />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

const rootElement = document.getElementById("root");

if (rootElement) {
  // Check if a root was already created on this element
  const existingRoot = (rootElement as any)._reactRootContainer;

  if (existingRoot) {
    // Use existing root for HMR updates
    existingRoot.render(<AppContent />);
  } else {
    // Create new root for initial load
    createRoot(rootElement).render(<AppContent />);
  }
}

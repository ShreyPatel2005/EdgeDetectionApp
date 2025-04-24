
import { useState } from "react";
import EdgeDetectionApp from "@/components/EdgeDetectionApp";
import AppHeader from "@/components/AppHeader";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary">
      <div className="container max-w-7xl mx-auto px-4 py-8">
        <AppHeader />
        <main className="mt-6">
          <EdgeDetectionApp />
        </main>
        <footer className="mt-12 text-center text-sm text-muted-foreground">
          <p>Edge Vision Playground &copy; {new Date().getFullYear()}</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;

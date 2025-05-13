import { ReactNode } from "react";
import Header from "./header";
import Sidebar from "./sidebar";
import MobileNav from "./mobile-nav";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        
        <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
          {children}
        </main>
      </div>
      
      <MobileNav />
    </div>
  );
}

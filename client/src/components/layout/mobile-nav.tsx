import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Timer, 
  ShieldAlert, 
  BarChart2, 
  Menu 
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

interface NavItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  href: string;
}

const navItems: NavItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/" },
  { icon: Timer, label: "Timer", href: "/timer" },
  { icon: ShieldAlert, label: "Blocklist", href: "/blocklist" },
  { icon: BarChart2, label: "Analytics", href: "/analytics" },
];

export default function MobileNav() {
  const [location] = useLocation();
  const [open, setOpen] = useState(false);

  return (
    <>
      <nav className="md:hidden bg-background border-t border-border fixed bottom-0 left-0 right-0 z-10">
        <div className="flex justify-around">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <a className="flex flex-col items-center py-2 px-3">
                <item.icon
                  className={cn(
                    "h-5 w-5",
                    location === item.href ? "text-primary" : "text-muted-foreground"
                  )}
                />
                <span
                  className={cn(
                    "text-xs mt-1",
                    location === item.href ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  {item.label}
                </span>
              </a>
            </Link>
          ))}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" className="flex flex-col items-center py-2 px-3">
                <Menu className="h-5 w-5 text-muted-foreground" />
                <span className="text-xs mt-1 text-muted-foreground">More</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-80 rounded-t-xl">
              <div className="py-6 grid gap-6">
                <div className="grid grid-cols-2 gap-4">
                  <Link href="/history" onClick={() => setOpen(false)}>
                    <a className="flex flex-col items-center justify-center p-4 border rounded-lg">
                      <History className="h-8 w-8 mb-2 text-muted-foreground" />
                      <span className="text-sm font-medium">History</span>
                    </a>
                  </Link>
                  <Link href="/settings" onClick={() => setOpen(false)}>
                    <a className="flex flex-col items-center justify-center p-4 border rounded-lg">
                      <Settings className="h-8 w-8 mb-2 text-muted-foreground" />
                      <span className="text-sm font-medium">Settings</span>
                    </a>
                  </Link>
                </div>
                <div className="text-sm text-muted-foreground text-center">
                  FocusFlow - v1.0.0
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </>
  );
}

// Required icons that are used in the more sheet
function History(props: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
      <path d="M12 7v5l4 2" />
    </svg>
  );
}

function Settings(props: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

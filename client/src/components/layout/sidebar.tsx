import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Timer, 
  ShieldAlert, 
  BarChart2, 
  History, 
  Settings 
} from "lucide-react";

interface SidebarItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  href: string;
}

const sidebarItems: SidebarItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/" },
  { icon: Timer, label: "Timer", href: "/timer" },
  { icon: ShieldAlert, label: "Blocklist", href: "/blocklist" },
  { icon: BarChart2, label: "Analytics", href: "/analytics" },
  { icon: History, label: "History", href: "/history" },
  { icon: Settings, label: "Settings", href: "/settings" },
];

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <aside className="w-64 border-r border-border bg-background hidden md:block">
      <nav className="p-4">
        <ul className="space-y-2">
          {sidebarItems.map((item) => (
            <li key={item.href}>
              <Link href={item.href}>
                <a
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-accent/50 transition-colors",
                    location === item.href
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-foreground"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </a>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}

import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { AuthProvider } from "@/hooks/use-auth";
import { BlocklistProvider } from "@/hooks/use-blocklist";
import { TimerProvider } from "@/hooks/use-timer";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="light" storageKey="focusflow-theme">
      <AuthProvider>
        <BlocklistProvider>
          <TimerProvider>
            <App />
          </TimerProvider>
        </BlocklistProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

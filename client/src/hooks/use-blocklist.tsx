import { createContext, ReactNode, useContext } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { BlockedSite } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "./use-auth";

type BlocklistContextType = {
  blockedSites: BlockedSite[];
  isLoading: boolean;
  addSite: (domain: string) => void;
  toggleSite: (id: number, isEnabled: boolean) => void;
  deleteSite: (id: number) => void;
  isAddingSite: boolean;
  isUpdatingSite: boolean;
  isDeletingSite: boolean;
};

const BlocklistContext = createContext<BlocklistContextType | null>(null);

export function BlocklistProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const { user } = useAuth();

  // Get blocked sites
  const {
    data: blockedSites = [],
    isLoading,
  } = useQuery<BlockedSite[]>({
    queryKey: ["/api/blocked-sites"],
    enabled: !!user,
  });

  // Add site mutation
  const addSiteMutation = useMutation({
    mutationFn: async (domain: string) => {
      const res = await apiRequest("POST", "/api/blocked-sites", { domain });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blocked-sites"] });
      toast({
        title: "Site added",
        description: "The site has been added to your blocklist",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to add site",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Toggle site mutation
  const toggleSiteMutation = useMutation({
    mutationFn: async ({ id, isEnabled }: { id: number; isEnabled: boolean }) => {
      const res = await apiRequest("PATCH", `/api/blocked-sites/${id}`, { isEnabled });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blocked-sites"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update site",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete site mutation
  const deleteSiteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/blocked-sites/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blocked-sites"] });
      toast({
        title: "Site removed",
        description: "The site has been removed from your blocklist",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to remove site",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Actions
  const addSite = (domain: string) => {
    addSiteMutation.mutate(domain);
  };

  const toggleSite = (id: number, isEnabled: boolean) => {
    toggleSiteMutation.mutate({ id, isEnabled });
  };

  const deleteSite = (id: number) => {
    deleteSiteMutation.mutate(id);
  };

  return (
    <BlocklistContext.Provider
      value={{
        blockedSites,
        isLoading,
        addSite,
        toggleSite,
        deleteSite,
        isAddingSite: addSiteMutation.isPending,
        isUpdatingSite: toggleSiteMutation.isPending,
        isDeletingSite: deleteSiteMutation.isPending,
      }}
    >
      {children}
    </BlocklistContext.Provider>
  );
}

export function useBlocklist() {
  const context = useContext(BlocklistContext);
  if (!context) {
    throw new Error("useBlocklist must be used within a BlocklistProvider");
  }
  return context;
}

import { useBlocklist } from "@/hooks/use-blocklist";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Trash2, Globe } from "lucide-react";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function Blocklist() {
  const { blockedSites, isLoading, toggleSite, deleteSite } = useBlocklist();
  const [siteToDelete, setSiteToDelete] = useState<{id: number, domain: string} | null>(null);

  // Handle toggle site
  const handleToggleSite = (id: number, isEnabled: boolean) => {
    toggleSite(id, !isEnabled);
  };

  // Handle delete site
  const handleDeleteSite = () => {
    if (siteToDelete) {
      deleteSite(siteToDelete.id);
      setSiteToDelete(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-[70px] w-full rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {blockedSites.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground">
          <Globe className="mx-auto h-12 w-12 mb-3 opacity-30" />
          <h3 className="text-lg font-medium mb-1">No sites in your blocklist</h3>
          <p className="text-sm">Add websites that distract you to block them during focus time</p>
        </div>
      ) : (
        blockedSites.map((site) => (
          <div key={site.id} className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <Globe className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">{site.domain}</p>
                <p className="text-xs text-muted-foreground">
                  {site.isEnabled ? "Blocked during focus sessions" : "Currently disabled"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch 
                checked={site.isEnabled} 
                onCheckedChange={() => handleToggleSite(site.id, site.isEnabled)} 
              />
              <Button 
                variant="ghost" 
                size="icon"
                className="text-muted-foreground hover:text-destructive"
                onClick={() => setSiteToDelete({ id: site.id, domain: site.domain })}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))
      )}

      <AlertDialog open={!!siteToDelete} onOpenChange={(open) => !open && setSiteToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove from blocklist?</AlertDialogTitle>
            <AlertDialogDescription>
              {siteToDelete && `Are you sure you want to remove ${siteToDelete.domain} from your blocklist?`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteSite}
              className="bg-destructive hover:bg-destructive/90"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

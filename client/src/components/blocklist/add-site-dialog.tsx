import { useState } from "react";
import { useBlocklist } from "@/hooks/use-blocklist";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";

export default function AddSiteDialog() {
  const [open, setOpen] = useState(false);
  const [domain, setDomain] = useState("");
  const [error, setError] = useState("");
  const { addSite, isAddingSite } = useBlocklist();

  // Handle domain input change
  const handleDomainChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDomain(e.target.value);
    setError("");
  };

  // Handle add site
  const handleAddSite = () => {
    // Remove https:// or http:// if present
    let cleanDomain = domain.trim().toLowerCase();
    cleanDomain = cleanDomain.replace(/^https?:\/\//i, "");
    cleanDomain = cleanDomain.replace(/^www\./i, "");
    
    // Remove path after domain (everything after the first slash)
    cleanDomain = cleanDomain.split("/")[0];
    
    // Very basic domain validation
    if (!cleanDomain || !/^[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,}$/i.test(cleanDomain)) {
      setError("Please enter a valid domain (e.g. facebook.com)");
      return;
    }
    
    addSite(cleanDomain);
    setDomain("");
    setOpen(false);
  };

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAddSite();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-1">
          <Plus className="h-4 w-4" />
          <span>Add site</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add website to blocklist</DialogTitle>
          <DialogDescription>
            This site will be blocked during your focus sessions.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Input
            placeholder="Enter domain (e.g. facebook.com)"
            value={domain}
            onChange={handleDomainChange}
            onKeyPress={handleKeyPress}
            autoFocus
          />
          {error && <p className="text-sm text-destructive mt-1">{error}</p>}
          <p className="text-xs text-muted-foreground mt-2">
            Enter the domain without http:// or www. (e.g. facebook.com)
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleAddSite}
            disabled={isAddingSite || !domain.trim()}
          >
            {isAddingSite ? "Adding..." : "Add to blocklist"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

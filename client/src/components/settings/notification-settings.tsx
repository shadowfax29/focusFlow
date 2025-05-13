import { useQuery, useMutation } from "@tanstack/react-query";
import { NotificationSettings } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { Bell, Volume2 } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Label } from "@/components/ui/label";

export default function NotificationSettingsComponent() {
  const { toast } = useToast();

  // Get notification settings
  const { 
    data: settings, 
    isLoading,
  } = useQuery<NotificationSettings>({
    queryKey: ["/api/notification-settings"],
  });

  // Update notification settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async (updateData: Partial<NotificationSettings>) => {
      const res = await apiRequest("PATCH", "/api/notification-settings", updateData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notification-settings"] });
      toast({
        title: "Settings updated",
        description: "Your notification settings have been updated",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update settings",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle settings change
  const handleSettingChange = (setting: keyof NotificationSettings, value: boolean | number) => {
    updateSettingsMutation.mutate({ [setting]: value } as Partial<NotificationSettings>);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        Could not load notification settings
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Bell className="h-5 w-5 text-muted-foreground" />
          <div>
            <p className="font-medium">Session start</p>
            <p className="text-xs text-muted-foreground">Notification when focus time begins</p>
          </div>
        </div>
        <Switch 
          checked={settings.sessionStart} 
          onCheckedChange={(value) => handleSettingChange("sessionStart", value)} 
        />
      </div>
      
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Bell className="h-5 w-5 text-muted-foreground" />
          <div>
            <p className="font-medium">Break time</p>
            <p className="text-xs text-muted-foreground">Notification when break begins</p>
          </div>
        </div>
        <Switch 
          checked={settings.breakTime} 
          onCheckedChange={(value) => handleSettingChange("breakTime", value)} 
        />
      </div>
      
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Bell className="h-5 w-5 text-muted-foreground" />
          <div>
            <p className="font-medium">Session completion</p>
            <p className="text-xs text-muted-foreground">Notification when all pomodoros are done</p>
          </div>
        </div>
        <Switch 
          checked={settings.sessionCompletion} 
          onCheckedChange={(value) => handleSettingChange("sessionCompletion", value)} 
        />
      </div>
      
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Volume2 className="h-5 w-5 text-muted-foreground" />
          <div>
            <p className="font-medium">Sound alerts</p>
            <p className="text-xs text-muted-foreground">Play sound on events</p>
          </div>
        </div>
        <Switch 
          checked={settings.soundAlerts} 
          onCheckedChange={(value) => handleSettingChange("soundAlerts", value)} 
        />
      </div>
      
      <div className="mt-6">
        <Label htmlFor="volume" className="text-sm font-medium text-muted-foreground mb-2 block">
          Sound volume
        </Label>
        <Slider
          id="volume"
          min={0}
          max={100}
          step={1}
          value={[settings.volume]}
          onValueChange={(value) => handleSettingChange("volume", value[0])}
        />
      </div>
    </div>
  );
}

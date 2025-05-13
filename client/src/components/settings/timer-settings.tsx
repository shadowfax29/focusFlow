import { useQuery, useMutation } from "@tanstack/react-query";
import { TimerSettings } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import React from "react";
import { 
  Slider 
} from "@/components/ui/slider";
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel
} from "@/components/ui/form";
import { 
  Switch 
} from "@/components/ui/switch";
import { 
  Card,
  CardContent
} from "@/components/ui/card";
import { 
  Skeleton 
} from "@/components/ui/skeleton";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// Schema for form validation
const timerSettingsSchema = z.object({
  focusMinutes: z.number().min(1).max(120),
  shortBreakMinutes: z.number().min(1).max(30),
  longBreakMinutes: z.number().min(5).max(60),
  pomodorosUntilLongBreak: z.number().min(1).max(10),
  autoStartBreaks: z.boolean(),
  autoStartPomodoros: z.boolean()
});

export default function TimerSettingsComponent() {
  const { toast } = useToast();
  
  // Get timer settings
  const { 
    data: settings, 
    isLoading 
  } = useQuery<TimerSettings>({
    queryKey: ["/api/timer-settings"],
  });
  
  // Form setup
  const form = useForm<z.infer<typeof timerSettingsSchema>>({
    resolver: zodResolver(timerSettingsSchema),
    defaultValues: {
      focusMinutes: 25,
      shortBreakMinutes: 5,
      longBreakMinutes: 15,
      pomodorosUntilLongBreak: 4,
      autoStartBreaks: true,
      autoStartPomodoros: false
    }
  });
  
  // Update form values when settings are loaded
  React.useEffect(() => {
    if (settings) {
      form.reset({
        focusMinutes: settings.focusMinutes,
        shortBreakMinutes: settings.shortBreakMinutes,
        longBreakMinutes: settings.longBreakMinutes,
        pomodorosUntilLongBreak: settings.pomodorosUntilLongBreak,
        autoStartBreaks: settings.autoStartBreaks,
        autoStartPomodoros: settings.autoStartPomodoros
      });
    }
  }, [settings, form]);
  
  // Update timer settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async (updateData: Partial<TimerSettings>) => {
      const res = await apiRequest("PATCH", "/api/timer-settings", updateData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/timer-settings"] });
      toast({
        title: "Settings updated",
        description: "Your timer settings have been updated",
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
  const handleSettingChange = (setting: keyof TimerSettings, value: number | boolean) => {
    updateSettingsMutation.mutate({ [setting]: value } as Partial<TimerSettings>);
  };
  
  if (isLoading) {
    return (
      <div className="space-y-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
      </div>
    );
  }
  
  return (
    <Form {...form}>
      <form className="space-y-8">
        <FormField
          control={form.control}
          name="focusMinutes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Focus Duration: {field.value} minutes</FormLabel>
              <FormControl>
                <Slider
                  min={1}
                  max={120}
                  step={1}
                  value={[field.value]}
                  onValueChange={(values) => {
                    field.onChange(values[0]);
                    handleSettingChange("focusMinutes", values[0]);
                  }}
                />
              </FormControl>
              <FormDescription>
                Duration of each focus session (recommended: 25 minutes)
              </FormDescription>
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="shortBreakMinutes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Short Break Duration: {field.value} minutes</FormLabel>
              <FormControl>
                <Slider
                  min={1}
                  max={30}
                  step={1}
                  value={[field.value]}
                  onValueChange={(values) => {
                    field.onChange(values[0]);
                    handleSettingChange("shortBreakMinutes", values[0]);
                  }}
                />
              </FormControl>
              <FormDescription>
                Duration of short breaks between focus sessions (recommended: 5 minutes)
              </FormDescription>
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="longBreakMinutes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Long Break Duration: {field.value} minutes</FormLabel>
              <FormControl>
                <Slider
                  min={5}
                  max={60}
                  step={5}
                  value={[field.value]}
                  onValueChange={(values) => {
                    field.onChange(values[0]);
                    handleSettingChange("longBreakMinutes", values[0]);
                  }}
                />
              </FormControl>
              <FormDescription>
                Duration of long breaks after completing a set of Pomodoros (recommended: 15-30 minutes)
              </FormDescription>
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="pomodorosUntilLongBreak"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Pomodoros until Long Break: {field.value}</FormLabel>
              <FormControl>
                <Slider
                  min={1}
                  max={10}
                  step={1}
                  value={[field.value]}
                  onValueChange={(values) => {
                    field.onChange(values[0]);
                    handleSettingChange("pomodorosUntilLongBreak", values[0]);
                  }}
                />
              </FormControl>
              <FormDescription>
                Number of focus sessions to complete before a long break (recommended: 4)
              </FormDescription>
            </FormItem>
          )}
        />
        
        <div className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <FormField
                control={form.control}
                name="autoStartBreaks"
                render={({ field }) => (
                  <FormItem className="flex justify-between items-center space-y-0">
                    <div>
                      <FormLabel>Auto-start Breaks</FormLabel>
                      <FormDescription>
                        Automatically start break timer after a focus session ends
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={(checked) => {
                          field.onChange(checked);
                          handleSettingChange("autoStartBreaks", checked);
                        }}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <FormField
                control={form.control}
                name="autoStartPomodoros"
                render={({ field }) => (
                  <FormItem className="flex justify-between items-center space-y-0">
                    <div>
                      <FormLabel>Auto-start Pomodoros</FormLabel>
                      <FormDescription>
                        Automatically start next focus session after a break ends
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={(checked) => {
                          field.onChange(checked);
                          handleSettingChange("autoStartPomodoros", checked);
                        }}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        </div>
      </form>
    </Form>
  );
}

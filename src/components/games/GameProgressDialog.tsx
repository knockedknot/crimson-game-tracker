
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTabs,
  DialogTab,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Clock, Trophy, Plus, Check } from "lucide-react";

const progressFormSchema = z.object({
  hours_played: z.string()
    .refine(val => !isNaN(parseFloat(val)) && parseFloat(val) >= 0, "Must be a valid number")
    .transform(val => parseFloat(val)),
});

type ProgressFormValues = z.infer<typeof progressFormSchema>;

interface Achievement {
  id: string;
  name: string;
  description: string | null;
  xp_value: number;
  earned: boolean;
  achieved_at?: string;
}

interface GameProgressDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  gameData: {
    id: string;
    title: string;
    userGameId: string;
    hoursPlayed: number;
  };
  onSuccess?: () => void;
}

const GameProgressDialog = ({ 
  open, 
  onOpenChange, 
  gameData, 
  onSuccess 
}: GameProgressDialogProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("playtime");
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loadingAchievements, setLoadingAchievements] = useState(false);

  const form = useForm<ProgressFormValues>({
    resolver: zodResolver(progressFormSchema),
    defaultValues: {
      hours_played: gameData.hoursPlayed.toString(),
    },
  });

  const isSubmitting = form.formState.isSubmitting;

  // Fetch achievements for this game
  useEffect(() => {
    const fetchAchievements = async () => {
      if (!user || !open) return;
      
      setLoadingAchievements(true);
      
      try {
        // Get all achievements for this game
        const { data: gameAchievements, error } = await supabase
          .from("achievements")
          .select("*")
          .eq("game_id", gameData.id);
          
        if (error) throw error;
        
        // Get user's earned achievements for this game
        const { data: userAchievements, error: userError } = await supabase
          .from("user_achievements")
          .select("achievement_id, achieved_at")
          .eq("user_id", user.id);
          
        if (userError) throw userError;
        
        // Map achievements with earned status
        const mappedAchievements = gameAchievements.map(achievement => {
          const userAchievement = userAchievements?.find(
            ua => ua.achievement_id === achievement.id
          );
          
          return {
            ...achievement,
            earned: !!userAchievement,
            achieved_at: userAchievement?.achieved_at
          };
        });
        
        setAchievements(mappedAchievements);
      } catch (error) {
        console.error("Error fetching achievements:", error);
        toast({
          title: "Error",
          description: "Failed to load achievements.",
          variant: "destructive",
        });
      } finally {
        setLoadingAchievements(false);
      }
    };
    
    fetchAchievements();
  }, [user, gameData.id, open]);

  const onSubmitPlaytime = async (data: ProgressFormValues) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from("user_games")
        .update({
          hours_played: data.hours_played,
          last_played: new Date().toISOString(),
        })
        .eq("id", gameData.userGameId);

      if (error) throw error;
      
      toast({
        title: "Progress updated",
        description: `Playtime for ${gameData.title} updated to ${data.hours_played} hours.`,
      });
      
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error updating playtime:", error);
      toast({
        title: "Error",
        description: "There was a problem updating your progress.",
        variant: "destructive",
      });
    }
  };

  const toggleAchievement = async (achievement: Achievement) => {
    if (!user) return;
    
    try {
      if (achievement.earned) {
        // Remove achievement
        const { error } = await supabase
          .from("user_achievements")
          .delete()
          .eq("user_id", user.id)
          .eq("achievement_id", achievement.id);
          
        if (error) throw error;
        
        // Update local state
        setAchievements(achievements.map(a => 
          a.id === achievement.id ? { ...a, earned: false } : a
        ));
        
        toast({
          title: "Achievement removed",
          description: `"${achievement.name}" has been removed from your achievements.`,
        });
      } else {
        // Add achievement
        const { error } = await supabase
          .from("user_achievements")
          .insert({
            user_id: user.id,
            achievement_id: achievement.id,
            achieved_at: new Date().toISOString(),
          });
          
        if (error) throw error;
        
        // Update local state
        setAchievements(achievements.map(a => 
          a.id === achievement.id ? { ...a, earned: true } : a
        ));
        
        toast({
          title: "Achievement unlocked",
          description: `"${achievement.name}" has been added to your achievements.`,
        });
      }
      
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error toggling achievement:", error);
      toast({
        title: "Error",
        description: "There was a problem updating the achievement.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Update Game Progress</DialogTitle>
          <DialogDescription>
            Track your progress for {gameData.title}
          </DialogDescription>
        </DialogHeader>
        
        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab} 
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="playtime">
              <Clock className="mr-2 h-4 w-4" />
              Playtime
            </TabsTrigger>
            <TabsTrigger value="achievements">
              <Trophy className="mr-2 h-4 w-4" />
              Achievements
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="playtime" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Log Playtime</CardTitle>
                <CardDescription>
                  Update how many hours you've played
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmitPlaytime)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="hours_played"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Hours Played</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              step="0.1"
                              min="0"
                              placeholder="Enter hours played" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex justify-end space-x-2">
                      <Button 
                        type="submit" 
                        disabled={isSubmitting}
                      >
                        {isSubmitting && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Update Playtime
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="achievements" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Achievements</CardTitle>
                <CardDescription>
                  Track your achievements for this game
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingAchievements ? (
                  <div className="flex justify-center p-4">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : achievements.length > 0 ? (
                  <div className="space-y-3">
                    {achievements.map((achievement) => (
                      <div 
                        key={achievement.id} 
                        className="flex items-start justify-between rounded-lg border p-3"
                      >
                        <div>
                          <div className="flex items-center">
                            <h4 className="font-medium">{achievement.name}</h4>
                            <Badge 
                              className="ml-2" 
                              variant={achievement.earned ? "default" : "outline"}
                            >
                              {achievement.xp_value} XP
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {achievement.description || "No description"}
                          </p>
                          {achievement.earned && achievement.achieved_at && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Earned on {new Date(achievement.achieved_at).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                        <Button
                          size="sm"
                          variant={achievement.earned ? "default" : "outline"}
                          onClick={() => toggleAchievement(achievement)}
                        >
                          {achievement.earned ? (
                            <>
                              <Check className="mr-1 h-4 w-4" />
                              Earned
                            </>
                          ) : (
                            <>
                              <Plus className="mr-1 h-4 w-4" />
                              Mark as earned
                            </>
                          )}
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    No achievements found for this game.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default GameProgressDialog;

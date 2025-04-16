
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

const achievementFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  xp_value: z.coerce.number().min(0, "Must be a positive number"),
});

type AchievementFormValues = z.infer<typeof achievementFormSchema>;

interface AchievementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  gameId: string;
  achievement?: {
    id: string;
    name: string;
    description: string | null;
    xp_value: number;
  };
  onSuccess?: () => void;
}

const AchievementDialog = ({ 
  open, 
  onOpenChange, 
  gameId,
  achievement, 
  onSuccess 
}: AchievementDialogProps) => {
  const { toast } = useToast();
  const isEditing = !!achievement;

  const form = useForm<AchievementFormValues>({
    resolver: zodResolver(achievementFormSchema),
    defaultValues: {
      name: achievement?.name || "",
      description: achievement?.description || "",
      xp_value: achievement?.xp_value || 10,
    },
  });

  const isSubmitting = form.formState.isSubmitting;

  const onSubmit = async (data: AchievementFormValues) => {
    try {
      if (isEditing && achievement) {
        // Update existing achievement
        const { error } = await supabase
          .from("achievements")
          .update({
            name: data.name,
            description: data.description || null,
            xp_value: data.xp_value,
          })
          .eq("id", achievement.id);

        if (error) throw error;
        
        toast({
          title: "Achievement updated",
          description: `${data.name} was successfully updated.`,
        });
      } else {
        // Create new achievement
        const { error } = await supabase
          .from("achievements")
          .insert({
            game_id: gameId,
            name: data.name,
            description: data.description || null,
            xp_value: data.xp_value,
          });

        if (error) throw error;
        
        toast({
          title: "Achievement added",
          description: `${data.name} was successfully added.`,
        });
      }

      // Reset form and close dialog
      form.reset();
      onOpenChange(false);
      
      // Call onSuccess callback if provided
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error saving achievement:", error);
      toast({
        title: "Error",
        description: "There was a problem saving the achievement.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Achievement" : "Add New Achievement"}</DialogTitle>
          <DialogDescription>
            {isEditing 
              ? "Update the achievement details below." 
              : "Enter the details of the achievement you want to add."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter achievement name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter achievement description (optional)" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="xp_value"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>XP Value</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="Enter XP value" 
                      min="0"
                      {...field} 
                      onChange={(e) => {
                        const value = e.target.valueAsNumber;
                        field.onChange(!isNaN(value) ? value : 0);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {isEditing ? "Update" : "Add"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AchievementDialog;

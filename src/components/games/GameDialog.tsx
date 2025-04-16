
import React from "react";
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
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

const gameFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  platform: z.string().min(1, "Platform is required"),
  genre: z.string().min(1, "Genre is required"),
  publisher: z.string().optional(),
  release_year: z.string()
    .refine(val => !val || !isNaN(parseInt(val)), "Must be a valid year")
    .transform(val => val ? parseInt(val) : null)
    .optional(),
});

type GameFormValues = z.infer<typeof gameFormSchema>;

interface GameDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  game?: {
    id: string;
    title: string;
    platform: string;
    genre: string;
    publisher?: string | null;
    release_year?: number | null;
  };
  onSuccess?: () => void;
}

const GameDialog = ({ 
  open, 
  onOpenChange, 
  game, 
  onSuccess 
}: GameDialogProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const isEditing = !!game;

  const form = useForm<GameFormValues>({
    resolver: zodResolver(gameFormSchema),
    defaultValues: {
      title: game?.title || "",
      platform: game?.platform || "",
      genre: game?.genre || "",
      publisher: game?.publisher || "",
      release_year: game?.release_year ? String(game.release_year) : "",
    },
  });

  const isSubmitting = form.formState.isSubmitting;

  const onSubmit = async (data: GameFormValues) => {
    if (!user) return;

    try {
      if (isEditing && game) {
        // Update existing game
        const { error } = await supabase
          .from("games")
          .update({
            title: data.title,
            platform: data.platform,
            genre: data.genre,
            publisher: data.publisher || null,
            release_year: data.release_year,
          })
          .eq("id", game.id);

        if (error) throw error;
        
        toast({
          title: "Game updated",
          description: `${data.title} was successfully updated.`,
        });
      } else {
        // Create new game
        const { data: newGame, error } = await supabase
          .from("games")
          .insert({
            title: data.title,
            platform: data.platform,
            genre: data.genre,
            publisher: data.publisher || null,
            release_year: data.release_year,
          })
          .select()
          .single();

        if (error) throw error;

        // Add game to user's library with default values
        const { error: userGameError } = await supabase
          .from("user_games")
          .insert({
            user_id: user.id,
            game_id: newGame.id,
            status: "not_started",
            hours_played: 0,
          });

        if (userGameError) throw userGameError;
        
        toast({
          title: "Game added",
          description: `${data.title} was successfully added to your library.`,
        });
      }

      // Reset form and close dialog
      form.reset();
      onOpenChange(false);
      
      // Call onSuccess callback if provided
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error saving game:", error);
      toast({
        title: "Error",
        description: "There was a problem saving the game.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Game" : "Add New Game"}</DialogTitle>
          <DialogDescription>
            {isEditing 
              ? "Update the game details below." 
              : "Enter the details of the game you want to add."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter game title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="platform"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Platform</FormLabel>
                  <FormControl>
                    <Input placeholder="PC, PlayStation, Xbox, etc." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="genre"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Genre</FormLabel>
                  <FormControl>
                    <Input placeholder="RPG, Action, Strategy, etc." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="publisher"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Publisher</FormLabel>
                  <FormControl>
                    <Input placeholder="Publisher name (optional)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="release_year"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Release Year</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="Enter release year (optional)" 
                      {...field} 
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

export default GameDialog;

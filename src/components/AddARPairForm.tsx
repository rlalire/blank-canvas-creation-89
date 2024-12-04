import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

interface FormData {
  name: string;
  triggerFile: FileList;
  videoFile: FileList;
}

const AddARPairForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();
  
  const form = useForm<FormData>({
    defaultValues: {
      name: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      setIsLoading(true);
      
      const triggerFile = data.triggerFile[0];
      const videoFile = data.videoFile[0];
      
      if (!triggerFile || !videoFile) {
        toast.error("Veuillez sélectionner les deux fichiers");
        return;
      }

      // Upload trigger file
      const triggerPath = `${crypto.randomUUID()}.mind`;
      const { error: triggerError } = await supabase.storage
        .from("ar_triggers")
        .upload(triggerPath, triggerFile);

      if (triggerError) {
        throw new Error("Erreur lors de l'upload du trigger");
      }

      // Get trigger URL
      const { data: triggerUrl } = supabase.storage
        .from("ar_triggers")
        .getPublicUrl(triggerPath);

      // Upload video file
      const videoPath = `${crypto.randomUUID()}.${videoFile.name.split('.').pop()}`;
      const { error: videoError } = await supabase.storage
        .from("ar_assets")
        .upload(videoPath, videoFile);

      if (videoError) {
        throw new Error("Erreur lors de l'upload de la vidéo");
      }

      // Get video URL
      const { data: videoUrl } = supabase.storage
        .from("ar_assets")
        .getPublicUrl(videoPath);

      // Insert record in database
      const { error: dbError } = await supabase
        .from("ar_pairs")
        .insert({
          name: data.name,
          trigger_image_url: triggerUrl.publicUrl,
          asset_url: videoUrl.publicUrl,
          asset_type: "video",
          created_by: (await supabase.auth.getUser()).data.user?.id,
        });

      if (dbError) {
        throw new Error("Erreur lors de la sauvegarde des données");
      }

      toast.success("Paire AR créée avec succès");
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["ar_pairs"] });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nom</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Nom de la paire AR" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="triggerFile"
          render={({ field: { onChange, ...field } }) => (
            <FormItem>
              <FormLabel>Image Trigger (.mind)</FormLabel>
              <FormControl>
                <Input
                  type="file"
                  accept=".mind"
                  onChange={(e) => onChange(e.target.files)}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="videoFile"
          render={({ field: { onChange, ...field } }) => (
            <FormItem>
              <FormLabel>Vidéo</FormLabel>
              <FormControl>
                <Input
                  type="file"
                  accept="video/*"
                  onChange={(e) => onChange(e.target.files)}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Création en cours..." : "Créer la paire AR"}
        </Button>
      </form>
    </Form>
  );
};

export default AddARPairForm;
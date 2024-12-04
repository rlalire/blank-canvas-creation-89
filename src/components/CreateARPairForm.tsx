import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface FormData {
  title: string;
  targetImage: FileList | null;
  video: FileList | null;
}

const CreateARPairForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm<FormData>({
    defaultValues: {
      title: "",
      targetImage: null,
      video: null,
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      if (!data.targetImage?.[0] || !data.video?.[0]) {
        toast.error("Please select both a target image and a video");
        return;
      }

      setIsLoading(true);

      const targetImage = data.targetImage[0];
      const video = data.video[0];

      // Upload target image
      const targetImagePath = `targets/${Date.now()}-${targetImage.name}`;
      const { error: targetUploadError } = await supabase.storage
        .from("ar_assets")
        .upload(targetImagePath, targetImage);

      if (targetUploadError) throw targetUploadError;

      // Upload video
      const videoPath = `videos/${Date.now()}-${video.name}`;
      const { error: videoUploadError } = await supabase.storage
        .from("ar_assets")
        .upload(videoPath, video);

      if (videoUploadError) throw videoUploadError;

      // Create database entry
      const { error: dbError } = await supabase.from("ar_pairs").insert({
        title: data.title,
        target_image_path: targetImagePath,
        video_path: videoPath,
      });

      if (dbError) throw dbError;

      toast.success("AR pair created successfully");
      form.reset();
      onSuccess();
    } catch (error) {
      console.error("Error creating AR pair:", error);
      toast.error("Failed to create AR pair");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter a title" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="targetImage"
          render={({ field: { onChange, value, ...field } }) => (
            <FormItem>
              <FormLabel>Target Image (.mind file)</FormLabel>
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
          name="video"
          render={({ field: { onChange, value, ...field } }) => (
            <FormItem>
              <FormLabel>Video</FormLabel>
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
          {isLoading ? "Creating..." : "Create AR Pair"}
        </Button>
      </form>
    </Form>
  );
};

export default CreateARPairForm;
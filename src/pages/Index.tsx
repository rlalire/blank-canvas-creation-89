import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ARViewer from "@/components/ARViewer";
import ARPairsList from "@/components/ARPairsList";
import CreateARPairForm from "@/components/CreateARPairForm";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const [showAR, setShowAR] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const { data: arPairs, refetch } = useQuery({
    queryKey: ["ar-pairs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ar_pairs")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Transform the data to include full URLs
      return data.map((pair) => ({
        id: pair.id,
        title: pair.title,
        targetImage: pair.target_image_path,
        video: supabase.storage
          .from("ar_assets")
          .getPublicUrl(pair.video_path).data.publicUrl,
      }));
    },
  });

  if (showAR && arPairs) {
    return <ARViewer pairs={arPairs} onClose={() => setShowAR(false)} />;
  }

  return (
    <div className="container mx-auto p-4 min-h-screen">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Expérience de Réalité Augmentée</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <p className="text-muted-foreground">
              Pointez votre caméra vers l'image cible pour voir le contenu en
              réalité augmentée.
            </p>
            <div className="flex gap-4">
              <Button onClick={() => setShowAR(true)} className="flex-1">
                Lancer l'expérience AR
              </Button>
              <Button
                onClick={() => setShowCreateForm(!showCreateForm)}
                variant="outline"
                className="flex-1"
              >
                {showCreateForm ? "Masquer le formulaire" : "Créer une paire AR"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {showCreateForm && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Créer une nouvelle paire AR</CardTitle>
          </CardHeader>
          <CardContent>
            <CreateARPairForm onSuccess={() => refetch()} />
          </CardContent>
        </Card>
      )}

      {arPairs && <ARPairsList pairs={arPairs} />}
    </div>
  );
};

export default Index;
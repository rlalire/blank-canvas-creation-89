import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ARViewer from "@/components/ARViewer";
import ARPairsList from "@/components/ARPairsList";
import AddARPairForm from "@/components/AddARPairForm";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const [showAR, setShowAR] = useState(false);

  const { data: arPairs = [], isLoading } = useQuery({
    queryKey: ["ar_pairs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ar_pairs")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data.map(pair => ({
        id: pair.id,
        targetImage: pair.trigger_image_url,
        video: pair.asset_url,
        title: pair.name
      }));
    }
  });

  if (showAR) {
    return <ARViewer pairs={arPairs} onClose={() => setShowAR(false)} />;
  }

  return (
    <div className="container mx-auto p-4 min-h-screen">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Expérience de Réalité Augmentée</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Pointez votre caméra vers l'image cible pour voir le contenu en réalité augmentée.
          </p>
          <Button onClick={() => setShowAR(true)} className="w-full">
            Lancer l'expérience AR
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Ajouter une nouvelle paire AR</CardTitle>
          </CardHeader>
          <CardContent>
            <AddARPairForm />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Paires AR existantes</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p>Chargement...</p>
            ) : (
              <ARPairsList pairs={arPairs} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
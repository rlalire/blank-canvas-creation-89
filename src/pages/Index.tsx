import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ARViewer from "@/components/ARViewer";
import ARPairsList from "@/components/ARPairsList";

const Index = () => {
  const [showAR, setShowAR] = useState(false);
  const [arPairs] = useState([
    {
      id: 1,
      targetImage: "/assets/patterns/target.mind",
      video: "/assets/videos/video.mp4",
      title: "Démo AR"
    }
  ]);

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
      
      <ARPairsList pairs={arPairs} />
    </div>
  );
};

export default Index;
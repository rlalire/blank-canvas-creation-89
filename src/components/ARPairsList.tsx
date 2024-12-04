import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ARPair {
  id: string;  // Changed from number to string to match Supabase's UUID
  targetImage: string;
  video: string;
  title: string;
}

interface ARPairsListProps {
  pairs: ARPair[];
}

const ARPairsList = ({ pairs }: ARPairsListProps) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {pairs.map((pair) => (
        <Card key={pair.id}>
          <CardHeader>
            <CardTitle>{pair.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="aspect-video bg-muted rounded-lg overflow-hidden">
              <video
                src={pair.video}
                className="w-full h-full object-cover"
                playsInline
                muted
                loop
              />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ARPairsList;
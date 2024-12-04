import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface ARPair {
  id: number;
  targetImage: string;
  video: string;
  title: string;
}

interface ARViewerProps {
  pairs: ARPair[];
  onClose: () => void;
}

const ARViewer = ({ pairs, onClose }: ARViewerProps) => {
  useEffect(() => {
    const loadScripts = async () => {
      try {
        console.log("Starting to load AR scripts...");
        
        // Load A-Frame first
        const aframeScript = document.createElement("script");
        aframeScript.src = "https://aframe.io/releases/1.6.0/aframe.min.js";
        aframeScript.crossOrigin = "anonymous";
        
        const aframeLoaded = new Promise((resolve, reject) => {
          aframeScript.onload = () => {
            console.log("A-Frame loaded successfully");
            resolve(true);
          };
          aframeScript.onerror = (error) => {
            console.error("Error loading A-Frame:", error);
            reject(new Error("Failed to load A-Frame"));
          };
        });

        document.head.appendChild(aframeScript);
        await aframeLoaded;

        // Load MindAR after A-Frame
        const mindarScript = document.createElement("script");
        mindarScript.src = "https://cdn.jsdelivr.net/npm/mind-ar@1.2.5/dist/mindar-image-aframe.prod.js";
        mindarScript.crossOrigin = "anonymous";
        
        const mindarLoaded = new Promise((resolve, reject) => {
          mindarScript.onload = () => {
            console.log("MindAR loaded successfully");
            resolve(true);
          };
          mindarScript.onerror = (error) => {
            console.error("Error loading MindAR:", error);
            reject(new Error("Failed to load MindAR"));
          };
        });

        document.head.appendChild(mindarScript);
        await mindarLoaded;

        console.log("All AR scripts loaded successfully");
      } catch (error) {
        console.error("Error in loadScripts:", error);
        toast({
          title: "Error",
          description: "Failed to load AR components. Please try again.",
          variant: "destructive",
        });
        onClose();
      }
    };

    loadScripts();

    return () => {
      console.log("Cleaning up AR scripts...");
      // Clean up scripts when component unmounts
      const scripts = document.querySelectorAll("script");
      scripts.forEach(script => {
        if (script.src.includes("aframe") || script.src.includes("mind-ar")) {
          script.remove();
        }
      });
    };
  }, [onClose]);

  useEffect(() => {
    const setupAREvents = () => {
      console.log("Setting up AR events...");
      const sceneEl = document.querySelector("a-scene");
      const videos = document.querySelectorAll("video");

      if (sceneEl) {
        sceneEl.addEventListener("targetFound", () => {
          console.log("Target found, playing videos");
          videos.forEach(video => video.play());
        });

        sceneEl.addEventListener("targetLost", () => {
          console.log("Target lost, pausing videos");
          videos.forEach(video => video.pause());
        });
      }
    };

    const checkScriptsLoaded = setInterval(() => {
      if (window.AFRAME && window.MINDAR) {
        console.log("Scripts detected as loaded, setting up events");
        setupAREvents();
        clearInterval(checkScriptsLoaded);
      }
    }, 100);

    return () => clearInterval(checkScriptsLoaded);
  }, []);

  const handleClose = () => {
    // Pause all videos before closing
    const videos = document.querySelectorAll("video");
    videos.forEach(video => video.pause());
    
    // Clean up A-Frame scene
    const scene = document.querySelector("a-scene");
    if (scene) {
      scene.parentNode?.removeChild(scene);
    }
    
    // Call the onClose prop
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black">
      <Button
        variant="outline"
        size="icon"
        className="fixed top-4 right-4 z-50 bg-white hover:bg-gray-100"
        onClick={handleClose}
      >
        <X className="h-4 w-4" />
      </Button>

      <a-scene
        mindar-image={`imageTargetSrc: ${pairs[0].targetImage};`}
        vr-mode-ui="enabled: false"
        device-orientation-permission-ui="enabled: false"
        className="fixed inset-0"
      >
        <a-assets>
          {pairs.map((pair) => (
            <video
              key={pair.id}
              id={`video-${pair.id}`}
              src={pair.video}
              preload="auto"
              loop
              crossOrigin="anonymous"
              playsInline
            ></video>
          ))}
        </a-assets>

        <a-camera position="0 0 0" look-controls="enabled: false"></a-camera>

        {pairs.map((pair, index) => (
          <a-entity key={pair.id} mindar-image-target={`targetIndex: ${index}`}>
            <a-video
              src={`#video-${pair.id}`}
              position="0 0 0"
              width="1"
              height="0.5625"
              rotation="0 0 0"
            ></a-video>
          </a-entity>
        ))}
      </a-scene>
    </div>
  );
};

export default ARViewer;
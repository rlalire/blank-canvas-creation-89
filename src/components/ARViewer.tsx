import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

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

declare global {
  interface Window {
    AFRAME: any;
    MINDAR: any;
  }
}

const ARViewer = ({ pairs, onClose }: ARViewerProps) => {
  useEffect(() => {
    // Injecter les scripts nécessaires
    const loadScripts = async () => {
      console.log("Loading scripts...");
      const aframeScript = document.createElement("script");
      aframeScript.src = "https://aframe.io/releases/1.6.0/aframe.min.js";
      document.head.appendChild(aframeScript);

      await new Promise(resolve => aframeScript.onload = resolve);
      console.log("A-Frame loaded");

      const mindarScript = document.createElement("script");
      mindarScript.src = "https://cdn.jsdelivr.net/npm/mind-ar@1.2.5/dist/mindar-image-aframe.prod.js";
      document.head.appendChild(mindarScript);
      
      await new Promise(resolve => mindarScript.onload = resolve);
      console.log("MindAR loaded");
    };

    loadScripts();

    return () => {
      console.log("Cleaning up scripts...");
      const scripts = document.querySelectorAll("script");
      scripts.forEach(script => {
        if (script.src.includes("aframe") || script.src.includes("mind-ar")) {
          script.remove();
        }
      });
    };
  }, []);

  useEffect(() => {
    // Configurer les événements AR après le chargement des scripts
    const setupAREvents = () => {
      console.log("Setting up AR events...");
      const sceneEl = document.querySelector("a-scene");
      const videos = document.querySelectorAll("video");

      if (sceneEl) {
        sceneEl.addEventListener("targetFound", () => {
          console.log("Target found!");
          videos.forEach(video => video.play());
        });

        sceneEl.addEventListener("targetLost", () => {
          console.log("Target lost!");
          videos.forEach(video => video.pause());
        });
      }
    };

    // Attendre que les scripts soient chargés
    const checkScriptsLoaded = setInterval(() => {
      if (window.AFRAME && window.MINDAR) {
        console.log("Scripts loaded, setting up AR...");
        setupAREvents();
        clearInterval(checkScriptsLoaded);
      }
    }, 100);

    return () => clearInterval(checkScriptsLoaded);
  }, []);

  console.log("AR Pairs:", pairs);
  console.log("Target Image URL:", pairs[0]?.targetImage);

  return (
    <div className="fixed inset-0 bg-black">
      <Button
        variant="outline"
        size="icon"
        className="fixed top-4 right-4 z-50"
        onClick={onClose}
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
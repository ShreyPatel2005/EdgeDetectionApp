
import { useEffect, RefObject, useState } from "react";
import { Card } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

interface CameraStreamProps {
  videoRef: RefObject<HTMLVideoElement>;
}

const CameraStream = ({ videoRef }: CameraStreamProps) => {
  const [isCameraActive, setIsCameraActive] = useState(false);

  useEffect(() => {
    // Check if the camera is active by monitoring the video element
    const video = videoRef.current;
    if (!video) return;

    const checkCameraActive = () => {
      // If video has dimensions and is playing, camera is active
      if (video.videoWidth > 0 && video.videoHeight > 0 && !video.paused) {
        setIsCameraActive(true);
      }
    };

    // Add listeners for video events that might indicate camera is active
    video.addEventListener('loadedmetadata', checkCameraActive);
    video.addEventListener('playing', checkCameraActive);
    
    // Regular interval check as a fallback
    const intervalCheck = setInterval(checkCameraActive, 1000);

    return () => {
      video.removeEventListener('loadedmetadata', checkCameraActive);
      video.removeEventListener('playing', checkCameraActive);
      clearInterval(intervalCheck);
    };
  }, [videoRef]);

  return (
    <div className="space-y-4">
      <div className="relative">
        {/* Camera video element */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-auto rounded-md max-h-[400px] object-contain bg-black"
        />
        
        {/* Overlay with instructions when camera is not yet started */}
        {!isCameraActive && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-md pointer-events-none">
            <div className="text-white text-center p-4">
              <AlertTriangle size={40} className="mx-auto mb-2" />
              <p>Camera starting...</p>
              <p className="text-sm opacity-80 mt-2">
                Please allow camera access when prompted
              </p>
            </div>
          </div>
        )}
      </div>
      
      <div className="text-center text-sm text-muted-foreground">
        <p>Edge detection will be applied in real-time to the camera feed</p>
      </div>
    </div>
  );
};

export default CameraStream;

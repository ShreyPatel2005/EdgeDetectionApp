
import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ImageUploader from "@/components/ImageUploader";
import CameraStream from "@/components/CameraStream";
import EdgeDetectionControls from "@/components/EdgeDetectionControls";
import { toast } from "sonner";
import { useEdgeDetection } from "@/hooks/use-edge-detection";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

type InputMode = "upload" | "camera";

const EdgeDetectionApp = () => {
  const [inputMode, setInputMode] = useState<InputMode>("upload");
  const [inputImage, setInputImage] = useState<HTMLImageElement | null>(null);
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const outputCanvasRef = useRef<HTMLCanvasElement>(null);

  const {
    algorithm,
    setAlgorithm,
    kernelSize,
    setKernelSize,
    threshold,
    setThreshold,
    sigma,
    setSigma,
    quality,
    setQuality,
    processImage,
    processCameraFrame,
    isProcessingFrame
  } = useEdgeDetection();

  useEffect(() => {
    let animationFrameId: number;
    let processingInterval: NodeJS.Timeout;

    const processVideoFrame = async () => {
      if (!videoRef.current || !canvasRef.current || !outputCanvasRef.current || !videoStream) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      if (!ctx) return;

      // Make sure video has dimensions before proceeding
      if (video.videoWidth === 0 || video.videoHeight === 0) {
        animationFrameId = requestAnimationFrame(processVideoFrame);
        return;
      }

      // Set canvas dimensions based on quality setting
      const width = quality;
      const height = (video.videoHeight / video.videoWidth) * width;

      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        outputCanvasRef.current.width = width;
        outputCanvasRef.current.height = height;
      }

      // Draw the current video frame
      ctx.drawImage(video, 0, 0, width, height);

      // Process the frame if we're not already processing another one
      if (!isProcessingFrame && inputMode === "camera") {
        await processCameraFrame(canvas, outputCanvasRef.current);
      }

      // Request the next frame
      animationFrameId = requestAnimationFrame(processVideoFrame);
    };

    if (inputMode === "camera" && videoStream && videoRef.current) {
      videoRef.current.srcObject = videoStream;
      animationFrameId = requestAnimationFrame(processVideoFrame);
    }

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      if (processingInterval) {
        clearInterval(processingInterval);
      }
    };
  }, [videoStream, inputMode, quality, processCameraFrame, isProcessingFrame]);

  const handleImageUpload = (image: HTMLImageElement) => {
    setInputImage(image);
    if (canvasRef.current && outputCanvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        // Ensure image has dimensions before proceeding
        if (image.width === 0 || image.height === 0) {
          toast.error("Image has no dimensions. Please try another image.");
          return;
        }
        
        // Set canvas size based on quality but maintain aspect ratio
        const width = quality;
        const height = (image.height / image.width) * width;
        
        canvas.width = width;
        canvas.height = height;
        outputCanvasRef.current.width = width;
        outputCanvasRef.current.height = height;
        
        ctx.drawImage(image, 0, 0, width, height);
        
        // Process the image
        processImage(canvas, outputCanvasRef.current)
          .then(() => toast.success("Image processed successfully!"))
          .catch((err) => {
            console.error("Error processing image:", err);
            toast.error("Failed to process image. Please try again.");
          });
      }
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      setVideoStream(stream);
      toast.success("Camera started successfully!");
    } catch (error) {
      console.error("Error accessing camera:", error);
      toast.error("Failed to access camera. Please check permissions.");
    }
  };

  const stopCamera = () => {
    if (videoStream) {
      videoStream.getTracks().forEach(track => track.stop());
      setVideoStream(null);
    }
  };

  useEffect(() => {
    // When switching to camera mode, start the camera
    if (inputMode === "camera") {
      startCamera();
    } else {
      // When switching away from camera mode, stop it
      stopCamera();
    }

    return () => {
      // Clean up on component unmount
      stopCamera();
    };
  }, [inputMode]);

  const downloadProcessedImage = () => {
    if (outputCanvasRef.current) {
      const link = document.createElement('a');
      link.download = 'edge-detection-result.png';
      link.href = outputCanvasRef.current.toDataURL('image/png');
      link.click();
      toast.success("Image downloaded successfully!");
    }
  };

  // Re-process the image when algorithm parameters change
  useEffect(() => {
    if (inputMode === "upload" && inputImage && canvasRef.current && outputCanvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        // Make sure canvases have proper dimensions
        if (canvasRef.current.width === 0 || canvasRef.current.height === 0) {
          const width = quality;
          const height = (inputImage.height / inputImage.width) * width;
          
          canvasRef.current.width = width;
          canvasRef.current.height = height;
          outputCanvasRef.current.width = width;
          outputCanvasRef.current.height = height;
        }
        
        ctx.drawImage(inputImage, 0, 0, canvasRef.current.width, canvasRef.current.height);
        processImage(canvasRef.current, outputCanvasRef.current)
          .catch(err => console.error("Error reprocessing image:", err));
      }
    }
  }, [algorithm, kernelSize, threshold, sigma, quality, inputImage, processImage, inputMode]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {/* Left sidebar with controls */}
      <div className="md:col-span-1">
        <Card className="h-full">
          <CardContent className="pt-6">
            <EdgeDetectionControls 
              algorithm={algorithm}
              setAlgorithm={setAlgorithm}
              kernelSize={kernelSize}
              setKernelSize={setKernelSize}
              threshold={threshold}
              setThreshold={setThreshold}
              sigma={sigma}
              setSigma={setSigma}
              quality={quality}
              setQuality={setQuality}
            />
          </CardContent>
        </Card>
      </div>
      
      {/* Main content area */}
      <div className="md:col-span-3">
        <Card className="mb-4">
          <CardContent className="p-6">
            <Tabs defaultValue="upload" onValueChange={(value) => setInputMode(value as InputMode)}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="upload">Upload Image</TabsTrigger>
                <TabsTrigger value="camera">Use Camera</TabsTrigger>
              </TabsList>
              
              <TabsContent value="upload">
                <ImageUploader onImageUpload={handleImageUpload} />
              </TabsContent>
              
              <TabsContent value="camera">
                <CameraStream videoRef={videoRef} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        
        <div className="grid grid-cols-1 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Edge Detection Output</h3>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="gap-2"
                  onClick={downloadProcessedImage}
                  disabled={!outputCanvasRef.current}
                >
                  <Download size={16} />
                  Download
                </Button>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="border rounded-lg p-2">
                  <h4 className="text-sm font-medium text-muted-foreground mb-2 text-center">Original</h4>
                  <div className="video-container flex justify-center">
                    <canvas 
                      ref={canvasRef}
                      className="rounded-md max-h-[400px] w-auto"
                    />
                  </div>
                </div>
                
                <div className="border rounded-lg p-2">
                  <h4 className="text-sm font-medium text-muted-foreground mb-2 text-center">Processed</h4>
                  <div className="video-container flex justify-center">
                    <canvas 
                      ref={outputCanvasRef}
                      className="rounded-md max-h-[400px] w-auto"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EdgeDetectionApp;

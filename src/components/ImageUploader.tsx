
import { useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Image } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface ImageUploaderProps {
  onImageUpload: (image: HTMLImageElement) => void;
}

const ImageUploader = ({ onImageUpload }: ImageUploaderProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.match(/^image\//)) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file (JPEG, PNG, etc.)",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setPreviewUrl(e.target.result as string);
        
        const img = new Image();
        img.onload = () => {
          onImageUpload(img);
        };
        img.src = e.target.result as string;
      }
    };
    reader.readAsDataURL(file);
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInput}
        accept="image/*"
        className="hidden"
      />

      {!previewUrl ? (
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragging
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/20 hover:border-muted-foreground/50"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleFileDrop}
        >
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="rounded-full bg-primary/10 p-4">
              <Upload size={36} className="text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-medium">Drop your image here</h3>
              <p className="text-sm text-muted-foreground mt-1">
                or click to browse files
              </p>
            </div>
            <Button onClick={handleButtonClick} variant="outline">
              Choose Image
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-center">
            <img
              src={previewUrl}
              alt="Preview"
              className="max-h-[400px] rounded-md object-contain"
            />
          </div>
          <div className="flex justify-center space-x-2">
            <Button onClick={() => setPreviewUrl(null)} variant="outline">
              Choose Another Image
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;

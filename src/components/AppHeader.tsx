
import { Github } from "lucide-react";
import { Button } from "@/components/ui/button";

const AppHeader = () => {
  return (
    <header className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-edge-blue-600 to-edge-blue-400 bg-clip-text text-transparent">
          Edge Detection App
        </h1>
        <p className="text-muted-foreground mt-1">
          Application of Laplace and Sobel Algorithm For Edge Detection
        </p>
      </div>
      
      <div className="flex space-x-2">
        <Button variant="outline" size="sm" className="gap-2" asChild>
          <a href="https://github.com/ShreyPatel2005/EdgeDetectionApp" target="_blank" rel="noreferrer">
            <Github size={16} />
            <span>GitHub</span>
          </a>
        </Button>
      </div>
    </header>
  );
};

export default AppHeader;

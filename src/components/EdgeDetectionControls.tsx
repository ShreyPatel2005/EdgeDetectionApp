
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlgorithmType } from "@/types/edge-detection";

interface EdgeDetectionControlsProps {
  algorithm: AlgorithmType;
  setAlgorithm: (algorithm: AlgorithmType) => void;
  kernelSize: number;
  setKernelSize: (size: number) => void;
  threshold: number;
  setThreshold: (threshold: number) => void;
  sigma: number;
  setSigma: (sigma: number) => void;
  quality: number;
  setQuality: (quality: number) => void;
}

const EdgeDetectionControls = ({
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
}: EdgeDetectionControlsProps) => {
  // Options for kernel sizes (must be odd numbers for image convolution)
  const kernelSizeOptions = [3, 5, 7, 9, 11];
  
  // Quality options
  const qualityOptions = [
    { value: 320, label: "Low (320px)" },
    { value: 640, label: "Medium (640px)" },
    { value: 960, label: "High (960px)" },
    { value: 1280, label: "Very High (1280px)" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-3">Edge Detection Settings</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="algorithm">Algorithm</Label>
            <RadioGroup
              id="algorithm"
              value={algorithm}
              onValueChange={(value) => setAlgorithm(value as AlgorithmType)}
              className="flex flex-col space-y-1"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="sobel" id="sobel" />
                <Label htmlFor="sobel" className="font-normal">Sobel</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="laplacian" id="laplacian" />
                <Label htmlFor="laplacian" className="font-normal">Laplacian</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="kernelSize">Kernel Size</Label>
              <span className="text-sm text-muted-foreground">{kernelSize}x{kernelSize}</span>
            </div>
            <Select
              value={kernelSize.toString()}
              onValueChange={(value) => setKernelSize(Number(value))}
            >
              <SelectTrigger id="kernelSize" className="w-full">
                <SelectValue placeholder="Select kernel size" />
              </SelectTrigger>
              <SelectContent>
                {kernelSizeOptions.map((size) => (
                  <SelectItem key={size} value={size.toString()}>
                    {size}x{size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="threshold">Threshold</Label>
              <span className="text-sm text-muted-foreground">{threshold}</span>
            </div>
            <Slider
              id="threshold"
              min={0}
              max={255}
              step={1}
              value={[threshold]}
              onValueChange={(values) => setThreshold(values[0])}
              className="parameter-slider"
            />
          </div>

          {algorithm === "laplacian" && (
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="sigma">Gaussian Sigma</Label>
                <span className="text-sm text-muted-foreground">{sigma.toFixed(1)}</span>
              </div>
              <Slider
                id="sigma"
                min={0.1}
                max={5.0}
                step={0.1}
                value={[sigma]}
                onValueChange={(values) => setSigma(values[0])}
                className="parameter-slider"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="quality">Image Quality</Label>
            <Select
              value={quality.toString()}
              onValueChange={(value) => setQuality(Number(value))}
            >
              <SelectTrigger id="quality" className="w-full">
                <SelectValue placeholder="Select quality" />
              </SelectTrigger>
              <SelectContent>
                {qualityOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value.toString()}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="pt-4 border-t">
        <h4 className="text-sm font-medium mb-2">How to use</h4>
        <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
          <li>Upload an image or use your camera</li>
          <li>Choose between Sobel and Laplacian algorithms</li>
          <li>Adjust parameters to control the edge detection</li>
          <li>Download the processed result</li>
        </ul>
      </div>
    </div>
  );
};

export default EdgeDetectionControls;

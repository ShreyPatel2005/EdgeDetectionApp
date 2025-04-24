
import { useState, useCallback } from "react";
import { AlgorithmType } from "@/types/edge-detection";

export function useEdgeDetection() {
  const [algorithm, setAlgorithm] = useState<AlgorithmType>("sobel");
  const [kernelSize, setKernelSize] = useState<number>(3);
  const [threshold, setThreshold] = useState<number>(30);
  const [sigma, setSigma] = useState<number>(1.4);
  const [quality, setQuality] = useState<number>(640);
  const [isProcessingFrame, setIsProcessingFrame] = useState<boolean>(false);

  // Helper function to apply grayscale conversion
  const toGrayscale = useCallback((imgData: ImageData): ImageData => {
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
      const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
      data[i] = avg;     // red
      data[i + 1] = avg; // green
      data[i + 2] = avg; // blue
    }
    return imgData;
  }, []);

  // Gaussian blur function
  const gaussianBlur = useCallback((imgData: ImageData, sigma: number): ImageData => {
    // Create a copy of the image data
    const width = imgData.width;
    const height = imgData.height;
    const data = imgData.data;
    const output = new Uint8ClampedArray(data.length);
    
    // Calculate kernel size based on sigma (typically 6*sigma)
    const kernelSize = Math.ceil(sigma * 6);
    const kernelRadius = Math.floor(kernelSize / 2);
    
    // Create gaussian kernel
    const kernel: number[] = [];
    const twoSigmaSquare = 2 * sigma * sigma;
    const sqrtTwoPiSigma = Math.sqrt(2 * Math.PI) * sigma;
    let sum = 0;
    
    for (let x = -kernelRadius; x <= kernelRadius; x++) {
      const expVal = Math.exp(-(x * x) / twoSigmaSquare);
      const kernelVal = expVal / sqrtTwoPiSigma;
      kernel.push(kernelVal);
      sum += kernelVal;
    }
    
    // Normalize the kernel
    for (let i = 0; i < kernel.length; i++) {
      kernel[i] /= sum;
    }
    
    const tempData = new Uint8ClampedArray(data.length);
    
    // Horizontal pass
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let r = 0, g = 0, b = 0, a = 0;
        
        for (let kx = -kernelRadius; kx <= kernelRadius; kx++) {
          const px = Math.min(width - 1, Math.max(0, x + kx));
          const i = (y * width + px) * 4;
          const weight = kernel[kx + kernelRadius];
          
          r += data[i] * weight;
          g += data[i + 1] * weight;
          b += data[i + 2] * weight;
          a += data[i + 3] * weight;
        }
        
        const idx = (y * width + x) * 4;
        tempData[idx] = r;
        tempData[idx + 1] = g;
        tempData[idx + 2] = b;
        tempData[idx + 3] = a;
      }
    }
    
    // Vertical pass
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let r = 0, g = 0, b = 0, a = 0;
        
        for (let ky = -kernelRadius; ky <= kernelRadius; ky++) {
          const py = Math.min(height - 1, Math.max(0, y + ky));
          const i = (py * width + x) * 4;
          const weight = kernel[ky + kernelRadius];
          
          r += tempData[i] * weight;
          g += tempData[i + 1] * weight;
          b += tempData[i + 2] * weight;
          a += tempData[i + 3] * weight;
        }
        
        const idx = (y * width + x) * 4;
        output[idx] = r;
        output[idx + 1] = g;
        output[idx + 2] = b;
        output[idx + 3] = a;
      }
    }
    
    return new ImageData(output, width, height);
  }, []);

  // Sobel edge detection
  const applySobel = useCallback((imgData: ImageData, size: number, threshold: number): ImageData => {
    const width = imgData.width;
    const height = imgData.height;
    const data = imgData.data;
    const result = new Uint8ClampedArray(data.length);
    
    // Define Sobel kernels
    let kernelX: number[][] = [];
    let kernelY: number[][] = [];
    
    if (size === 3) {
      kernelX = [[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]];
      kernelY = [[-1, -2, -1], [0, 0, 0], [1, 2, 1]];
    } else if (size === 5) {
      kernelX = [
        [-1, -2, 0, 2, 1],
        [-4, -8, 0, 8, 4],
        [-6, -12, 0, 12, 6],
        [-4, -8, 0, 8, 4],
        [-1, -2, 0, 2, 1]
      ];
      kernelY = [
        [-1, -4, -6, -4, -1],
        [-2, -8, -12, -8, -2],
        [0, 0, 0, 0, 0],
        [2, 8, 12, 8, 2],
        [1, 4, 6, 4, 1]
      ];
    } else {
      // For larger kernel sizes, use dynamic generation (simplified here)
      const halfSize = Math.floor(size / 2);
      kernelX = Array(size).fill(0).map(() => Array(size).fill(0));
      kernelY = Array(size).fill(0).map(() => Array(size).fill(0));
      
      for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
          const x = j - halfSize;
          const y = i - halfSize;
          const dist = Math.sqrt(x * x + y * y);
          
          if (dist <= halfSize) {
            kernelX[i][j] = x === 0 ? 0 : x / dist * Math.abs(x);
            kernelY[i][j] = y === 0 ? 0 : y / dist * Math.abs(y);
          }
        }
      }
    }
    
    const halfSize = Math.floor(size / 2);
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let pixelX = 0;
        let pixelY = 0;
        
        // Apply the kernel
        for (let ky = -halfSize; ky <= halfSize; ky++) {
          for (let kx = -halfSize; kx <= halfSize; kx++) {
            const pixelY0 = Math.min(height - 1, Math.max(0, y + ky));
            const pixelX0 = Math.min(width - 1, Math.max(0, x + kx));
            const idx = (pixelY0 * width + pixelX0) * 4;
            const pixelValue = data[idx];
            
            pixelX += pixelValue * kernelX[ky + halfSize][kx + halfSize];
            pixelY += pixelValue * kernelY[ky + halfSize][kx + halfSize];
          }
        }
        
        // Calculate magnitude
        let magnitude = Math.sqrt(pixelX * pixelX + pixelY * pixelY);
        
        // Apply threshold
        magnitude = magnitude < threshold ? 0 : magnitude;
        magnitude = Math.min(255, magnitude);
        
        // Set the result
        const idx = (y * width + x) * 4;
        result[idx] = magnitude;
        result[idx + 1] = magnitude;
        result[idx + 2] = magnitude;
        result[idx + 3] = 255;
      }
    }
    
    return new ImageData(result, width, height);
  }, []);

  // Laplacian edge detection
  const applyLaplacian = useCallback((imgData: ImageData, size: number, threshold: number): ImageData => {
    const width = imgData.width;
    const height = imgData.height;
    const data = imgData.data;
    const result = new Uint8ClampedArray(data.length);
    
    // Define Laplacian kernels (different sizes)
    let kernel: number[][] = [];
    
    if (size === 3) {
      kernel = [[0, 1, 0], [1, -4, 1], [0, 1, 0]];
    } else if (size === 5) {
      kernel = [
        [0, 0, 1, 0, 0],
        [0, 1, 2, 1, 0],
        [1, 2, -16, 2, 1],
        [0, 1, 2, 1, 0],
        [0, 0, 1, 0, 0]
      ];
    } else {
      // For other sizes, use a simplified approach
      kernel = Array(size).fill(0).map(() => Array(size).fill(0));
      const center = Math.floor(size / 2);
      
      // Fill with 1s
      for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
          if (i === center && j === center) {
            // Center value
            kernel[i][j] = -(size * size - 1);
          } else {
            kernel[i][j] = 1;
          }
        }
      }
    }
    
    const halfSize = Math.floor(size / 2);
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let sum = 0;
        
        // Apply the kernel
        for (let ky = -halfSize; ky <= halfSize; ky++) {
          for (let kx = -halfSize; kx <= halfSize; kx++) {
            const pixelY0 = Math.min(height - 1, Math.max(0, y + ky));
            const pixelX0 = Math.min(width - 1, Math.max(0, x + kx));
            const idx = (pixelY0 * width + pixelX0) * 4;
            const pixelValue = data[idx];
            
            sum += pixelValue * kernel[ky + halfSize][kx + halfSize];
          }
        }
        
        // Take absolute value for edge magnitude
        let magnitude = Math.abs(sum);
        
        // Apply threshold
        magnitude = magnitude < threshold ? 0 : magnitude;
        magnitude = Math.min(255, magnitude);
        
        // Set the result
        const idx = (y * width + x) * 4;
        result[idx] = magnitude;
        result[idx + 1] = magnitude;
        result[idx + 2] = magnitude;
        result[idx + 3] = 255;
      }
    }
    
    return new ImageData(result, width, height);
  }, []);

  // Process an uploaded image
  const processImage = useCallback(async (sourceCanvas: HTMLCanvasElement, targetCanvas: HTMLCanvasElement) => {
    const sourceCtx = sourceCanvas.getContext('2d');
    const targetCtx = targetCanvas.getContext('2d');
    
    if (!sourceCtx || !targetCtx) return;
    
    const imgData = sourceCtx.getImageData(0, 0, sourceCanvas.width, sourceCanvas.height);
    let processedData: ImageData;
    
    // Convert to grayscale
    const grayData = toGrayscale(imgData);
    
    // Apply Gaussian blur (especially important for Laplacian)
    let blurredData = grayData;
    if (algorithm === "laplacian") {
      blurredData = gaussianBlur(grayData, sigma);
    }
    
    // Apply the selected edge detection algorithm
    if (algorithm === "sobel") {
      processedData = applySobel(blurredData, kernelSize, threshold);
    } else {
      processedData = applyLaplacian(blurredData, kernelSize, threshold);
    }
    
    // Render the result
    targetCtx.putImageData(processedData, 0, 0);
  }, [algorithm, kernelSize, threshold, sigma, toGrayscale, gaussianBlur, applySobel, applyLaplacian]);

  // Process a camera frame
  const processCameraFrame = useCallback(async (sourceCanvas: HTMLCanvasElement, targetCanvas: HTMLCanvasElement) => {
    setIsProcessingFrame(true);
    
    try {
      await processImage(sourceCanvas, targetCanvas);
    } finally {
      setIsProcessingFrame(false);
    }
  }, [processImage]);

  return {
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
  };
}

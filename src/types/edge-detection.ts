
export type AlgorithmType = "sobel" | "laplacian";

export interface EdgeDetectionSettings {
  algorithm: AlgorithmType;
  kernelSize: number;
  threshold: number;
  sigma?: number; // For Gaussian blur in Laplacian
  quality: number; // Image processing quality
}

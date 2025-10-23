"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import jsQR from "jsqr";
import { SubHeader } from "@/components/sub-header";

type FacingMode = "user" | "environment";

export default function ScanPage() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(
    null
  );
  const [isScanning, setIsScanning] = useState(false);
  const animationFrameId = useRef<number>();
  const [facingMode, setFacingMode] = useState<FacingMode>("environment");

  const tick = () => {
    if (
      videoRef.current &&
      videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA &&
      canvasRef.current
    ) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      if (ctx) {
        canvas.height = video.videoHeight;
        canvas.width = video.videoWidth;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: "dontInvert",
        });

        if (code) {
          stopScan();
          toast.success("QR Code Scanned!", {
            description: `Redirecting to trip ${code.data}...`,
          });
          router.push(`/dashboard/trip/${code.data}`);
          return; // Exit the loop
        }
      }
    }
    // Continue scanning
    if (isScanning) {
        animationFrameId.current = requestAnimationFrame(tick);
    }
  };

  const startScan = () => {
    if (!isScanning) {
      setIsScanning(true);
      animationFrameId.current = requestAnimationFrame(tick);
    }
  };

  const stopScan = () => {
    setIsScanning(false);
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
    }
  };
  
  const setupCamera = async (mode: FacingMode) => {
    if (typeof window === 'undefined') return;

    // Stop any existing tracks
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: mode } });
      setHasCameraPermission(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.addEventListener("loadeddata", startScan);
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      setHasCameraPermission(false);
      toast.error("Camera Access Denied", {
        description: "Please enable camera permissions in your browser settings to use this feature.",
      });
    }
  }
  
  const toggleCamera = () => {
      stopScan();
      const newFacingMode = facingMode === 'user' ? 'environment' : 'user';
      setFacingMode(newFacingMode);
      setupCamera(newFacingMode);
  }

  useEffect(() => {
    setupCamera(facingMode);

    return () => {
      // Cleanup
      stopScan();
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col h-full bg-black text-white">
      <header className="absolute top-0 left-0 right-0 z-20 p-4">
        <SubHeader title="Scan Ticket QR" className="bg-transparent border-none text-white">
             <Button variant="ghost" size="icon" onClick={toggleCamera} className="hover:bg-white/10 rounded-full">
                <RefreshCw className="h-6 w-6" />
            </Button>
        </SubHeader>
      </header>
      
      <main className="flex-1 relative flex items-center justify-center overflow-hidden">
        <video
          ref={videoRef}
          className="absolute top-0 left-0 w-full h-full object-cover"
          autoPlay
          playsInline
          muted
        />
        <canvas ref={canvasRef} className="hidden" />
        <div className="absolute inset-0 bg-black/60"></div>

        {hasCameraPermission === false ? (
          <div className="z-10 w-full p-4">
            <Alert
              variant="destructive"
              className="bg-red-900/50 border-red-500/50 text-white"
            >
              <AlertTitle>Camera Access Required</AlertTitle>
              <AlertDescription>
                Please allow camera access in your browser settings to use this
                feature. You may need to refresh the page after granting
                permission.
              </AlertDescription>
            </Alert>
          </div>
        ) : (
          <div className="z-10 flex flex-col items-center justify-center space-y-6 w-full h-full">
            <div className="relative w-64 h-64">
              <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-primary rounded-tl-lg"></div>
              <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-primary rounded-tr-lg"></div>
              <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-primary rounded-bl-lg"></div>
              <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-primary rounded-br-lg"></div>
              <div
                className={cn(
                  "absolute top-0 left-0 w-full h-1 bg-primary/80 shadow-[0_0_15px_3px_hsl(var(--primary))]",
                  isScanning && "animate-[scan_3s_ease-in-out_infinite]"
                )}
              ></div>
            </div>
            <p className="text-lg font-medium tracking-wider">
              Point at a QR Code
            </p>
          </div>
        )}
      </main>

      <style jsx>{`
        @keyframes scan {
          0% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(250px);
          }
          100% {
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

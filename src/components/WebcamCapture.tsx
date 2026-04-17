import { useState, useRef, useCallback, useEffect } from "react";
import { Camera, RefreshCw, Upload, Loader2, Video, VideoOff, Scan } from "lucide-react";
import { Button } from "@/components/ui/button";
import EmotionBadge from "./EmotionBadge";
import api from "@/services/api";

interface FaceResult {
  emotion: string;
  confidence: number;
}

const WebcamCapture = ({
  onResult,
}: {
  onResult?: (result: FaceResult) => void;
}) => {
  const [captured, setCaptured] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<File | Blob | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<FaceResult | null>(null);
  const [webcamActive, setWebcamActive] = useState(false);
  const [liveMode, setLiveMode] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const analyzeImage = useCallback(async (blob: Blob) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("image", blob, "capture.jpg");
      const response = await api.post("/analyze_face", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (response.data?.success && response.data?.data) {
        const res: FaceResult = {
          emotion: response.data.data.emotion,
          confidence: response.data.data.confidence,
        };
        setResult(res);
        onResult?.(res);
      }
    } catch (error) {
      console.error("Emotion analysis error", error);
    } finally {
      setLoading(false);
    }
  }, [onResult]);

  const captureFrame = useCallback((): Blob | null => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState < 2) return null;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(video, 0, 0);
    // Convert to blob synchronously isn't possible, use toBlob
    return null; // handled async below
  }, []);

  const captureAndAnalyze = useCallback(async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState < 2) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    
    canvas.toBlob(async (blob) => {
      if (!blob) return;
      setCaptured(canvas.toDataURL("image/jpeg", 0.8));
      await analyzeImage(blob);
    }, "image/jpeg", 0.8);
  }, [analyzeImage]);

  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 640, height: 480 },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setWebcamActive(true);
      setCaptured(null);
      setResult(null);
    } catch (err) {
      console.error("Webcam access denied", err);
    }
  };

  const stopWebcam = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setWebcamActive(false);
    setLiveMode(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const toggleLiveMode = () => {
    if (liveMode) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setLiveMode(false);
    } else {
      setLiveMode(true);
      captureAndAnalyze();
      intervalRef.current = setInterval(() => {
        captureAndAnalyze();
      }, 2000);
    }
  };

  useEffect(() => {
    return () => {
      stopWebcam();
    };
  }, []);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setCaptured(url);
    setPendingFile(file);
    setResult(null);
    stopWebcam();
  };

  const handleSnapAndAnalyze = () => {
    captureAndAnalyze();
  };

  const handleAnalyzeClick = async () => {
    if (pendingFile) {
      await analyzeImage(pendingFile);
    } else if (webcamActive) {
      await captureAndAnalyze();
    }
  };

  const reset = () => {
    setCaptured(null);
    setPendingFile(null);
    setResult(null);
    stopWebcam();
  };

  return (
    <div className="space-y-4">
      <canvas ref={canvasRef} className="hidden" />
      <div className="relative rounded-xl overflow-hidden bg-muted/50 border-2 border-dashed border-border aspect-video max-h-64 flex items-center justify-center">
        {webcamActive ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
        ) : captured ? (
          <img
            src={captured}
            alt="Captured"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center gap-3 text-muted-foreground p-6">
            <Camera className="w-12 h-12 opacity-40" />
            <p className="text-sm font-medium">
              Upload a photo or start webcam for emotion detection
            </p>
          </div>
        )}
        {loading && (
          <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        )}
        {liveMode && (
          <div className="absolute top-2 right-2 flex items-center gap-1.5 px-2 py-1 rounded-full bg-destructive/90 text-destructive-foreground text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-destructive-foreground animate-pulse" />
            LIVE
          </div>
        )}
      </div>

      <div className="flex gap-2 flex-wrap">
        <Button
          variant="outline"
          size="sm"
          onClick={() => fileRef.current?.click()}
          className="flex items-center gap-2"
        >
          <Upload className="w-4 h-4" /> Upload Photo
        </Button>
        {!webcamActive ? (
          <Button variant="outline" size="sm" onClick={startWebcam} className="flex items-center gap-2">
            <Video className="w-4 h-4" /> Start Webcam
          </Button>
        ) : (
          <>
            <Button
              size="sm"
              className="btn-primary"
              onClick={handleSnapAndAnalyze}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-1" /> Analyzing...
                </>
              ) : (
                "Snap & Analyze"
              )}
            </Button>
            <Button
              variant={liveMode ? "destructive" : "outline"}
              size="sm"
              onClick={toggleLiveMode}
              className="flex items-center gap-2"
            >
              {liveMode ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
              {liveMode ? "Stop Live" : "Live Mode"}
            </Button>
            <Button variant="ghost" size="sm" onClick={reset}>
              <RefreshCw className="w-4 h-4" />
            </Button>
          </>
        )}
        {captured && !webcamActive && (
          <Button variant="ghost" size="sm" onClick={reset}>
            <RefreshCw className="w-4 h-4" />
          </Button>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFile}
        />
      </div>

      {(pendingFile || webcamActive) && (
        <Button
          onClick={handleAnalyzeClick}
          disabled={loading}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Analyzing...
            </>
          ) : (
            <>
              <Scan className="w-4 h-4" /> Analyze Emotion
            </>
          )}
        </Button>
      )}

      {result && (
        <div className="p-4 rounded-xl bg-muted/40 border border-border animate-fade-in">
          <p className="text-xs text-muted-foreground font-medium mb-2">
            Detection Result
          </p>
          <EmotionBadge
            emotion={result.emotion}
            confidence={result.confidence}
          />
        </div>
      )}
    </div>
  );
};

export default WebcamCapture;

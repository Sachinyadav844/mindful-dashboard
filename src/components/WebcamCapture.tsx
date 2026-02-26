import { useState, useRef } from 'react';
import { Camera, RefreshCw, Upload, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import EmotionBadge from './EmotionBadge';

interface FaceResult {
  emotion: string;
  confidence: number;
}

const WebcamCapture = ({ onResult }: { onResult?: (result: FaceResult) => void }) => {
  const [captured, setCaptured] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<FaceResult | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const mockAnalyze = async (imageUrl: string) => {
    setLoading(true);
    // Simulate API call
    await new Promise(r => setTimeout(r, 1500));
    const emotions = ['happy', 'neutral', 'sad', 'surprised'];
    const emotion = emotions[Math.floor(Math.random() * emotions.length)];
    const res = { emotion, confidence: 0.72 + Math.random() * 0.25 };
    setResult(res);
    onResult?.(res);
    setLoading(false);
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setCaptured(url);
    setResult(null);
  };

  const reset = () => { setCaptured(null); setResult(null); };

  return (
    <div className="space-y-4">
      <div className="relative rounded-xl overflow-hidden bg-muted/50 border-2 border-dashed border-border aspect-video max-h-64 flex items-center justify-center">
        {captured ? (
          <img src={captured} alt="Captured" className="w-full h-full object-cover" />
        ) : (
          <div className="flex flex-col items-center gap-3 text-muted-foreground p-6">
            <Camera className="w-12 h-12 opacity-40" />
            <p className="text-sm font-medium">Upload a photo for emotion detection</p>
          </div>
        )}
        {loading && (
          <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        )}
      </div>

      <div className="flex gap-2 flex-wrap">
        <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()} className="flex items-center gap-2">
          <Upload className="w-4 h-4" /> Upload Photo
        </Button>
        {captured && (
          <>
            <Button size="sm" className="btn-primary" onClick={() => mockAnalyze(captured)} disabled={loading}>
              {loading ? <><Loader2 className="w-4 h-4 animate-spin mr-1" /> Analyzing...</> : 'Analyze Emotion'}
            </Button>
            <Button variant="ghost" size="sm" onClick={reset}><RefreshCw className="w-4 h-4" /></Button>
          </>
        )}
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      </div>

      {result && (
        <div className="p-4 rounded-xl bg-muted/40 border border-border animate-fade-in">
          <p className="text-xs text-muted-foreground font-medium mb-2">Detection Result</p>
          <EmotionBadge emotion={result.emotion} confidence={result.confidence} />
        </div>
      )}
    </div>
  );
};

export default WebcamCapture;

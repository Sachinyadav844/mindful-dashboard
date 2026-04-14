import { useState } from "react";
import { MessageSquare, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import api from "@/services/api";

interface SentimentResult {
  sentiment: "positive" | "negative" | "neutral";
  score: number;
  keywords: string[];
}

const sentimentColors = {
  positive: "risk-low",
  negative: "risk-high",
  neutral: "bg-muted text-muted-foreground border border-border",
};

const sentimentEmoji = { positive: "😊", negative: "😔", neutral: "😐" };

const TextSentimentBox = ({
  onResult,
}: {
  onResult?: (r: SentimentResult) => void;
}) => {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SentimentResult | null>(null);

  const analyze = async () => {
    if (!text.trim()) return;
    setLoading(true);
    try {
      const response = await api.post("/analyze_text", { text });
      const respData = response.data;

      if (respData?.success && respData?.data) {
        const r: SentimentResult = {
          sentiment: respData.data.sentiment,
          score: Number(respData.data.confidence || 0),
          keywords: [],
        };
        setResult(r);
        onResult?.(r);
      } else {
        throw new Error(respData?.message || "Invalid response");
      }
    } catch (error) {
      console.error("Sentiment analysis error", error);
      setResult({
        sentiment: "neutral",
        score: 0.5,
        keywords: [],
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <Textarea
        placeholder="Describe how you're feeling today... e.g., 'I've been feeling overwhelmed with work lately and can't focus properly.'"
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={4}
        className="resize-none border-border/70 focus:border-primary/50 bg-muted/20"
      />
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          {text.length} characters
        </span>
        <Button
          size="sm"
          className="btn-primary"
          onClick={analyze}
          disabled={!text.trim() || loading}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-1" /> Analyzing...
            </>
          ) : (
            <>
              <MessageSquare className="w-4 h-4 mr-1" /> Analyze Sentiment
            </>
          )}
        </Button>
      </div>

      {result && (
        <div
          className={`p-4 rounded-xl animate-fade-in ${sentimentColors[result.sentiment]}`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold capitalize flex items-center gap-2">
              <span>{sentimentEmoji[result.sentiment]}</span>
              {result.sentiment} Sentiment
            </span>
            <span className="text-sm font-medium">
              {Math.round(result.score * 100)}% confidence
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default TextSentimentBox;

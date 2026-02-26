import { Brain, MessageSquare, TrendingUp, Bell, Sparkles, Scan, Activity, BarChart2, BookOpen, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';

const features = [
  {
    icon: Brain, title: 'Facial Emotion Detection', status: 'live',
    color: 'bg-lavender-soft text-lavender',
    desc: 'Upload a photo to detect emotions including happiness, sadness, anger, fear, surprise, and neutral states using deep learning computer vision.',
    capabilities: ['7 emotion categories', 'Confidence scores', 'Real-time processing'],
  },
  {
    icon: MessageSquare, title: 'Text Sentiment Analysis', status: 'live',
    color: 'bg-primary/10 text-primary',
    desc: 'NLP-powered analysis of your written thoughts and feelings, extracting sentiment polarity and key emotional keywords.',
    capabilities: ['Positive/Negative/Neutral', 'Keyword extraction', 'Tone analysis'],
  },
  {
    icon: TrendingUp, title: 'Mood Score Engine', status: 'live',
    color: 'bg-success-soft text-success',
    desc: 'A composite algorithm that combines facial emotion data, text sentiment, and behavioral patterns into a unified 0–100 wellness score.',
    capabilities: ['0-100 composite score', 'Historical tracking', 'Trend analysis'],
  },
  {
    icon: Bell, title: 'Risk Alert System', status: 'live',
    color: 'bg-destructive/10 text-destructive',
    desc: 'Proactive tiered alerts when mood scores indicate potential mental health concerns, with actionable guidance.',
    capabilities: ['3-tier risk levels', 'Instant alerts', 'Professional referrals'],
  },
  {
    icon: Sparkles, title: 'Personalized Recommendations', status: 'live',
    color: 'bg-warning-soft text-warning',
    desc: 'AI-generated wellness suggestions tailored to your emotional state, including breathing exercises, journaling prompts, and mindfulness techniques.',
    capabilities: ['Context-aware', 'Evidence-based', 'Adaptive learning'],
  },
  {
    icon: Scan, title: 'Age Detection', status: 'coming',
    color: 'bg-lavender-soft text-lavender',
    desc: 'Upcoming feature to estimate age from facial features and provide age-appropriate wellness recommendations.',
    capabilities: ['Age estimation', 'Group-based advice', 'Developmental context'],
  },
  {
    icon: BarChart2, title: 'Analytics Dashboard', status: 'live',
    color: 'bg-primary/10 text-primary',
    desc: 'Comprehensive visualizations of your wellness journey including trend charts, emotion distribution, and risk analysis.',
    capabilities: ['Interactive charts', 'PDF export', 'Custom date ranges'],
  },
  {
    icon: BookOpen, title: 'Mood Journal', status: 'live',
    color: 'bg-success-soft text-success',
    desc: 'Track and review your emotional history with detailed session logs, filterable by date range.',
    capabilities: ['Session history', 'Date filtering', 'Risk tracking'],
  },
];

const Features = () => (
  <div className="page-container">
    <Navbar />
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-16 animate-fade-in-up">
        <h1 className="text-4xl font-display font-bold mb-4">Platform <span className="text-gradient">Features</span></h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">A comprehensive suite of AI-powered tools designed to monitor, analyze, and improve your mental wellness.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {features.map((f, i) => (
          <div key={f.title} className="feature-card p-6 animate-fade-in-up" style={{ animationDelay: `${i * 60}ms` }}>
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-xl ${f.color} flex items-center justify-center flex-shrink-0`}>
                <f.icon className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-display font-bold">{f.title}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${f.status === 'live' ? 'bg-success-soft text-success' : 'bg-lavender-soft text-lavender'}`}>
                    {f.status === 'live' ? '● Live' : '○ Soon'}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-3">{f.desc}</p>
                <div className="flex flex-wrap gap-1.5">
                  {f.capabilities.map(c => (
                    <span key={c} className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border/60">{c}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center mt-12 animate-fade-in-up">
        <Button size="lg" className="btn-primary gap-2" asChild>
          <Link to="/monitor">Try All Features Free</Link>
        </Button>
      </div>
    </div>
    <Footer />
  </div>
);

export default Features;

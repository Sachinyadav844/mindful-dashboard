import { Link } from 'react-router-dom';
import { ArrowRight, Brain, Activity, MessageSquare, TrendingUp, Bell, Sparkles, Play, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import heroImage from '@/assets/hero.png';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const features = [
  { icon: Brain, title: 'Facial Emotion Detection', desc: 'Real-time AI analysis of facial expressions to detect emotional states with high accuracy.', color: 'bg-lavender-soft text-lavender' },
  { icon: MessageSquare, title: 'Text Sentiment Analysis', desc: 'Natural language processing to understand the emotional tone of your written thoughts.', color: 'bg-primary/10 text-primary' },
  { icon: TrendingUp, title: 'Mood Score Engine', desc: 'A composite scoring algorithm that quantifies your mental wellness state on a 0–100 scale.', color: 'bg-success-soft text-success' },
  { icon: Bell, title: 'Risk Alert System', desc: 'Proactive notifications when mood scores indicate potential mental health concerns.', color: 'bg-destructive/10 text-destructive' },
  { icon: Sparkles, title: 'Personalized Recommendations', desc: 'AI-curated wellness suggestions based on your unique emotional profile and history.', color: 'bg-warning-soft text-warning' },
];

const steps = [
  { num: '01', icon: Activity, title: 'Capture Emotion', desc: 'Upload a photo or describe your mood through text. Our AI processes multimodal inputs.' },
  { num: '02', icon: Brain, title: 'Analyze Mood', desc: 'Advanced algorithms analyze facial expressions, sentiment, and behavioral patterns.' },
  { num: '03', icon: Sparkles, title: 'Get Insights', desc: 'Receive personalized wellness insights, risk alerts, and actionable recommendations.' },
];

const Home = () => (
  <div className="page-container">
    <Navbar />

    {/* Hero */}
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-6 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium">
            <span className="w-2 h-2 rounded-full bg-primary pulse-dot" />
            AI-Powered Mental Wellness
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold leading-tight text-foreground">
            AI-Driven{' '}
            <span className="text-gradient">Mental Wellness</span>{' '}
            Monitoring
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-lg">
            Real-time multimodal analysis of your emotional state through facial expressions and text sentiment, delivering personalized wellness insights.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Button size="lg" className="btn-primary gap-2 text-base" asChild>
              <Link to="/monitor"><Activity className="w-5 h-5" /> Start Monitoring</Link>
            </Button>
            <Button size="lg" variant="outline" className="gap-2 text-base" asChild>
              <Link to="/assessment"><CheckCircle className="w-5 h-5" /> Self Assessment</Link>
            </Button>
          </div>
          <div className="flex items-center gap-6 pt-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-success" /> No Sign-up Required</span>
            <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-success" /> Privacy First</span>
          </div>
        </div>
        <div className="flex justify-center animate-fade-in" style={{ animationDelay: '200ms' }}>
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-lavender/20 rounded-full blur-3xl" />
            <img src={heroImage} alt="Mental wellness AI brain" className="relative w-full max-w-lg rounded-3xl object-cover drop-shadow-2xl" />
          </div>
        </div>
      </div>
    </section>

    {/* Problem Statement */}
    <section className="bg-card/50 py-12">
      <div className="max-w-3xl mx-auto px-4 text-center">
        <h2 className="text-2xl font-display font-bold mb-4">The Problem We're Solving</h2>
        <p className="text-muted-foreground text-lg leading-relaxed">
          Students and professionals often ignore early warning signs of stress, burnout, and anxiety. By the time they seek help, mental health challenges have already escalated. <strong className="text-foreground">MENTALMASS</strong> provides continuous, passive monitoring to catch these signals early.
        </p>
      </div>
    </section>

    {/* Features Grid */}
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-display font-bold mb-3">Powerful AI Features</h2>
        <p className="text-muted-foreground">Everything you need to monitor and improve your mental wellness</p>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((f, i) => (
          <div key={f.title} className="feature-card p-6 group animate-fade-in-up" style={{ animationDelay: `${i * 80}ms` }}>
            <div className={`w-12 h-12 rounded-xl ${f.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
              <f.icon className="w-6 h-6" />
            </div>
            <h3 className="font-display font-bold text-lg mb-2">{f.title}</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
          </div>
        ))}
        <div className="feature-card p-6 flex flex-col items-center justify-center text-center border-dashed bg-muted/20 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
          <div className="w-12 h-12 rounded-xl bg-lavender-soft flex items-center justify-center mb-4">
            <Play className="w-6 h-6 text-lavender" />
          </div>
          <h3 className="font-display font-bold text-lg mb-2">Try It Free</h3>
          <p className="text-muted-foreground text-sm mb-4">Start your wellness journey today</p>
          <Button size="sm" className="btn-primary" asChild><Link to="/monitor">Get Started</Link></Button>
        </div>
      </div>
    </section>

    {/* How It Works */}
    <section className="bg-card/50 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-display font-bold mb-3">How It Works</h2>
          <p className="text-muted-foreground">Three simple steps to better mental wellness</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, i) => (
            <div key={step.num} className="relative text-center animate-fade-in-up" style={{ animationDelay: `${i * 100}ms` }}>
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-8 left-[60%] w-full h-px bg-gradient-to-r from-border to-transparent" />
              )}
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-primary text-primary-foreground text-xl font-display font-bold mb-4 shadow-lg shadow-primary/25">
                {step.num}
              </div>
              <h3 className="font-display font-bold text-xl mb-2">{step.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    <Footer />
  </div>
);

export default Home;

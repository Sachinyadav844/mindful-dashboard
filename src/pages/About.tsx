import { Brain, Heart, Users, Shield, Target, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';

const values = [
  { icon: Heart, title: 'Empathy First', desc: 'We design every feature with compassion and understanding of mental health challenges.', color: 'bg-destructive/10 text-destructive' },
  { icon: Shield, title: 'Privacy by Design', desc: 'Your mental health data is the most sensitive. We protect it with industry-leading security.', color: 'bg-success-soft text-success' },
  { icon: Zap, title: 'AI-Powered Accuracy', desc: 'State-of-the-art machine learning models trained on diverse, representative datasets.', color: 'bg-warning-soft text-warning' },
  { icon: Users, title: 'Inclusive Wellness', desc: 'Built for everyone — students, professionals, and anyone seeking mental clarity.', color: 'bg-lavender-soft text-lavender' },
];

const About = () => (
  <div className="page-container">
    <Navbar />
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Hero */}
      <div className="text-center mb-16 animate-fade-in-up">
        <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-6 shadow-lg shadow-primary/25">
          <Brain className="w-9 h-9 text-primary-foreground" />
        </div>
        <h1 className="text-4xl font-display font-bold mb-4">About <span className="text-gradient">MENTALMASS</span></h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          An AI-driven multimodal mental wellness monitoring system that helps individuals understand and manage their emotional states through advanced technology.
        </p>
      </div>

      {/* Mission */}
      <div className="glass-card p-8 mb-10 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
            <Target className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-display font-bold mb-3">Our Mission</h2>
            <p className="text-muted-foreground leading-relaxed">
              Mental health is the foundation of everything we do — how we work, learn, connect, and live. Yet millions of people struggle silently, unaware of early warning signs until it's too late. MENTALMASS was built to change that by making continuous, accessible mental wellness monitoring a reality for everyone.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-3">
              By combining facial emotion recognition, natural language processing, and behavioral analysis, we provide holistic insights that help people take proactive steps toward better mental health.
            </p>
          </div>
        </div>
      </div>

      {/* Values */}
      <h2 className="text-2xl font-display font-bold mb-6 animate-fade-in-up">Our Core Values</h2>
      <div className="grid sm:grid-cols-2 gap-6 mb-12">
        {values.map((v, i) => (
          <div key={v.title} className="feature-card p-6 animate-fade-in-up" style={{ animationDelay: `${i * 80}ms` }}>
            <div className={`w-10 h-10 rounded-xl ${v.color} flex items-center justify-center mb-3`}><v.icon className="w-5 h-5" /></div>
            <h3 className="font-display font-bold mb-2">{v.title}</h3>
            <p className="text-sm text-muted-foreground">{v.desc}</p>
          </div>
        ))}
      </div>

      <div className="text-center animate-fade-in-up">
        <Button size="lg" className="btn-primary gap-2" asChild>
          <Link to="/monitor">Start Your Wellness Journey</Link>
        </Button>
      </div>
    </div>
    <Footer />
  </div>
);

export default About;

import { Brain, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => (
  <footer className="bg-card border-t border-border/60 py-8 mt-auto">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg gradient-primary flex items-center justify-center">
            <Brain className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-display font-bold text-gradient">MENTALMASS</span>
        </div>
        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <Link to="/about" className="hover:text-primary transition-colors">About</Link>
          <Link to="/features" className="hover:text-primary transition-colors">Features</Link>
          <Link to="/monitor" className="hover:text-primary transition-colors">Monitor</Link>
        </div>
        <p className="text-sm text-muted-foreground flex items-center gap-1">
          Made with <Heart className="w-3.5 h-3.5 text-destructive fill-destructive" /> for mental wellness
        </p>
      </div>
      <div className="mt-6 pt-6 border-t border-border/50 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} MENTALMASS. AI-Driven Mental Wellness Monitoring System.
      </div>
    </div>
  </footer>
);

export default Footer;

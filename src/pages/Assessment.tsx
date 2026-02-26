import { ClipboardList } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SelfAssessment from '@/components/SelfAssessment';

const Assessment = () => (
  <div className="page-container">
    <Navbar />
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8 animate-fade-in-up">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center">
            <ClipboardList className="w-5 h-5 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-display font-bold">Self Assessment</h1>
        </div>
        <p className="text-muted-foreground ml-12">Answer 5 questions to evaluate your current mental wellness level. Takes less than 2 minutes.</p>
      </div>

      <div className="glass-card p-6 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
        <div className="mb-6 p-4 rounded-xl bg-primary/5 border border-primary/15">
          <p className="text-sm text-primary font-medium">📋 Over the last 2 weeks, how often have you been bothered by the following?</p>
        </div>
        <SelfAssessment />
      </div>
    </div>
    <Footer />
  </div>
);

export default Assessment;

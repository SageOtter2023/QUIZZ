import { Link } from 'react-router-dom';
import { Mail, Github, Linkedin, Twitter } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-secondary/50 border-t border-border mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="flex flex-col gap-3">
            <div className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              ⚡ QuizMaster Pro
            </div>
            <p className="text-sm text-foreground/60">
              Master your skills with timed quizzes and instant feedback.
            </p>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col gap-3">
            <h4 className="font-semibold text-foreground">Quick Links</h4>
            <Link to="/" className="text-sm text-foreground/60 hover:text-foreground transition-colors">
              Home
            </Link>
            <Link to="/quizzes" className="text-sm text-foreground/60 hover:text-foreground transition-colors">
              Quizzes
            </Link>
            <Link to="/dashboard" className="text-sm text-foreground/60 hover:text-foreground transition-colors">
              Dashboard
            </Link>
          </div>

          {/* Resources */}
          <div className="flex flex-col gap-3">
            <h4 className="font-semibold text-foreground">Resources</h4>
            <Link to="/feedback" className="text-sm text-foreground/60 hover:text-foreground transition-colors">
              Feedback
            </Link>
            <a href="#" className="text-sm text-foreground/60 hover:text-foreground transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-sm text-foreground/60 hover:text-foreground transition-colors">
              Terms of Service
            </a>
          </div>

          {/* Social */}
          <div className="flex flex-col gap-3">
            <h4 className="font-semibold text-foreground">Connect</h4>
            <div className="flex gap-3">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
              >
                <Twitter className="h-4 w-4" />
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
              >
                <Github className="h-4 w-4" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
              >
                <Linkedin className="h-4 w-4" />
              </a>
              <a
                href="mailto:support@quizmasterpro.com"
                className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
              >
                <Mail className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-foreground/60">
            © {currentYear} QuizMaster Pro. All rights reserved.
          </p>
          <p className="text-sm text-foreground/60">
            Built with ⚡ for better learning
          </p>
        </div>
      </div>
    </footer>
  );
}

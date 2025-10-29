import { motion } from 'framer-motion';
import { Construction, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface PlaceholderProps {
  title: string;
  description: string;
}

export function Placeholder({ title, description }: PlaceholderProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-[calc(100vh-200px)] flex items-center justify-center px-4"
    >
      <div className="text-center space-y-8">
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="flex justify-center"
        >
          <Construction className="h-24 w-24 text-primary/60" />
        </motion.div>
        <div className="space-y-3">
          <h1 className="text-4xl font-bold">{title}</h1>
          <p className="text-xl text-foreground/60 max-w-md">{description}</p>
        </div>
        <p className="text-sm text-foreground/40">
          This page is coming soon. Keep an eye on the latest updates!
        </p>
        <div className="flex justify-center gap-4">
          <Link to="/">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

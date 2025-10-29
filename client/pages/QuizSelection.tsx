import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Clock, Zap, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface Quiz {
  id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  questionCount: number;
  timeLimit: number;
  description: string;
  icon: string;
}

const mockQuizzes: Quiz[] = [
  {
    id: '1',
    title: 'Web Development Basics',
    difficulty: 'Easy',
    questionCount: 10,
    timeLimit: 15,
    description: 'Master HTML, CSS, and JavaScript fundamentals',
    icon: '🌐',
  },
  {
    id: '2',
    title: 'AI & Machine Learning',
    difficulty: 'Hard',
    questionCount: 20,
    timeLimit: 30,
    description: 'Deep dive into AI concepts and algorithms',
    icon: '🤖',
  },
  {
    id: '3',
    title: 'Data Structures',
    difficulty: 'Medium',
    questionCount: 15,
    timeLimit: 25,
    description: 'Arrays, trees, graphs, and more',
    icon: '📊',
  },
  {
    id: '4',
    title: 'Database Management Systems',
    difficulty: 'Medium',
    questionCount: 12,
    timeLimit: 20,
    description: 'SQL, NoSQL, and DBMS concepts',
    icon: '💾',
  },
  {
    id: '5',
    title: 'Advanced JavaScript',
    difficulty: 'Hard',
    questionCount: 18,
    timeLimit: 28,
    description: 'Closures, async, and modern JS patterns',
    icon: '⚙️',
  },
  {
    id: '6',
    title: 'System Design',
    difficulty: 'Hard',
    questionCount: 16,
    timeLimit: 32,
    description: 'Scalability, architecture, and best practices',
    icon: '🏗️',
  },
];

const difficultyColors = {
  Easy: 'from-green-500 to-emerald-500',
  Medium: 'from-yellow-500 to-orange-500',
  Hard: 'from-red-500 to-pink-500',
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

export default function QuizSelection() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'All' | 'Easy' | 'Medium' | 'Hard'>('All');

  useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      setQuizzes(mockQuizzes);
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const filteredQuizzes = filter === 'All' 
    ? quizzes 
    : quizzes.filter(q => q.difficulty === filter);

  const handleStartQuiz = (quizId: string) => {
    toast.success('Quiz loaded! Starting your quiz...');
    // In a real app, navigate to quiz page with quiz ID
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header Section */}
      <motion.section
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative py-16 px-4 bg-gradient-to-b from-primary/5 to-transparent border-b border-border"
      >
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-2 mb-4 text-primary">
            <BookOpen className="h-6 w-6" />
            <span className="text-sm font-semibold">QUIZ SELECTION</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-4">
            Choose Your Challenge
          </h1>
          <p className="text-xl text-foreground/60 max-w-2xl">
            Select from our curated collection of quizzes across different topics and difficulty levels.
          </p>
        </div>
      </motion.section>

      {/* Filter Section */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="py-12 px-4 border-b border-border"
      >
        <div className="max-w-6xl mx-auto">
          <h3 className="text-sm font-semibold text-foreground/60 mb-4">FILTER BY DIFFICULTY</h3>
          <div className="flex flex-wrap gap-3">
            {['All', 'Easy', 'Medium', 'Hard'].map((difficulty) => (
              <button
                key={difficulty}
                onClick={() => setFilter(difficulty as any)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  filter === difficulty
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary hover:bg-secondary/80 text-foreground'
                }`}
              >
                {difficulty}
              </button>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Quizzes Grid */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          {loading ? (
            // Loading Skeletons
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  variants={itemVariants}
                  className="h-80 rounded-2xl bg-secondary/50 animate-pulse"
                />
              ))}
            </motion.div>
          ) : filteredQuizzes.length > 0 ? (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredQuizzes.map((quiz) => (
                <motion.div
                  key={quiz.id}
                  variants={itemVariants}
                  whileHover={{ y: -8 }}
                  className="group relative h-full rounded-2xl border border-border bg-card overflow-hidden transition-all duration-300 hover:border-primary/50"
                >
                  {/* Background Gradient */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${difficultyColors[quiz.difficulty]} opacity-0 group-hover:opacity-5 transition-opacity`} />

                  {/* Content */}
                  <div className="relative p-6 h-full flex flex-col justify-between">
                    {/* Top */}
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="text-5xl">{quiz.icon}</div>
                        <motion.div
                          className={`inline-block px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r ${difficultyColors[quiz.difficulty]} bg-clip-text text-transparent border border-current/20`}
                        >
                          {quiz.difficulty}
                        </motion.div>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold mb-2">{quiz.title}</h3>
                        <p className="text-sm text-foreground/60">{quiz.description}</p>
                      </div>
                    </div>

                    {/* Metadata */}
                    <div className="space-y-3 border-t border-border pt-4 mb-4">
                      <div className="flex items-center gap-3 text-sm text-foreground/70">
                        <Zap className="h-4 w-4 text-accent" />
                        <span>{quiz.questionCount} Questions</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-foreground/70">
                        <Clock className="h-4 w-4 text-primary" />
                        <span>{quiz.timeLimit} Minutes</span>
                      </div>
                    </div>

                    {/* Button */}
                    <button
                      onClick={() => handleStartQuiz(quiz.id)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-semibold transition-colors group-hover:gap-3"
                    >
                      Start Quiz
                      <ArrowRight className="h-4 w-4 transition-transform" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <p className="text-foreground/60 text-lg">No quizzes found for the selected filter.</p>
            </motion.div>
          )}
        </div>
      </section>
    </div>
  );
}

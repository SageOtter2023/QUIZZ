import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Zap, BarChart3, Clock, CheckCircle, Users, BookOpen, Flame } from 'lucide-react';
import { Button } from '@/components/ui/button';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

export default function Home() {
  const features = [
    {
      icon: Clock,
      title: 'Timed Quizzes',
      description: 'Challenge yourself with realistic time constraints. Improve speed and accuracy under pressure.',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: BookOpen,
      title: 'Topic-wise Practice',
      description: 'Master specific topics with curated question sets. Focus on areas that need improvement.',
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: CheckCircle,
      title: 'Instant Feedback',
      description: 'Get immediate results with detailed explanations. Learn from every question you attempt.',
      color: 'from-green-500 to-emerald-500',
    },
    {
      icon: BarChart3,
      title: 'Progress Analytics',
      description: 'Track your improvement with visual charts. See detailed performance metrics over time.',
      color: 'from-orange-500 to-red-500',
    },
    {
      icon: Zap,
      title: 'Smart Suggestions',
      description: 'AI-powered recommendations for topics to focus on based on your performance.',
      color: 'from-yellow-500 to-orange-500',
    },
    {
      icon: Users,
      title: 'Leaderboards',
      description: 'Compete with other learners and see where you stand in the community.',
      color: 'from-indigo-500 to-purple-500',
    },
  ];

  const stats = [
    { number: '10K+', label: 'Active Users' },
    { number: '500+', label: 'Quiz Questions' },
    { number: '50+', label: 'Topics Covered' },
  ];

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center px-4 py-20 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-72 h-72 bg-accent/10 rounded-full blur-3xl" />
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-4xl mx-auto text-center space-y-8"
        >
          {/* Badge */}
          <motion.div variants={itemVariants}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
              <Flame className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">
                Master Your Skills Today
              </span>
            </div>
          </motion.div>

          {/* Main Heading */}
          <motion.div variants={itemVariants} className="space-y-4">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-primary via-blue-600 to-primary bg-clip-text text-transparent">
                Quiz Master Pro
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-foreground/70 font-light">
              The next-generation quiz & viva practice platform. Master your subjects with timed quizzes, instant feedback, and intelligent analytics.
            </p>
          </motion.div>

          {/* CTA Buttons */}
          <div
            className="flex flex-col sm:flex-row gap-4 justify-center pt-4"
          >
            <motion.div variants={itemVariants}>
              <Link to="/quizzes">
                <Button
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg h-14 gap-2 group"
                >
                  Start Practicing
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </motion.div>
            <motion.div variants={itemVariants}>
              <Button
                size="lg"
                variant="outline"
                className="text-lg h-14 border-2 border-primary text-primary hover:bg-primary/10"
              >
                Try Demo Quiz
              </Button>
            </motion.div>
          </div>

          {/* Stats */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-3 gap-4 md:gap-8 pt-12 border-t border-border"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                whileHover={{ y: -5 }}
                className="flex flex-col items-center gap-2"
              >
                <p className="text-3xl md:text-4xl font-bold text-primary">{stat.number}</p>
                <p className="text-sm md:text-base text-foreground/60">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-secondary/20">
        <div className="max-w-6xl mx-auto">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            className="text-center mb-16"
          >
            <motion.div variants={itemVariants} className="inline-block mb-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20">
                <Zap className="h-4 w-4 text-accent" />
                <span className="text-sm font-medium text-accent">Key Features</span>
              </div>
            </motion.div>
            <motion.h2
              variants={itemVariants}
              className="text-4xl md:text-5xl font-bold mb-4"
            >
              Everything You Need to Excel
            </motion.h2>
            <motion.p
              variants={itemVariants}
              className="text-lg text-foreground/60 max-w-2xl mx-auto"
            >
              Comprehensive tools and features designed to help you master any subject through intelligent practice.
            </motion.p>
          </motion.div>

          {/* Features Grid */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
                  className="group p-6 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all duration-300 cursor-pointer"
                >
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${feature.color} p-0.5 mb-4 group-hover:scale-110 transition-transform`}>
                    <div className="w-full h-full bg-card rounded-lg flex items-center justify-center">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-foreground/60 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center space-y-8 p-8 md:p-16 rounded-2xl bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/20"
        >
          <h2 className="text-4xl md:text-5xl font-bold">
            Ready to Master Your Skills?
          </h2>
          <p className="text-lg text-foreground/70">
            Join thousands of learners who are already improving their performance with QuizMaster Pro.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <div>
              <Link to="/quizzes">
                <Button
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg h-14 gap-2 group"
                >
                  Start Your First Quiz
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
            <Button
              size="lg"
              variant="outline"
              className="text-lg h-14 border-2 border-foreground/20 hover:border-primary"
            >
              Learn More
            </Button>
          </div>
        </motion.div>
      </section>
    </div>
  );
}

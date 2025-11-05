// src/pages/Auth.tsx
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { 
  AlertCircle, Mail, ArrowLeft, Github, Zap, Shield, Code, Upload, 
  Download, GitPullRequest, Star, Palette, Brain, ArrowRight, 
  CheckCircle, Sparkles, Globe, Cpu, Users, Target, GitBranch,
  FileText, BarChart3, Rocket, ShieldCheck, Workflow
} from 'lucide-react';

interface EmailConfirmationProps {
  email: string;
  resetView: () => void;
}

function EmailConfirmation({ email, resetView }: EmailConfirmationProps) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex items-center justify-center p-8 bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="max-w-md w-full"
      >
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-8 border border-slate-200">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-20 h-20 bg-gradient-to-r from-blue-500 to-green-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg"
          >
            <Mail className="w-10 h-10 text-white" />
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-3xl font-bold text-slate-900 mb-4 text-center"
          >
            Check Your Email!
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-slate-700 mb-6 text-lg text-center"
          >
            We've sent a <span className="font-bold text-blue-600">verification link</span> to{' '}
            <span className="font-semibold text-slate-900 break-all">{email}</span>
          </motion.p>
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={resetView}
            className="w-full inline-flex items-center justify-center gap-2 text-slate-700 hover:text-slate-900 transition-all duration-300 hover:gap-3 font-medium group py-3 border border-slate-300 rounded-xl hover:bg-slate-50"
          >
            <motion.div
              animate={{ x: [0, -4, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <ArrowLeft className="w-5 h-5" />
            </motion.div>
            Back to AccessFix
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Particle component
const Particle = ({ delay = 0 }: { delay?: number }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ 
        opacity: [0, 1, 0],
        scale: [0, 1, 0],
        y: [0, -100, -200],
        x: [0, 50, -50],
        rotate: [0, 180, 360]
      }}
      transition={{
        duration: Math.random() * 10 + 10,
        repeat: Infinity,
        delay: Math.random() * 5,
        ease: "linear"
      }}
      className="absolute bg-blue-500/20 rounded-full"
      style={{
        width: Math.random() * 8 + 3,
        height: Math.random() * 8 + 3,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
      }}
    />
  );
};

export function Auth() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const { signIn, signUp, signInWithGitHub } = useAuth();

  const resetAuthView = () => {
    setShowConfirmation(false);
    setIsSignUp(false);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        await signUp(email, password);
        setShowConfirmation(true);
      } else {
        await signIn(email, password);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGitHubLogin = async () => {
    try {
      setError('');
      setLoading(true);
      await signInWithGitHub();
    } catch (err: any) {
      setError(err.message || 'GitHub login failed.');
    } finally {
      setLoading(false);
    }
  };

  // Updated features array with completed features
  const completedFeatures = [
    {
      icon: Globe,
      title: 'Website Scanner',
      description: 'Scan any live website for accessibility issues in real-time with our advanced AI-powered analysis',
      color: 'from-blue-500 to-cyan-500',
      gradient: 'bg-gradient-to-r from-blue-500 to-cyan-500',
      status: 'live'
    },
    {
      icon: Github,
      title: 'GitHub Integration',
      description: 'Connect your repositories for automated accessibility checks in your CI/CD pipeline',
      color: 'from-green-500 to-emerald-500',
      gradient: 'bg-gradient-to-r from-green-500 to-emerald-500',
      status: 'live'
    },
    {
      icon: Upload,
      title: 'HTML File Upload',
      description: 'Upload and scan HTML files directly from your device with instant feedback',
      color: 'from-blue-600 to-blue-700',
      gradient: 'bg-gradient-to-r from-blue-600 to-blue-700',
      status: 'live'
    },
    {
      icon: BarChart3,
      title: 'Scoring System',
      description: 'Get comprehensive accessibility scores and track your progress over time',
      color: 'from-purple-500 to-pink-500',
      gradient: 'bg-gradient-to-r from-purple-500 to-pink-500',
      status: 'live'
    },
    {
      icon: FileText,
      title: 'Plain English Reports',
      description: 'Download easy-to-understand reports without confusing WCAG technical jargon',
      color: 'from-orange-500 to-red-500',
      gradient: 'bg-gradient-to-r from-orange-500 to-red-500',
      status: 'live'
    },
    {
      icon: GitPullRequest,
      title: 'GitHub PR Generation',
      description: 'Automatically create PRs with accessibility fixes and detailed suggestions',
      color: 'from-green-600 to-teal-500',
      gradient: 'bg-gradient-to-r from-green-600 to-teal-500',
      status: 'live'
    }
  ];

  const stats = [
    { number: '99.9%', label: 'Accuracy Rate', icon: Target },
    { number: '50+', label: 'Projects Scanned', icon: Workflow },
    { number: '50ms', label: 'Average Scan Time', icon: Zap },
    { number: '100%', label: 'GitHub Success', icon: ShieldCheck }
  ];

  // Updated upcoming features
  const upcomingFeatures = [
    {
      icon: Brain,
      title: 'Advanced AI Analysis',
      description: 'Double-check findings and generate intelligent reports with advanced AI',
      timeline: 'Next Release',
      status: 'development'
    },
    {
      icon: Palette,
      title: 'Color Analysis',
      description: 'Get color palette ratings and suggestions for better accessibility',
      timeline: 'Next Release',
      status: 'development'
    },
    {
      icon: Shield,
      title: 'Layout Suggestions',
      description: 'Receive intelligent layout recommendations for optimal UX',
      timeline: 'Coming Soon',
      status: 'planning'
    },
    {
      icon: Rocket,
      title: 'Performance Optimization',
      description: 'Automated suggestions for improving accessibility performance',
      timeline: 'Coming Soon',
      status: 'planning'
    }
  ];

  const currentFeatures = [
    'Real-time scanning with instant results',
    'WCAG 2.1/2.2 compliance checking',
    'Seamless CI/CD integration',
    'GitHub Actions support',
    'Detailed, actionable reports',
    'Axe-core integration',
    'Accessibility scoring system',
    'Plain English reporting',
    'Automated PR generation',
    'Progress tracking dashboard'
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: "easeOut" }
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  if (showConfirmation) {
    return <EmailConfirmation email={email} resetView={resetAuthView} />;
  }

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Hero Section with Integrated Navbar */}
      <section className="relative min-h-screen flex flex-col overflow-hidden bg-slate-950">
        {/* Advanced Gradient Background */}
        <div className="absolute inset-0">
          {/* Main gradient layers */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-950/80 to-slate-900" />
          <div className="absolute inset-0 bg-gradient-to-tr from-emerald-950/20 via-transparent to-blue-950/30" />
          
          {/* Animated gradient orbs */}
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
              x: [0, 50, 0],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute top-1/4 -left-10 w-72 h-72 bg-gradient-to-r from-blue-500/10 to-cyan-400/10 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.4, 0.2, 0.4],
              y: [0, -30, 0],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2
            }}
            className="absolute bottom-1/3 -right-10 w-96 h-96 bg-gradient-to-r from-emerald-500/10 to-green-400/10 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.2, 0.4, 0.2],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-purple-500/5 to-pink-500/5 rounded-full blur-3xl"
          />
        </div>

        {/* Grid Background */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]" />

        {/* Animated Code Elements */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ 
                opacity: 0,
                y: Math.random() * 100 - 50,
                x: Math.random() * 100 - 50 
              }}
              animate={{ 
                opacity: [0, 0.3, 0],
                y: [0, -100, -200],
              }}
              transition={{
                duration: Math.random() * 10 + 10,
                repeat: Infinity,
                delay: Math.random() * 5,
                ease: "linear"
              }}
              className="absolute text-slate-400/20 font-mono text-sm"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
            >
              {[
                'function accessible() {',
                'const a11y = true;',
                'aria-label="main navigation"',
                'role="navigation"',
                'tabIndex={0}',
                'alt="Descriptive text"',
                'WCAG 2.2 AA Compliant',
                'color-contrast: 4.5:1'
              ][i % 8]}
            </motion.div>
          ))}
        </div>

        {/* Floating UI Elements */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Floating cards */}
          <motion.div
            animate={{
              y: [0, -20, 0],
              rotate: [0, 5, 0],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute top-20 left-10 w-24 h-32 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-2xl border border-blue-500/20 backdrop-blur-sm"
          />
          <motion.div
            animate={{
              y: [0, 20, 0],
              rotate: [0, -5, 0],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1
            }}
            className="absolute bottom-40 right-16 w-28 h-20 bg-gradient-to-br from-emerald-500/10 to-green-500/10 rounded-2xl border border-emerald-500/20 backdrop-blur-sm"
          />
          <motion.div
            animate={{
              y: [0, -15, 0],
              x: [0, 10, 0],
            }}
            transition={{
              duration: 7,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2
            }}
            className="absolute top-1/3 right-1/4 w-20 h-24 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-2xl border border-purple-500/20 backdrop-blur-sm"
          />
        </div>

        {/* Main Content */}
        <motion.header 
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="relative z-50 w-full"
        >
          <div className="container mx-auto px-6 py-6">
            <div className="flex items-center justify-between">
              <motion.div 
                className="flex items-center space-x-3"
                whileHover={{ scale: 1.02 }}
              >
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-green-500 rounded-xl blur-sm opacity-75" />
                  <img
                    src="/assets/AccessFixLogo.png"
                    alt="AccessFix Logo"
                    className="relative w-12 h-12 rounded-xl shadow-2xl object-cover border border-white/10"
                  />
                </motion.div>
                <motion.span 
                  className="text-2xl font-bold bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent"
                  whileHover={{ scale: 1.05 }}
                >
                  AccessFix
                </motion.span>
              </motion.div>
              
              <motion.div className="flex items-center gap-4">
                <motion.button
                  whileHover={{ scale: 1.05, y: -1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                  className="hidden sm:flex items-center gap-2 text-slate-300 hover:text-white px-4 py-2 rounded-full font-medium transition-all duration-300 hover:bg-white/5"
                >
                  <Code className="w-4 h-4" />
                  Features
                </motion.button>
                <motion.button
                  whileHover={{ 
                    scale: 1.05, 
                    y: -1,
                    boxShadow: "0 10px 30px -10px rgba(34, 197, 94, 0.3)"
                  }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => document.getElementById('cta-section')?.scrollIntoView({ behavior: 'smooth' })}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-2.5 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
                >
                  <Rocket className="w-4 h-4" />
                  Join Beta
                </motion.button>
              </motion.div>
            </div>
          </div>
        </motion.header>

        {/* Hero Content */}
        <div className="flex-1 flex items-center justify-center relative z-10">
          <div className="text-center text-white px-6 max-w-6xl mx-auto">
            {/* Enhanced Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              whileHover={{ scale: 1.05, y: -2 }}
              className="inline-flex items-center gap-3 bg-gradient-to-r from-green-500/10 to-emerald-500/10 backdrop-blur-lg rounded-full px-6 py-3 mb-12 border border-green-500/20 shadow-2xl"
            >
              <motion.div
                animate={{ 
                  rotate: [0, 180, 360],
                  scale: [1, 1.2, 1]
                }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <Sparkles className="w-5 h-5 text-green-400" />
              </motion.div>
              <span className="text-sm font-semibold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                🚀 Early Beta • Join us as Pioneers Building Accessible Web
              </span>
              <motion.div
                animate={{ 
                  rotate: [0, -180, -360],
                  scale: [1, 1.1, 1]
                }}
                transition={{ duration: 3, repeat: Infinity, delay: 1 }}
              >
                <Sparkles className="w-5 h-5 text-emerald-400" />
              </motion.div>
            </motion.div>

            {/* Main Heading */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-8"
            >
              <motion.h1 
                className="text-6xl lg:text-8xl font-black mb-8 leading-none"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.8 }}
              >
                <span className="block text-white">Build Websites</span>
                <motion.span 
                  className="block bg-gradient-to-r from-cyan-400 via-blue-400 to-emerald-400 bg-clip-text text-transparent mt-4"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6, duration: 0.8 }}
                >
                  Everyone Can Use
                </motion.span>
              </motion.h1>
            </motion.div>

            {/* Subtitle */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mb-12"
            >
              <p className="text-2xl lg:text-3xl text-slate-300 mb-6 max-w-4xl mx-auto leading-relaxed font-light">
                The complete accessibility platform for modern development teams. 
                <span className="block mt-4 text-transparent bg-gradient-to-r from-cyan-300 to-emerald-300 bg-clip-text font-semibold">
                  Automated testing, intelligent fixes, and compliance—all in one workflow.
                </span>
              </p>
            </motion.div>

            {/* Feature Highlights */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="flex flex-wrap justify-center gap-4 mb-12 max-w-2xl mx-auto"
            >
              {[
                { icon: GitPullRequest, text: 'Auto PR Generation', color: 'from-green-500 to-emerald-500' },
                { icon: BarChart3, text: 'Smart Scoring', color: 'from-blue-500 to-cyan-500' },
                { icon: FileText, text: 'Plain English Reports', color: 'from-purple-500 to-pink-500' },
                { icon: ShieldCheck, text: 'WCAG 2.2 Compliant', color: 'from-orange-500 to-red-500' }
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  whileHover={{ scale: 1.05, y: -2 }}
                  className="flex items-center gap-2 bg-white/5 backdrop-blur-lg rounded-full px-4 py-2.5 border border-white/10 hover:border-white/20 transition-all duration-300"
                >
                  <div className={`w-8 h-8 bg-gradient-to-r ${feature.color} rounded-full flex items-center justify-center`}>
                    <feature.icon className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-medium text-slate-200">{feature.text}</span>
                </motion.div>
              ))}
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              variants={staggerContainer}
              initial="initial"
              animate="animate"
              className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
            >
              <motion.button
                variants={fadeInUp}
                whileHover={{ 
                  scale: 1.05, 
                  y: -2,
                  boxShadow: "0 20px 40px -10px rgba(34, 197, 94, 0.4)"
                }}
                whileTap={{ scale: 0.95 }}
                onClick={() => document.getElementById('cta-section')?.scrollIntoView({ behavior: 'smooth' })}
                className="group relative bg-gradient-to-r from-green-500 to-emerald-600 text-white px-10 py-4 rounded-2xl font-bold text-lg shadow-2xl flex items-center gap-3 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="relative">Start Building Accessibly</span>
                <motion.div 
                  className="relative"
                  animate={{ x: [0, 4, 0] }} 
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <ArrowRight className="w-5 h-5" />
                </motion.div>
              </motion.button>
            
            </motion.div>

            {/* Enhanced Stats */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-3xl mx-auto"
            >
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="group text-center p-6 bg-gradient-to-b from-white/5 to-white/0 rounded-2xl backdrop-blur-lg border border-white/10 hover:border-white/20 transition-all duration-300 cursor-pointer"
                >
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"
                  >
                    <stat.icon className="w-6 h-6 text-white" />
                  </motion.div>
                  <motion.div 
                    className="text-3xl font-black bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-2"
                    whileHover={{ scale: 1.05 }}
                  >
                    {stat.number}
                  </motion.div>
                  <div className="text-sm text-slate-400 font-medium group-hover:text-slate-300 transition-colors">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Enhanced Scroll Indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10"
        >
          <motion.div
            whileHover={{ scale: 1.1 }}
            className="w-10 h-16 border-2 border-white/30 rounded-full flex justify-center backdrop-blur-lg"
          >
            <motion.div
              animate={{ y: [0, 16, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-1.5 h-4 bg-gradient-to-b from-cyan-400 to-blue-400 rounded-full mt-3"
            />
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 relative overflow-hidden">
        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
              Complete Accessibility
              <span className="block bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                Platform
              </span>
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Everything you need to build, test, and maintain accessible web applications
            </p>
          </motion.div>

          {/* Completed Features Grid */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20"
          >
            {completedFeatures.map((feature, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ scale: 1.02, y: -5 }}
                className="group relative bg-white rounded-2xl p-8 shadow-lg border border-slate-200 hover:border-blue-200 transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-4">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className={`w-16 h-16 ${feature.gradient} rounded-2xl flex items-center justify-center shadow-lg`}
                  >
                    <feature.icon className="w-8 h-8 text-white" />
                  </motion.div>
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-green-100 text-green-800 border border-green-200">
                    LIVE
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">{feature.title}</h3>
                <p className="text-slate-600 text-lg leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Current Features List */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white/80 backdrop-blur-lg rounded-2xl p-12 shadow-xl border border-slate-200"
          >
            <div className="text-center mb-12">
              <h3 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
                Everything You Need to Build
                <span className="block bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                  Accessible Web Apps
                </span>
              </h3>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                Our platform now includes automated PR generation, scoring systems, and plain English reports
              </p>
            </div>
            
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {currentFeatures.map((feature, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  whileHover={{ scale: 1.02, x: 5 }}
                  className="flex items-center space-x-3 p-4 bg-slate-50/50 rounded-xl backdrop-blur-sm border border-slate-100"
                >
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity, delay: index * 0.2 }}
                  >
                    <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                  </motion.div>
                  <span className="text-slate-700 font-medium">{feature}</span>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Roadmap Section */}
      <section className="py-20 bg-white relative overflow-hidden">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
              Our Development
              <span className="block bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                Roadmap
              </span>
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              We're constantly evolving to provide the best accessibility testing experience
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 lg:grid-cols-2 gap-8"
          >
            {upcomingFeatures.map((feature, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ scale: 1.02, y: -5 }}
                className="group bg-white rounded-2xl p-8 shadow-lg border border-slate-200 hover:border-blue-200 transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-4">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className="w-12 h-12 bg-gradient-to-r from-slate-600 to-slate-800 rounded-2xl flex items-center justify-center shadow-lg"
                  >
                    <feature.icon className="w-6 h-6 text-white" />
                  </motion.div>
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                    feature.status === 'development' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                    feature.status === 'planning' ? 'bg-green-100 text-green-800 border border-green-200' :
                    'bg-slate-100 text-slate-800 border border-slate-200'
                  }`}>
                    {feature.timeline}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">{feature.description}</p>
                <div className="mt-4 pt-4 border-t border-slate-200/50">
                  <div className="flex items-center text-sm text-slate-500">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className={`w-2 h-2 rounded-full mr-2 ${
                        feature.status === 'development' ? 'bg-blue-500' :
                        feature.status === 'planning' ? 'bg-green-500' :
                        'bg-slate-500'
                      }`}
                    />
                    {feature.status.charAt(0).toUpperCase() + feature.status.slice(1)}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Progress Bar */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16 bg-slate-50 rounded-2xl p-8 border border-slate-200"
          >
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Development Progress</h3>
              <p className="text-slate-600">We've delivered on our core promises and are building the future</p>
            </div>
            
            <div className="space-y-6">
              {[
                { label: 'Core Scanning Features', progress: 100, status: 'Completed' },
                { label: 'GitHub Integration & PR Generation', progress: 100, status: 'Completed' },
                { label: 'Scoring System & Plain English Reports', progress: 100, status: 'Completed' },
                { label: 'Advanced AI Features', progress: 65, status: 'In Development' },
                { label: 'Performance & Layout Optimization', progress: 30, status: 'Planning' }
              ].map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-slate-700">{item.label}</span>
                    <span className="text-slate-500">{item.status}</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-3">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${item.progress}%` }}
                      transition={{ duration: 1.5, delay: index * 0.2 }}
                      className={`h-3 rounded-full ${
                        item.progress === 100 ? 'bg-green-500' :
                        item.progress >= 50 ? 'bg-blue-500' :
                        'bg-orange-500'
                      }`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="cta-section" className="py-20 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 relative overflow-hidden">
        <div className="absolute inset-0">
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.2, 0.3, 0.2],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute top-0 left-0 w-72 h-72 bg-blue-500/20 rounded-full mix-blend-multiply filter blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1.1, 1, 1.1],
              opacity: [0.3, 0.2, 0.3],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1
            }}
            className="absolute bottom-0 right-0 w-96 h-96 bg-green-500/20 rounded-full mix-blend-multiply filter blur-3xl"
          />
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="text-white"
            >
              <h2 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight">
                Ready to Build
                <span className="block text-transparent bg-gradient-to-r from-cyan-400 to-green-400 bg-clip-text">
                  Accessible Web Apps?
                </span>
              </h2>
              <p className="text-xl text-slate-300 mb-8 leading-relaxed">
                Join hundreds of developers who are already using AccessFix to build better, more accessible web experiences. 
                <span className="block mt-2 text-cyan-300 font-semibold">
                  Now with automated PR generation, scoring, and plain English reports!
                </span>
              </p>
              <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="space-y-4"
              >
                {[
                  { icon: Zap, text: 'Free during beta period' },
                  { icon: GitBranch, text: 'Automated PR generation' },
                  { icon: BarChart3, text: 'Accessibility scoring system' },
                  { icon: FileText, text: 'Plain English reports' },
                  { icon: Users, text: 'Direct influence on features' },
                  { icon: Cpu, text: 'Priority support & early access' }
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    variants={itemVariants}
                    className="flex items-center space-x-3"
                  >
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-lg"
                    >
                      <item.icon className="w-4 h-4 text-white" />
                    </motion.div>
                    <span className="text-slate-200">{item.text}</span>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.02 }}
              className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-xl p-8 border border-white/20"
            >
              <div className="text-center mb-8">
                <motion.div 
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  className="w-16 h-16 bg-gradient-to-r from-blue-600 to-green-600 rounded-xl flex items-center justify-center shadow-lg backdrop-blur-sm"
                >
                  <img
                    src="/assets/AccessFixLogo.png"
                    alt="Logo"
                    className="w-12 h-12 object-contain"
                  />
                </motion.div>

                <motion.h3
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-2xl font-bold text-white mb-2"
                >
                  {isSignUp ? 'Join AccessFix Beta' : 'Welcome Back'}
                </motion.h3>
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-white/80"
                >
                  {isSignUp ? 'Start your accessibility journey today' : 'Sign in to your dashboard'}
                </motion.p>
              </div>

              <div className="flex gap-2 mb-6 bg-white/10 rounded-xl p-1 backdrop-blur-sm">
                <motion.button
                  type="button"
                  onClick={() => setIsSignUp(false)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-300 ${
                    !isSignUp 
                      ? 'bg-white text-slate-900 shadow-lg' 
                      : 'text-white hover:bg-white/10'
                  }`}
                >
                  Sign In
                </motion.button>
                <motion.button
                  type="button"
                  onClick={() => setIsSignUp(true)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-300 ${
                    isSignUp 
                      ? 'bg-white text-slate-900 shadow-lg' 
                      : 'text-white hover:bg-white/10'
                  }`}
                >
                  Sign Up
                </motion.button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-300 backdrop-blur-sm hover:bg-white/15"
                    placeholder="name@company.com"
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <label htmlFor="password" className="block text-sm font-medium text-white mb-2">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-300 backdrop-blur-sm hover:bg-white/15"
                    placeholder="minimum 6 characters"
                  />
                </motion.div>

                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex items-start gap-3 p-4 bg-red-500/20 border border-red-500/30 rounded-xl backdrop-blur-sm"
                    >
                      <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-red-200">{error}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-500 to-green-600 text-white py-3.5 px-4 rounded-xl font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="flex items-center justify-center gap-2"
                    >
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                      Processing...
                    </motion.div>
                  ) : isSignUp ? (
                    'Join Beta Program'
                  ) : (
                    'Sign In to Dashboard'
                  )}
                </motion.button>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="flex items-center my-6"
                >
                  <div className="flex-grow border-t border-white/20"></div>
                  <span className="mx-4 text-white/60 text-sm">or continue with</span>
                  <div className="flex-grow border-t border-white/20"></div>
                </motion.div>

                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={handleGitHubLogin}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 bg-slate-900 text-white py-3.5 px-4 rounded-xl font-medium hover:bg-slate-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed border border-white/10"
                >
                  <Github className="w-5 h-5" />
                  Continue with GitHub
                </motion.button>
              </form>
            </motion.div>
          </div>
        </div>
      </section>

      <motion.footer
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="bg-slate-900 text-white py-12 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-green-500/10"></div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="w-12 h-12 bg-gradient-to-r from-blue-600 to-green-600 rounded-lg flex items-center justify-center shadow-lg"
              >
                <img
                  src="/assets/AccessFixLogo.png"
                  alt="Logo"
                  className="w-10 h-10 object-contain"
                />
              </motion.div>

              <span className="text-xl font-bold">AccessFix</span>
            </div>
            <div className="text-slate-400 text-center md:text-right">
              <p>© 2024 AccessFix. All rights reserved.</p>
              <p className="text-sm mt-1">Lets build a more accessible web</p>
            </div>
          </div>
        </div>
      </motion.footer>
    </div>
  );
}
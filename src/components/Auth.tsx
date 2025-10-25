// src/pages/Auth.tsx
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { AlertCircle, Mail, ArrowLeft, Github, Zap, Shield, Code, Upload, Download, GitPullRequest, Star, Palette, Brain, ArrowRight, CheckCircle, Sparkles, Globe, Cpu, Users } from 'lucide-react';

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

  const features = [
    {
      icon: Globe,
      title: 'Website Scanner',
      description: 'Scan any live website for accessibility issues in real-time with our advanced AI-powered analysis',
      color: 'from-blue-500 to-cyan-500',
      gradient: 'bg-gradient-to-r from-blue-500 to-cyan-500'
    },
    {
      icon: Github,
      title: 'GitHub Integration',
      description: 'Connect your repositories for automated accessibility checks in your CI/CD pipeline',
      color: 'from-green-500 to-emerald-500',
      gradient: 'bg-gradient-to-r from-green-500 to-emerald-500'
    },
    {
      icon: Upload,
      title: 'HTML File Upload',
      description: 'Upload and scan HTML files directly from your device with instant feedback',
      color: 'from-blue-600 to-blue-700',
      gradient: 'bg-gradient-to-r from-blue-600 to-blue-700'
    }
  ];

  const stats = [
    { number: '99.9%', label: 'Accuracy Rate' },
    { number: '5+', label: 'Active Projects' },
    { number: '50ms', label: 'Scan Speed' },
    { number: 'Frequent', label: 'Updates' }
  ];

  const upcomingFeatures = [
    {
      icon: Download,
      title: 'Plain English Reports',
      description: 'Download easy-to-understand reports without confusing WCAG codes',
      timeline: 'Near Future',
      status: 'development'
    },
    {
      icon: GitPullRequest,
      title: 'GitHub PR Generation',
      description: 'Automatically create PRs with accessibility fixes and suggestions',
      timeline: 'Near Future',
      status: 'development'
    },
    {
      icon: Star,
      title: 'Scoring System',
      description: 'Get comprehensive accessibility scores and progress tracking',
      timeline: 'Near Future',
      status: 'planning'
    },
    {
      icon: Brain,
      title: 'AI Integration',
      description: 'Double-check findings and generate intelligent reports with advanced AI',
      timeline: 'Long Term',
      status: 'research'
    },
    {
      icon: Palette,
      title: 'Color Analysis',
      description: 'Get color palette ratings and suggestions for better accessibility',
      timeline: 'Long Term',
      status: 'research'
    },
    {
      icon: Shield,
      title: 'Layout Suggestions',
      description: 'Receive intelligent layout recommendations for optimal UX',
      timeline: 'Long Term',
      status: 'research'
    }
  ];

  const currentFeatures = [
    'Real-time scanning with instant results',
    'WCAG 2.1/2.2 compliance checking',
    'Seamless CI/CD integration',
    'GitHub Actions support',
    'Detailed, actionable reports',
    'Axe-core integration'
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
      <section className="relative min-h-screen flex flex-col overflow-hidden">
        {/* Background with coding theme */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
          {/* Code-like background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 text-green-400/20 font-mono text-sm">{'<div className="accessible">'}</div>
            <div className="absolute top-20 left-20 text-blue-400/20 font-mono text-sm">{'const accessible = true;'}</div>
            <div className="absolute top-32 left-16 text-cyan-400/20 font-mono text-sm">{'// WCAG 2.2 Compliant'}</div>
            <div className="absolute bottom-20 right-10 text-green-400/20 font-mono text-sm">{'</div>'}</div>
            <div className="absolute bottom-32 right-20 text-blue-400/20 font-mono text-sm">{'aria-label="navigation"'}</div>
          </div>
        </div>

        {/* Animated Orbs */}
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.25, 0.15] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full mix-blend-multiply filter blur-3xl"
        />
        <motion.div
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.25, 0.15, 0.25] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-green-500/20 rounded-full mix-blend-multiply filter blur-3xl"
        />

        {/* Floating Particles */}
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 20 }).map((_, i) => (
            <Particle key={i} delay={i * 150} />
          ))}
        </div>

        {/* Integrated Navbar - Part of Hero Section */}
        <motion.header 
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="relative z-50 w-full bg-transparent"
        >
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <motion.img
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  src="/assets/AccessFixLogo.png"
                  alt="Logo"
                  className="w-10 h-10 rounded-xl shadow-lg backdrop-blur-sm object-cover"
                />
                <span className="text-2xl font-bold text-white drop-shadow-lg">
                  AccessFix
                </span>
              </div>
              <motion.button
                whileHover={{ scale: 1.05, y: -1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  document.getElementById('cta-section')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="bg-white/20 backdrop-blur-lg text-white px-6 py-2 rounded-full font-medium border border-white/30 hover:bg-white/30 transition-all duration-300"
              >
                Join Beta
              </motion.button>
            </div>
          </div>
        </motion.header>

        {/* Main Hero Content */}
        <div className="flex-1 flex items-center justify-center relative z-10">
          <div className="text-center text-white px-6 max-w-6xl mx-auto">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              whileHover={{ scale: 1.05, y: -2 }}
              className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-lg rounded-full px-4 py-2 mb-8 border border-white/20"
            >
              <motion.div
                animate={{ rotate: [0, 180, 360] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Sparkles className="w-4 h-4 text-green-400" />
              </motion.div>
              <span className="text-sm font-medium">Early Beta • Join our first Pioneers</span>
            </motion.div>

            {/* Heading */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-6"
            >
              <h1 className="text-5xl lg:text-7xl font-bold mb-6 leading-tight">
                Build
                <motion.span 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                  className="block text-transparent bg-gradient-to-r from-cyan-400 via-blue-400 to-green-400 bg-clip-text mt-2"
                >
                  Accessible Web Experiences
                </motion.span>
              </h1>
            </motion.div>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-xl lg:text-2xl text-slate-200 mb-8 max-w-3xl mx-auto leading-relaxed"
            >
              Developer-first accessibility testing that integrates seamlessly into your workflow. 
              <motion.span 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="block mt-2 text-cyan-300 font-semibold"
              >
                Catch compliance issues before they reach production.
              </motion.span>
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              variants={staggerContainer}
              initial="initial"
              animate="animate"
              className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
            >
              <motion.button
                variants={fadeInUp}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => document.getElementById('cta-section')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-gradient-to-r from-blue-500 to-green-600 text-white px-8 py-4 rounded-full font-semibold text-lg shadow-2xl flex items-center gap-2"
              >
                Start Free Beta 
                <motion.div animate={{ x: [0, 4, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
                  <ArrowRight className="w-5 h-5" />
                </motion.div>
              </motion.button>
              <motion.button 
                variants={fadeInUp}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                className="border-2 border-white text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-white hover:text-slate-900 backdrop-blur-sm"
              >
                See Features
              </motion.button>
            </motion.div>

            {/* Stats */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto"
            >
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  whileHover={{ scale: 1.05, y: -2 }}
                  className="text-center p-4 bg-white/5 rounded-2xl backdrop-blur-sm border border-white/10"
                >
                  <div className="text-2xl font-bold text-cyan-300 mb-1">{stat.number}</div>
                  <div className="text-sm text-slate-300">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10"
        >
          <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center backdrop-blur-sm">
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-1 h-3 bg-white rounded-full mt-2"
            />
          </div>
        </motion.div>
      </section>

      {/* Rest of the sections remain the same */}
      <section id="features" className="py-20 bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 relative overflow-hidden">
        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
              Comprehensive Accessibility
              <span className="block bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                Testing Suite
              </span>
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Multiple ways to scan and improve your web accessibility, all in one powerful platform
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-8 mb-20"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ scale: 1.02, y: -5 }}
                className="group relative bg-white rounded-2xl p-8 shadow-lg border border-slate-200 hover:border-blue-200 transition-all duration-300"
              >
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className={`w-16 h-16 ${feature.gradient} rounded-2xl flex items-center justify-center mb-6 shadow-lg`}
                >
                  <feature.icon className="w-8 h-8 text-white" />
                </motion.div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">{feature.title}</h3>
                <p className="text-slate-600 text-lg leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>

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
                Our beta platform includes powerful features to help you create web experiences that work for everyone
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

      <section className="py-20 bg-white relative overflow-hidden">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
              Our Accessibility
              <span className="block bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                Journey
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
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
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
        </div>
      </section>

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
                We're in <span className='text-emerald-300 font-bold'>beta</span> and <span className='text-sky-300 font-bold'>building in public</span>. Join early testers who are helping us 
                refine features, catch bugs, and create something <span className='text-rose-300'>developers will love</span>.
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
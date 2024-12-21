"use client"

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { 
  ArrowRight, 
  Target, 
  MessageCircle, 
  Bot, 
  ChevronDown, 
  Users, 
  Bell,
  Play,
  X,
  ArrowUpRight,
  Sparkles,
  Network
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from 'next-auth/react';

const fadeInVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  transition: { duration: 0.5 }
};

const staggerChildren = {
  initial: {
    opacity: 0
  },
  animate: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};
// Floating animation component
const FloatingElement = ({ children, delay = 0, duration = 3, className = "" }: {
  children: React.ReactNode;
  delay?: number;
  duration?: number; 
  className?: string;
}) => (
  <motion.div
    className={className}
    animate={{
      y: [0, -20, 0],
      x: [0, 10, 0]
    }}
    transition={{
      duration,
      repeat: Infinity,
      repeatType: "reverse",
      delay,
      ease: "easeInOut"
    }}
  >
    {children}
  </motion.div>
);

// Video Modal Component
const VideoModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative w-full max-w-4xl mx-4 aspect-video bg-black rounded-lg overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          <button
            className="absolute top-4 right-4 text-white/80 hover:text-white z-10"
            onClick={onClose}
          >
            <X size={24} />
          </button>
          <video
            className="w-full h-full"
            controls
            autoPlay
            // Put your video in the public folder
            src="/videos/altitude.mp4"
          >
            Your browser does not support the video tag.
          </video>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

// Enhanced Features Component
const FeatureStep = ({ 
  number, 
  title, 
  description,
  color, 
  stats, 
  visual 
}: {
  number: string | number;
  title: string;
  description: string;
  color: string;
  stats: string[];
  visual: React.ReactNode;
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div 
      className="relative"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.div 
        className="absolute inset-0 bg-gradient-to-r from-gray-50 to-transparent rounded-xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered ? 0.5 : 0 }}
        transition={{ duration: 0.3 }}
      />

      <div className="grid md:grid-cols-2 gap-12 items-center p-8 rounded-xl">
        <div className="flex items-start gap-8 relative z-10">
          <div className="text-4xl font-bold" style={{ color: `${color}20` }}>{number}</div>
          <div className="flex-1">
            <h3 className="text-2xl font-bold mb-3" style={{ color }}>{title}</h3>
            <p className="text-gray-600 mb-6">{description}</p>
            <ul className="space-y-4">
              {stats.map((stat, index) => (
                <motion.li 
                  key={index}
                  className="flex items-center gap-3 text-lg text-gray-600"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <motion.div 
                    className="h-2 w-2 rounded-full" 
                    style={{ backgroundColor: color }}
                    animate={{ scale: isHovered ? 1.2 : 1 }}
                  />
                  {stat}
                </motion.li>
              ))}
            </ul>
          </div>
        </div>
        <div className="relative">
          {visual}
        </div>
      </div>
    </motion.div>
  );
};

// Enhanced Testimonial Card
const AnimatedTestimonialCard = ({ 
  quote,
  author, 
  role,
  image
}: {
  quote: string;
  author: string;
  role: string;
  image?: string;
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div 
      className="p-8 rounded-xl hover:shadow-xl transition-shadow relative overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.div 
        className="absolute inset-0 bg-gradient-to-br from-gray-50 to-white"
        animate={{ 
          opacity: isHovered ? 1 : 0.5 
        }}
      />
      
      <div className="relative z-10">
        <div className="mb-6">
          {[...Array(5)].map((_, i) => (
            <motion.span
              key={i}
              className="text-yellow-400 inline-block"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
            >
              ★
            </motion.span>
          ))}
        </div>
        <p className="text-gray-600 mb-6 italic relative">
          &quot;{quote}&quot;
          <motion.span
            className="absolute -left-4 -top-4 text-4xl text-gray-200"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            &quot;
          </motion.span>
        </p>
        <div className="flex items-center gap-4">
          {image && (
            <img 
              src={image} 
              alt={author} 
              className="w-12 h-12 rounded-full object-cover"
            />
          )}
          <div>
            <p className="font-semibold text-gray-900">{author}</p>
            <p className="text-sm text-gray-500">{role}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Main Landing Page Component
export default function LandingPage() {
  const { data: session } = useSession();
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Track scroll progress
  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      const currentProgress = window.scrollY / totalScroll;
      setScrollProgress(currentProgress);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#031b1d] to-[#08464B] z-50"
        style={{ 
          scaleX: scrollProgress,
          transformOrigin: "0%" 
        }}
      />

      {/* Navigation */}
      <motion.nav
        className="fixed top-0 left-0 right-0 z-40 backdrop-blur-sm bg-white/80 border-b border-gray-200/50"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <motion.div 
            className="flex items-center space-x-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="w-8 h-8">
              <img src="/altitude.png" alt="Altitude logo" className="w-full h-full" />
            </div>
            <span className="text-xl font-bold">
              <Link href="/">Altitude</Link>
            </span>
          </motion.div>
          <div className="flex items-center space-x-4">
            {session ? (
              <>
                <Button variant="ghost" asChild>
                  <Link href="/dashboard">Dashboard</Link>
                </Button>
                {session.user?.name && (
                  <span className="text-gray-700">
                    {session.user.name}
                  </span>
                )}
              </>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link href="/auth/signin">Log in</Link>
                </Button>
                <Button 
                  className="bg-[#031b1d] hover:bg-[#031b1d]/90"
                  asChild
                >
                  <Link href="/signup">
                    Get Started
                    <ArrowUpRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="min-h-screen flex flex-col justify-center items-center relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <FloatingElement className="absolute top-20 left-20" delay={0}>
            <div className="w-64 h-64 rounded-full bg-blue-100/20 blur-3xl" />
          </FloatingElement>
          <FloatingElement className="absolute bottom-20 right-20" delay={1}>
            <div className="w-96 h-96 rounded-full bg-emerald-100/20 blur-3xl" />
          </FloatingElement>
        </div>

        <div className="container mx-auto px-6 text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="inline-flex items-center bg-gray-900/5 rounded-full px-6 py-2 text-sm text-gray-600"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Trusted by students from top universities
            </motion.div>

            <h1 className="text-7xl md:text-8xl font-bold tracking-tight leading-tight">
              <span className="bg-gradient-to-r from-[#031b1d] to-[#08464B] bg-clip-text text-transparent">
                Connect Smarter,
              </span>
              <br />
              <span className="bg-gradient-to-r from-[#08464B] to-[#0D3B79] bg-clip-text text-transparent">
                Climb Higher
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 max-w-2xl mx-auto">
              AI-powered networking that turns cold outreach into warm introductions
            </p>

            <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
              <Button 
                size="lg" 
                className="bg-[#031b1d] hover:bg-[#031b1d]/90 h-14 px-8 text-lg group relative overflow-hidden"
                asChild
              >
                <Link href="/dashboard">
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-[#08464B] to-[#031b1d]"
                    initial={{ x: '100%' }}
                    whileHover={{ x: 0 }}
                    transition={{ duration: 0.3 }}
                  />
                  <span className="relative z-10">
                    Start Your Journey <ArrowRight className="ml-2 h-5 w-5 inline-block group-hover:translate-x-1 transition-transform" />
                  </span>
                </Link>
              </Button>

              <Button
                size="lg"
                variant="outline"
                className="h-14 px-8 text-lg relative overflow-hidden group"
                onClick={() => setIsVideoOpen(true)}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-[#031b1d]/10 to-[#08464B]/10"
                  initial={{ scaleX: 0 }}
                  whileHover={{ scaleX: 1 }}
                  transition={{ duration: 0.3 }}
                />
                <span className="relative z-10 flex items-center">
                  <Play className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                  Watch Demo
                </span>
              </Button>
            </div>

            {/* Preview Cards */}
            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <motion.div
                className="bg-white shadow-lg rounded-xl p-6 text-left"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Network className="h-8 w-8 text-blue-500 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Smart Matching</h3>
                <p className="text-gray-600">AI-powered profile matching finds your ideal connections.</p>
              </motion.div>

              <motion.div
                className="bg-white shadow-lg rounded-xl p-6 text-left"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <MessageCircle className="h-8 w-8 text-green-500 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Perfect Messages</h3>
                <p className="text-gray-600">Personalized outreach that gets responses.</p>
              </motion.div>

              <motion.div
                className="bg-white shadow-lg rounded-xl p-6 text-left"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <Target className="h-8 w-8 text-purple-500 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Track Progress</h3>
                <p className="text-gray-600">Monitor and optimize your networking success.</p>
              </motion.div>
            </div>
          </motion.div>
        </div>

        <motion.div 
          className="absolute bottom-10 cursor-pointer"
          animate={{ 
            y: [0, 10, 0],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{ 
            duration: 2, 
            repeat: Infinity,
            ease: "easeInOut"
          }}
          onClick={() => {
            window.scrollTo({
              top: window.innerHeight,
              behavior: 'smooth'
            });
          }}
        >
          <ChevronDown className="h-8 w-8 text-gray-400" />
        </motion.div>
      </section>

      {/* Video Modal */}
      <VideoModal isOpen={isVideoOpen} onClose={() => setIsVideoOpen(false)} />

      {/* Trust Logos Section */}
      <section className="py-16 bg-gray-50 overflow-hidden">
        <div className="container mx-auto px-6">
          <p className="text-center text-gray-500 text-lg mb-10">
            Trusted by students from
          </p>
          
          <motion.div
            className="relative w-full"
            variants={fadeInVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {/* Gradient Overlays */}
            <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-gray-50 to-transparent z-10" />
            <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-gray-50 to-transparent z-10" />
            
            {/* Logo Track */}
            <div className="flex overflow-hidden">
              <div className="flex animate-scroll-left gap-16 min-w-full">
                <div className="flex items-center gap-32 grayscale">
                  <img src="/uiuc.png" alt="University of Illinois Urbana-Champaign" className="h-12 object-contain hover:grayscale-0 transition-all duration-200" />
                  <img src="/umich.png" alt="University of Michigan" className="h-12 object-contain hover:grayscale-0 transition-all duration-200" />
                  <img src="/purdue.png" alt="Purdue University" className="h-12 object-contain hover:grayscale-0 transition-all duration-200" />
                  <img src="/gatech.png" alt="Georgia Tech" className="h-12 object-contain hover:grayscale-0 transition-all duration-200" />
                  <img src="/berkeley.png" alt="UC Berkeley" className="h-12 object-contain hover:grayscale-0 transition-all duration-200" />
                  <img src="/penn.png" alt="University of Pennsylvania" className="h-12 object-contain hover:grayscale-0 transition-all duration-200" />
                  <img src="/pomona.png" alt="Pomona College" className="h-12 object-contain hover:grayscale-0 transition-all duration-200" />
                  <img src="/utaustin.png" alt="UT Austin" className="h-12 object-contain hover:grayscale-0 transition-all duration-200" />
                </div>
              </div>
              
              {/* Duplicate for seamless loop */}
              <div className="flex animate-scroll-left gap-16 min-w-full">
                <div className="flex items-center gap-32 grayscale">
                  <img src="/uiuc.png" alt="University of Illinois Urbana-Champaign" className="h-12 object-contain hover:grayscale-0 transition-all duration-200" />
                  <img src="/umich.png" alt="University of Michigan" className="h-12 object-contain hover:grayscale-0 transition-all duration-200" />
                  <img src="/purdue.png" alt="Purdue University" className="h-12 object-contain hover:grayscale-0 transition-all duration-200" />
                  <img src="/gatech.png" alt="Georgia Tech" className="h-12 object-contain hover:grayscale-0 transition-all duration-200" />
                  <img src="/berkeley.png" alt="UC Berkeley" className="h-12 object-contain hover:grayscale-0 transition-all duration-200" />
                  <img src="/penn.png" alt="University of Pennsylvania" className="h-12 object-contain hover:grayscale-0 transition-all duration-200" />
                  <img src="/pomona.png" alt="Pomona College" className="h-12 object-contain hover:grayscale-0 transition-all duration-200" />
                  <img src="/utaustin.png" alt="UT Austin" className="h-12 object-contain hover:grayscale-0 transition-all duration-200" />
                  <img src="/uwash.png" alt="University of Washington" className="h-12 object-contain hover:grayscale-0 transition-all duration-200" />
                </div>
              </div>
            </div>
          </motion.div>
        </div>


    </section>


      {/* Features Section */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto mb-20"
          >
            <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-[#031b1d] to-[#08464B] bg-clip-text text-transparent">
              Why Altitude Makes the Difference
            </h2>
            <p className="text-xl text-gray-600">
              Our AI-powered platform transforms how you network, making connections more meaningful and effective.
            </p>
          </motion.div>
          
          <div className="max-w-6xl mx-auto space-y-32">
            <FeatureStep 
              number="01"
              title="Smart Profile Targeting"
              description="Find the perfect connections based on your career goals and interests."
              color="#0D3B79"
              stats={[
                "90% faster prospect identification",
                "More relevant connections",
                "AI-powered company & role matching"
              ]}
              visual={
                <div className="relative w-full h-64">
                  <motion.div 
                    className="absolute inset-0 flex items-center justify-center"
                    initial={{ scale: 0.8, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true }}
                  >
                    <div className="relative">
                      <motion.div 
                        className="absolute -inset-4 bg-indigo-100 rounded-lg"
                        animate={{ 
                          scale: [1, 1.2, 1],
                          opacity: [0.5, 0.8, 0.5]
                        }}
                        transition={{
                          duration: 4,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      />
                      <Users size={80} className="text-indigo-600 relative z-10" />
                      <motion.div
                        className="absolute top-0 right-0 w-12 h-12 bg-indigo-200 rounded-full"
                        animate={{
                          scale: [1, 1.5, 1],
                          opacity: [0.5, 0, 0.5]
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeOut"
                        }}
                      />
                    </div>
                  </motion.div>
                </div>
              }
            />

            <FeatureStep 
              number="02"
              title="Personalized Outreach"
              description="Generate customized messages that resonate with your connections."
              color="#0D3B79"
              stats={[
                "73% higher response rate",
                "Generate custom messages in seconds",
                "Context-aware conversation starters"
              ]}
              visual={
                <div className="relative w-full h-64">
                  <motion.div 
                    className="absolute inset-0 flex items-center justify-center"
                    initial={{ scale: 0.8, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true }}
                  >
                    <div className="space-y-2">
                      <motion.div 
                        className="bg-cyan-100 p-3 rounded-lg flex items-center gap-2 shadow-lg"
                        whileHover={{ y: -2, scale: 1.02 }}
                      >
                        <MessageCircle className="text-cyan-600" />
                        <span className="text-sm font-medium text-cyan-800">AI Generated Message</span>
                      </motion.div>
                      <motion.div 
                        className="bg-cyan-50 p-3 rounded-lg flex items-center gap-2"
                        whileHover={{ y: -2, scale: 1.02 }}
                      >
                        <Bot className="text-cyan-500" />
                        <span className="text-sm text-cyan-700">Smart Templates</span>
                      </motion.div>
                    </div>
                  </motion.div>
                </div>
              }
            />

            <FeatureStep 
              number="03"
              title="Relationship Management"
              description="Never miss a follow-up with intelligent tracking and reminders."
              color="#0D3B79"
              stats={[
                "Track 100+ connections effortlessly",
                "45% better follow-up rate",
                "Smart kanban system"
              ]}
              visual={
                <div className="relative w-full h-64">
                  <motion.div 
                    className="absolute inset-0 flex items-center justify-center"
                    initial={{ scale: 0.8, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true }}
                  >
                    <div className="relative">
                      <motion.div 
                        className="absolute -inset-6 bg-emerald-100 rounded-xl"
                        animate={{
                          scale: [1, 1.1, 1],
                          opacity: [0.5, 0.8, 0.5]
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      />
                      <div className="relative z-10 flex flex-col items-center gap-3">
                        <Bell className="text-emerald-600 h-12 w-12" />
                        <div className="flex gap-2">
                          <motion.span 
                            className="px-3 py-1 bg-emerald-200 rounded-full text-sm text-emerald-700"
                            whileHover={{ scale: 1.05 }}
                          >
                            Follow up
                          </motion.span>
                          <motion.span 
                            className="px-3 py-1 bg-emerald-200 rounded-full text-sm text-emerald-700"
                            whileHover={{ scale: 1.05 }}
                          >
                            Connect
                          </motion.span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              }
            />
          </div>
        </div>
      </section>

      {/* Success Stories Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <motion.div
            className="text-center max-w-2xl mx-auto mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold mb-4">Success Stories</h2>
            <p className="text-gray-600">
              Join thousands of students who&apos;ve transformed their career journey with Altitude
            </p>
          </motion.div>

          <motion.div 
            className="grid md:grid-cols-3 gap-8"
            variants={staggerChildren}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <AnimatedTestimonialCard 
              quote="Altitude helped me land my dream internship at Goldman Sachs. The personalized messages made all the difference when I was setting up coffee chats!"
              author="Sarah K."
              role="Investment Banking Intern"
            />
            <AnimatedTestimonialCard 
              quote="I transitioned from finance to tech using Altitude. The AI-generated insights helped me connect with the right people."
              author="Michael L."
              role="Software Engineer at Google"
            />
            <AnimatedTestimonialCard 
              quote="The platform made my research position search so much more efficient. Highly recommend!"
              author="David R."
              role="Research Assistant at UPenn"
            />
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-[#08464B] text-white relative overflow-hidden">
        <motion.div 
          className="absolute inset-0 bg-[#031b1d]"
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        />
        <motion.div 
          className="container mx-auto px-6 text-center relative"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl font-bold mb-6">Ready to Elevate Your Career?</h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Join thousands of successful professionals who used Altitude to reach new heights.
            Start your journey today with our free plan.
          </p>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                size="lg" 
                variant="secondary" 
                className="bg-white text-[#08464B] hover:bg-gray-100 h-14 px-8 text-lg"
                asChild
              >
                <Link href="/dashboard">
                  Start For Free
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white text-black hover:bg-white/10 h-14 px-8 text-lg"
                onClick={() => setIsVideoOpen(true)}
              >
                Watch Demo
                <Play className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </motion.div>

          {/* Background Decorations */}
          <motion.div 
            className="absolute -left-24 top-0 w-64 h-64 bg-white/5 rounded-full blur-3xl"
            animate={{
              y: [0, 50, 0],
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3]
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div 
            className="absolute -right-24 bottom-0 w-64 h-64 bg-white/5 rounded-full blur-3xl"
            animate={{
              y: [0, -50, 0],
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3]
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1
            }}
          />
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 bg-white">
        <motion.div
          className="container mx-auto px-6"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <div className="grid md:grid-cols-4 gap-12">
            {/* Brand Column */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <img src="/altitude.png" alt="Altitude logo" className="w-8 h-8" />
                <span className="font-bold text-xl">Altitude</span>
              </div>
              <p className="text-gray-600">
                AI-powered networking that turns cold outreach into warm introductions.
              </p>
            </div>

            {/* Product Links */}
            <div>
              <h3 className="font-bold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-600">
                <li>
                  <Link href="#features" className="hover:text-gray-900">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="hover:text-gray-900">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="#testimonials" className="hover:text-gray-900">
                    Success Stories
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="font-bold mb-4">Legal</h3>
              <ul className="space-y-2 text-gray-600">
                <li>
                  <Link href="/privacy-policy" className="hover:text-gray-900">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms-of-service" className="hover:text-gray-900">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t text-center text-gray-500">
            <p>© 2024 Altitude. All rights reserved.</p>
          </div>
        </motion.div>
      </footer>

      {/* Scroll to top button */}
      <motion.button
        className="fixed bottom-8 right-8 p-3 bg-[#031b1d] text-white rounded-full shadow-lg hover:bg-[#08464B] transition-colors"
        initial={{ opacity: 0 }}
        animate={{ opacity: scrollProgress > 0.2 ? 1 : 0 }}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <motion.div
          animate={{
            y: [0, -3, 0]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        </motion.div>
      </motion.button>

      <style jsx>{`
        @keyframes scroll-left {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-100%);
          }
        }

        .animate-scroll-left {
          animation: scroll-left 40s linear infinite;
        }
      `}</style>
    </div>
  );
}

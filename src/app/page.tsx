'use client'

import { Button } from "@/components/ui/button";
import { ArrowRight, Target, MessageCircle, Bot, BarChart, ChevronDown, Users, LineChart, Bell } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Line, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { useSession } from 'next-auth/react';

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

const fadeInVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 }
};

const staggerChildren = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function LandingPage() {
  const { data: session } = useSession();
  const scrollToNext = () => {
    window.scrollTo({
      top: window.innerHeight,
      behavior: 'smooth'
    });
  };

  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="absolute top-0 left-0 right-0 z-50">
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
            <span className="text-xl font-bold"><Link href="/">Altitude</Link></span>
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
                <Button className="bg-[#031b1d] hover:bg-[#031b1d]/90" asChild>
                  <Link href="/signup">Get Started</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Full-screen Hero Section */}
      <section className="h-screen flex flex-col justify-center items-center relative">
        <div className="container mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-7xl md:text-8xl font-bold tracking-tight mb-6 leading-tight">
              Connect Smarter,<br />
              Climb Higher
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-2xl mx-auto">
              AI-powered networking that turns cold outreach into warm introductions
            </p>
            <Button size="lg" className="bg-[#031b1d] hover:bg-[#031b1d]/90 h-14 px-8 text-lg" asChild>
              <Link href="/dashboard">
                Start Your Journey <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </motion.div>
        </div>
        <motion.div 
          className="absolute bottom-10 cursor-pointer"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          onClick={scrollToNext}
        >
          <ChevronDown className="h-8 w-8 text-gray-400" />
        </motion.div>
      </section>

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
    </section>

      {/* Vertical Feature Ladder */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-16 bg-gradient-to-r from-[#031b1d] to-[#08464B] bg-clip-text text-transparent">
            Why Altitude Makes the Difference
          </h2>
          
          <div className="max-w-6xl mx-auto space-y-32">
            <FeatureStep 
              number="01"
              title="Smart Profile Targeting"
              color="#0D3B79"
              stats={[
                "90% faster prospect identification",
                "2.3x more relevant connections",
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
                      <div className="absolute -inset-4 bg-indigo-100 rounded-lg animate-pulse" />
                      <Users size={80} className="text-indigo-600 relative z-10" />
                      <div className="absolute top-0 right-0 w-12 h-12 bg-indigo-200 rounded-full animate-ping" />
                    </div>
                  </motion.div>
                </div>
              }
            />

            <FeatureStep 
              number="02"
              title="Personalized Outreach"
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
                      <div className="bg-cyan-100 p-3 rounded-lg flex items-center gap-2 shadow-lg">
                        <MessageCircle className="text-cyan-600" />
                        <span className="text-sm font-medium text-cyan-800">AI Generated Message</span>
                      </div>
                      <div className="bg-cyan-50 p-3 rounded-lg flex items-center gap-2">
                        <Bot className="text-cyan-500" />
                        <span className="text-sm text-cyan-700">Smart Templates</span>
                      </div>
                    </div>
                  </motion.div>
                </div>
              }
            />

            <FeatureStep 
              number="03"
              title="Relationship Management"
              color="#0D3B79"
              stats={[
                "Track 100+ connections effortlessly",
                "45% better follow-up rate",
                "Smart reminder system"
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
                      <div className="absolute -inset-6 bg-emerald-100 rounded-xl" />
                      <div className="relative z-10 flex flex-col items-center gap-3">
                        <Bell className="text-emerald-600 h-12 w-12" />
                        <div className="flex gap-2">
                          <span className="px-3 py-1 bg-emerald-200 rounded-full text-sm text-emerald-700">Follow up</span>
                          <span className="px-3 py-1 bg-emerald-200 rounded-full text-sm text-emerald-700">Connect</span>
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

      {/* Testimonials with fade-in animations */}
      <section className="py-20">
        <div className="container mx-auto px-6 text-center">
          <motion.h2 
            className="text-3xl font-bold mb-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            Success Stories
          </motion.h2>
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
              role="Research Assistant at the University of Pennsylvania"
            />
          </motion.div>
        </div>
      </section>

      {/* Animated CTA Section */}
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
          <p className="text-xl mb-8 opacity-90">
            Join thousands of successful professionals who used Altitude to reach new heights.
          </p>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button 
              size="lg" 
              variant="secondary" 
              className="bg-white text-[#08464B] hover:bg-gray-100"
            >
              Get Started Free
            </Button>
          </motion.div>
        </motion.div>
      </section>

      {/* Footer with subtle animations */}
      <footer className="border-t py-12">
      <motion.div
        className="container mx-auto px-6"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
      >
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-bold mb-4">Altitude</h3>
            <p className="text-gray-600">Elevate your career outreach.</p>
          </div>
          <div>
            <h3 className="font-bold mb-4">Product</h3>
            <ul className="space-y-2 text-gray-600">
              <li>
                <button 
                  onClick={() => scrollToSection('features')}
                  className="hover:translate-x-1 transition-transform cursor-pointer"
                >
                  Features
                </button>
              </li>
              <li>
                <Link 
                  href="/pricing" 
                  className="hover:translate-x-1 transition-transform block"
                >
                  Pricing
                </Link>
              </li>
              <li>
                <button 
                  onClick={() => scrollToSection('success-stories')}
                  className="hover:translate-x-1 transition-transform cursor-pointer"
                >
                  Success Stories
                </button>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold mb-4">Legal</h3>
            <ul className="space-y-2 text-gray-600">
              <li>
                <Link 
                  href="/privacy" 
                  className="hover:translate-x-1 transition-transform block"
                >
                  Privacy
                </Link>
              </li>
              <li>
                <Link 
                  href="/terms" 
                  className="hover:translate-x-1 transition-transform block"
                >
                  Terms
                </Link>
              </li>
              <li>
                <Link 
                  href="/security" 
                  className="hover:translate-x-1 transition-transform block"
                >
                  Security
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </motion.div>
    </footer>
    </div>
  );
}

const FeatureStep = ({ 
  number, 
  title, 
  color, 
  stats, 
  visual 
}: {
  number: string | number;
  title: string;
  color: string;
  stats: string[];
  visual: React.ReactNode;
}) => (
  <motion.div 
    className="relative"
    initial={{ opacity: 0, y: 50 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.6 }}
  >
    <div className="grid md:grid-cols-2 gap-12 items-center">
      <div className="flex items-start gap-8">
        <div className="text-4xl font-bold" style={{ color: `${color}20` }}>{number}</div>
        <div className="flex-1">
          <h3 className="text-2xl font-bold mb-6" style={{ color }}>{title}</h3>
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
                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
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

const AnimatedTestimonialCard = ({ 
  quote,
  author, 
  role 
}: {
  quote: string;
  author: string;
  role: string;
}) => (
  <motion.div 
    className="p-6 bg-gray-50 rounded-lg hover:shadow-md transition-shadow"
    variants={fadeIn}
    whileHover={{ y: -5 }}
    transition={{ type: "spring", stiffness: 300, damping: 20 }}
  >
    <p className="text-gray-600 mb-4 italic">"{quote}"</p>
    <p className="font-semibold">{author}</p>
    <p className="text-sm text-gray-500">{role}</p>
  </motion.div>
);
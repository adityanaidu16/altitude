'use client'

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { signOut } from "next-auth/react";
import Link from "next/link";

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
        <header className="border-b" style={{ backgroundColor: '#031b1d' }}>
        <div className="container flex items-center justify-between h-16 px-4">
        <motion.div 
            className="flex items-center space-x-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="w-8 h-8">
              <img src="/altitude-white.png" alt="Altitude logo" className="w-full h-full" />
            </div>
            <span className="text-xl font-bold text-white"><Link href="/">Altitude</Link></span>
          </motion.div>
          <nav className="flex items-center gap-4">
            <Button variant="ghost" className="text-white hover:text-white/80">
                <Link href="/dashboard">Dashboard</Link>
            </Button>
            <Button
              variant="ghost"
              className="text-white hover:text-white/80"
              asChild
            >
              <Link href="/settings">Profile</Link>
            </Button>
            <Button 
              variant="ghost" className="text-white hover:text-white/80"
              onClick={() => signOut({ callbackUrl: '/' })}
            >
              Sign Out
            </Button>
          </nav>
        </div>
      </header>
      {/* Header */}
      <div className="pt-24 pb-16 text-center">
        <h1 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h1>
        <p className="text-xl text-gray-600">Choose the plan that's right for your career journey</p>
      </div>

      {/* Pricing Cards */}
      <div className="container mx-auto px-6 pb-24">
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Basic Plan */}
          <div className="rounded-xl border p-8 bg-white shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-2xl font-bold mb-2">Basic</h3>
            <p className="text-gray-600 mb-4">Perfect for getting started</p>
            <div className="mb-6">
              <span className="text-4xl font-bold">$0</span>
              <span className="text-gray-600">/month</span>
            </div>
            <Button className="w-full mb-6">Get Started</Button>
            <ul className="space-y-3">
              <Feature text="Up to 10 leads per month" />
              <Feature text="Basic message templates" />
              <Feature text="Connection tracking" />
            </ul>
          </div>

          {/* Pro Plan */}
          <div className="rounded-xl border p-8 bg-white shadow-md hover:shadow-lg transition-shadow relative">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#031b1d] text-white px-4 py-1 rounded-full text-sm">
              Most Popular
            </div>
            <h3 className="text-2xl font-bold mb-2">Plus</h3>
            <p className="text-gray-600 mb-4">For serious networkers</p>
            <div className="mb-6">
              <span className="text-4xl font-bold">$9</span>
              <span className="text-gray-600">/month</span>
            </div>
            <Button className="w-full mb-6 bg-[#031b1d] hover:bg-[#031b1d]/90">
              Activate Plus
            </Button>
            <ul className="space-y-3">
              <Feature text="Up to 100 leads per month" />
              <Feature text="Supercharged AI-powered message generation" />
              <Feature text="Advanced analytics" />
              <Feature text="Priority support" />
            </ul>
          </div>

          {/* Enterprise Plan */}
          <div className="rounded-xl border p-8 bg-white shadow-md hover:shadow-lg transition-shadow relative">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#031b1d] text-white px-4 py-1 rounded-full text-sm">
              Invite Only
            </div>
            <h3 className="text-2xl font-bold mb-2">Pro</h3>
            <p className="text-gray-600 mb-4">Automation unlocked.</p>
            <div className="mb-6">
              <span className="text-4xl font-bold">$20</span>
              <span className="text-gray-600">/month</span>
            </div>
            <Button className="w-full mb-6" variant="outline">
              Contact Sales
            </Button>
            <ul className="space-y-3">
              <Feature text="Automated lead management" />
              <Feature text="Up to 500 leads per month" />
              <Feature text="Custom integrations" />
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

const Feature = ({ text }: { text: string }) => (
  <li className="flex items-center gap-2 text-gray-600">
    <Check className="h-5 w-5 text-[#031b1d]" />
    {text}
  </li>
);
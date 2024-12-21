'use client'

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
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
        <p className="text-xl text-gray-600">Choose the plan that&apos;s right for your career journey</p>
      </div>

      <div className="flex justify-center">
        <Link href="/dashboard" className="relative inline-block px-6 py-2 bg-[#08464B] text-white rounded-lg hover:bg-[#031b1d] transition-colors">
          <span className="relative z-10">
            Start Your Journey <ArrowRight className="ml-2 h-5 w-5 inline-block group-hover:translate-x-1 transition-transform" />
          </span>
        </Link>
      </div>

      {/* Pricing Cards */}
      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3 p-24">
          <Card>
            <CardHeader>
              <CardTitle>Free Plan</CardTitle>
              <CardDescription>Perfect for getting started</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2">
                <li>✓ 2 campaigns per month</li>
                <li>✓ Up to 15 prospects per campaign</li>
                <li>✓ Basic prospect validation</li>
                <li>✓ Personalized messages</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Plus Plan</CardTitle>
              <CardDescription>For power users</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2">
                <li>✓ 20 campaigns per month</li>
                <li>✓ Up to 50 prospects per campaign</li>
                <li>✓ Advanced prospect validation</li>
                <li>✓ Advanced personalized messages</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pro Plan</CardTitle>
              <CardDescription>To make that dream role a reality</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2">
                <li>✓ Unlimited campaigns</li>
                <li>✓ Up to 50 prospects per campaign</li>
                <li>✓ Advanced prospect validation</li>
                <li>✓ Advanced personalized messages</li>
              </ul>
            </CardContent>
          </Card>
        </div>
    </div>
  );
}
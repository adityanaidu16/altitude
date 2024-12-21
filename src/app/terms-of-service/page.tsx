import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b" style={{ backgroundColor: '#031b1d' }}>
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <img src="/altitude-white.png" alt="Altitude logo" className="w-8 h-8" />
            <span className="font-bold text-xl text-white">Altitude</span>
          </Link>
          <Button variant="outline" className="text-black border-white hover:bg-white/10" asChild>
            <Link href="/">Return to Home</Link>
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm">
          {/* Title Section */}
          <div className="border-b px-8 py-6">
            <h1 className="text-3xl font-bold text-gray-900">Terms of Service</h1>
            <p className="mt-2 text-sm text-gray-500">Last updated: December 19, 2024</p>
          </div>

          {/* Content */}
          <div className="px-8 py-6 space-y-8">
            {/* Table of Contents */}
            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <h2 className="text-lg font-semibold mb-4">Contents</h2>
              <nav className="space-y-2">
                <a href="#terms" className="block text-gray-600 hover:text-gray-900">1. Terms</a>
                <a href="#acceptable-use" className="block text-gray-600 hover:text-gray-900">2. Acceptable Use</a>
                <a href="#subscriptions" className="block text-gray-600 hover:text-gray-900">3. Subscriptions and Payments</a>
                <a href="#data" className="block text-gray-600 hover:text-gray-900">4. Data Usage and Privacy</a>
                <a href="#termination" className="block text-gray-600 hover:text-gray-900">5. Account Termination</a>
                <a href="#liability" className="block text-gray-600 hover:text-gray-900">6. Limitation of Liability</a>
                <a href="#changes" className="block text-gray-600 hover:text-gray-900">7. Changes to Terms</a>
                <a href="#contact" className="block text-gray-600 hover:text-gray-900">8. Contact Information</a>
              </nav>
            </div>

            {/* Sections */}
            <section id="terms" className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">1. Terms</h2>
              <p className="text-gray-600 leading-relaxed">
                By accessing and using Altitude ("the Service"), you agree to be bound by these Terms of Service ("Terms"). 
                If you disagree with any part of the terms, you may not access the Service.
              </p>
            </section>

            <section id="acceptable-use" className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">2. Acceptable Use</h2>
              <p className="text-gray-600 leading-relaxed">
                You agree to use the Service in accordance with LinkedIn's terms of service and professional community guidelines.
                The following actions are strictly prohibited:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-600">
                <li>Sending spam or unsolicited messages</li>
                <li>Automated mass connection requests</li>
                <li>Scraping or collecting data beyond permitted usage</li>
                <li>Using the Service to send harmful or malicious content</li>
                <li>Attempting to manipulate or abuse the Service's features</li>
              </ul>
            </section>

            <section id="subscriptions" className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">3. Subscriptions and Payments</h2>
              <p className="text-gray-600 leading-relaxed">
                Certain features of the Service require a paid subscription. By choosing a paid subscription, you agree to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-600">
                <li>Provide accurate and complete payment information</li>
                <li>Pay all charges at the prices in effect when incurred</li>
                <li>Keep your payment information up to date</li>
              </ul>
              <p className="text-gray-600 leading-relaxed">
                Subscriptions automatically renew unless cancelled. You can cancel your subscription at any time
                through your account settings.
              </p>
            </section>

            <section id="data" className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">4. Data Usage and Privacy</h2>
              <p className="text-gray-600 leading-relaxed">
                Your use of the Service is also governed by our <Link href="/privacy-policy" className="text-blue-600 hover:underline">Privacy Policy</Link>. 
                By using the Service, you consent to the collection and use of information as detailed in our Privacy Policy.
              </p>
            </section>

            <section id="termination" className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">5. Account Termination</h2>
              <p className="text-gray-600 leading-relaxed">
                We reserve the right to terminate or suspend access to the Service immediately, without prior notice,
                for any violation of these Terms or for any other reason we deem appropriate.
              </p>
            </section>

            <section id="liability" className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">6. Limitation of Liability</h2>
              <p className="text-gray-600 leading-relaxed">
                Altitude is not liable for any indirect, incidental, special, consequential, or punitive damages resulting
                from your use or inability to use the Service.
              </p>
            </section>

            <section id="changes" className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">7. Changes to Terms</h2>
              <p className="text-gray-600 leading-relaxed">
                We reserve the right to modify or replace these Terms at any time. If a revision is material,
                we will provide at least 30 days' notice prior to any new terms taking effect.
              </p>
            </section>

            <section id="contact" className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">8. Contact Information</h2>
              <div className="bg-gray-50 rounded-lg p-6">
                <p className="text-gray-600 leading-relaxed">
                  If you have any questions about these Terms, please contact us:
                </p>
                <p className="text-gray-900 mt-2">
                  Email: <a href="mailto:support@altitude.com" className="text-blue-600 hover:underline">support@altitude.com</a>
                </p>
              </div>
            </section>

            {/* Footer Note */}
            <div className="mt-12 border-t pt-6">
              <p className="text-sm text-gray-500">
                By using Altitude, you acknowledge that you have read and understood these Terms of Service
                and agree to be bound by them.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
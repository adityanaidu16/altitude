import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50">
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

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm">
          {/* Title Section */}
          <div className="border-b px-8 py-6">
            <h1 className="text-3xl font-bold text-gray-900">Privacy Policy</h1>
            <p className="mt-2 text-sm text-gray-500">Last updated: December 19, 2024</p>
          </div>

          {/* Content */}
          <div className="px-8 py-6 space-y-8">
            {/* Table of Contents */}
            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <h2 className="text-lg font-semibold mb-4">Contents</h2>
              <nav className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <a href="#collect" className="text-gray-600 hover:text-gray-900">1. Information We Collect</a>
                <a href="#use" className="text-gray-600 hover:text-gray-900">2. How We Use Your Information</a>
                <a href="#share" className="text-gray-600 hover:text-gray-900">3. Information Sharing</a>
                <a href="#security" className="text-gray-600 hover:text-gray-900">4. Data Security</a>
                <a href="#rights" className="text-gray-600 hover:text-gray-900">5. Your Rights and Choices</a>
                <a href="#cookies" className="text-gray-600 hover:text-gray-900">6. Cookies</a>
                <a href="#children" className="text-gray-600 hover:text-gray-900">7. Children's Privacy</a>
                <a href="#changes" className="text-gray-600 hover:text-gray-900">8. Changes to Policy</a>
                <a href="#international" className="text-gray-600 hover:text-gray-900">9. International Transfers</a>
                <a href="#contact" className="text-gray-600 hover:text-gray-900">10. Contact Us</a>
              </nav>
            </div>

            {/* Sections */}
            <section id="collect" className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">1. Information We Collect</h2>
              
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-900">1.1 Information You Provide</h3>
                <p className="text-gray-600">We collect information that you provide directly to us, including:</p>
                <ul className="list-disc pl-6 space-y-2 text-gray-600">
                  <li>Account information (name, email, LinkedIn profile)</li>
                  <li>Professional information (career goals, industry preferences)</li>
                  <li>Payment information (processed securely through Stripe)</li>
                  <li>Communications with our support team</li>
                </ul>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-900">1.2 Information We Automatically Collect</h3>
                <p className="text-gray-600">When you use our Service, we automatically collect:</p>
                <ul className="list-disc pl-6 space-y-2 text-gray-600">
                  <li>Usage data (features accessed, actions taken)</li>
                  <li>Device information (browser type, IP address)</li>
                  <li>Cookie data and similar technologies</li>
                </ul>
              </div>
            </section>

            <section id="use" className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">2. How We Use Your Information</h2>
              <div className="bg-gray-50 rounded-lg p-6">
                <p className="text-gray-600 mb-4">We use the collected information to:</p>
                <ul className="list-disc pl-6 space-y-2 text-gray-600">
                  <li>Provide and maintain our Service</li>
                  <li>Process your subscription and payments</li>
                  <li>Personalize your experience</li>
                  <li>Send important notifications about our Service</li>
                  <li>Improve our features and user experience</li>
                  <li>Detect and prevent fraudulent activities</li>
                </ul>
              </div>
            </section>

            <section id="share" className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">3. Information Sharing</h2>
              <p className="text-gray-600">We may share your information with:</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-600">
                <li>Service providers (payment processing, analytics)</li>
                <li>Professional advisors (legal, accounting)</li>
                <li>Law enforcement when required by law</li>
              </ul>
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <p className="text-blue-800 font-medium">
                  We do not sell your personal information to third parties.
                </p>
              </div>
            </section>

            <section id="security" className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">4. Data Security</h2>
              <div className="bg-gray-50 rounded-lg p-6">
                <p className="text-gray-600 leading-relaxed">
                  We implement appropriate security measures to protect your personal information, including:
                </p>
                <ul className="list-disc pl-6 mt-4 space-y-2 text-gray-600">
                  <li>Encryption of data in transit and at rest</li>
                  <li>Regular security assessments and updates</li>
                  <li>Strict access controls and monitoring</li>
                  <li>Employee security training and compliance</li>
                </ul>
                <p className="mt-4 text-gray-600 leading-relaxed">
                  However, no method of transmission over the Internet is 100% secure. While we strive to protect your data,
                  we cannot guarantee absolute security.
                </p>
              </div>
            </section>

            <section id="rights" className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">5. Your Rights and Choices</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4">Access and Control</h3>
                  <ul className="space-y-2 text-gray-600">
                    <li>✓ Access your personal information</li>
                    <li>✓ Correct inaccurate data</li>
                    <li>✓ Request deletion of your data</li>
                  </ul>
                </div>
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4">Communication Preferences</h3>
                  <ul className="space-y-2 text-gray-600">
                    <li>✓ Opt-out of marketing communications</li>
                    <li>✓ Manage notification settings</li>
                    <li>✓ Export your data</li>
                  </ul>
                </div>
              </div>
            </section>

            <section id="cookies" className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">6. Cookies</h2>
              <div className="space-y-4">
                <p className="text-gray-600 leading-relaxed">
                  We use cookies and similar tracking technologies to enhance your experience on our platform.
                  These technologies help us:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium mb-2">Essential Cookies</h4>
                    <p className="text-sm text-gray-600">Required for basic functionality and security</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium mb-2">Analytics Cookies</h4>
                    <p className="text-sm text-gray-600">Help us understand how you use our service</p>
                  </div>
                </div>
                <p className="text-gray-600">
                  You can modify your cookie preferences through your browser settings at any time.
                </p>
              </div>
            </section>

            <section id="children" className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">7. Children's Privacy</h2>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
                <p className="text-gray-700 leading-relaxed">
                  Our Service is not directed to children under 13. We do not knowingly collect
                  personal information from children under 13. If we become aware that we have
                  collected personal information from a child under 13, we will take steps to
                  remove that information.
                </p>
              </div>
            </section>

            <section id="changes" className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">8. Changes to This Privacy Policy</h2>
              <div className="space-y-4">
                <p className="text-gray-600 leading-relaxed">
                  We may update our Privacy Policy from time to time. We will notify you of any
                  changes by:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-600">
                  <li>Posting the new Privacy Policy on this page</li>
                  <li>Updating the "Last updated" date at the top of this policy</li>
                  <li>Sending an email notification for significant changes</li>
                </ul>
              </div>
            </section>

            <section id="international" className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">9. International Data Transfers</h2>
              <div className="bg-gray-50 rounded-lg p-6">
                <p className="text-gray-600 leading-relaxed">
                  Your information may be transferred to and processed in countries other than
                  your country of residence. These countries may have different data protection
                  laws than your country. We ensure appropriate safeguards are in place to protect
                  your data during international transfers.
                </p>
              </div>
            </section>

            <section id="contact" className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">10. Contact Us</h2>
              <div className="bg-gray-50 rounded-lg p-6">
                <p className="text-gray-600 mb-4">
                  If you have any questions about this Privacy Policy, please contact us:
                </p>
                <div className="space-y-2">
                  <p className="text-gray-900">
                    Email: <a href="mailto:privacy@altitude.com" className="text-blue-600 hover:underline">privacy@altitude.com</a>
                  </p>
                </div>
              </div>
            </section>

            <div className="mt-12 border-t pt-6">
              <div className="bg-blue-50 rounded-lg p-6">
                <p className="text-sm text-gray-600 leading-relaxed">
                  By using Altitude, you consent to our Privacy Policy and agree to its terms.
                  We are committed to protecting your privacy and maintaining the security of your personal information.
                  If you disagree with any aspect of this policy, please do not use our Service.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  FileText, AlertTriangle, Shield, Users, CreditCard, 
  Gavel, Eye, Lock, Globe, Calendar 
} from "lucide-react";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-dark-bg text-white p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gradient-rainbow mb-4">Terms of Service</h1>
          <p className="text-gray-400">
            Effective Date: January 22, 2025 | Last Updated: January 22, 2025
          </p>
          <p className="text-gray-300 mt-2">
            These Terms of Service govern your use of PropTraderJournal. By using our platform, 
            you agree to be bound by these terms.
          </p>
        </div>

        <div className="space-y-6">
          {/* Service Description */}
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-400">
                <FileText className="h-5 w-5" />
                Service Description
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <p className="text-gray-300">
                  PropTraderJournal is a web-based trading journal and analytics platform designed for proprietary 
                  traders and trading firms. Our service provides:
                </p>
                
                <ul className="list-disc list-inside text-gray-300 space-y-1 ml-4">
                  <li>Trading performance tracking and analysis</li>
                  <li>Risk management tools and reporting</li>
                  <li>Trading journal and reflection capabilities</li>
                  <li>Account management for multiple trading accounts</li>
                  <li>Data visualization and performance insights</li>
                  <li>Goal setting and progress tracking</li>
                </ul>
              </div>

              <div className="bg-yellow-900 bg-opacity-30 p-4 rounded-lg border border-yellow-600 border-opacity-30">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-yellow-200 mb-2">Important Disclaimer</h4>
                    <p className="text-yellow-200 text-sm">
                      PropTraderJournal is an analysis and journaling tool only. We do not:
                    </p>
                    <ul className="text-yellow-200 text-sm mt-2 space-y-1">
                      <li>• Provide financial advice or investment recommendations</li>
                      <li>• Act as a broker or execute trades</li>
                      <li>• Guarantee trading profits or success</li>
                      <li>• Handle real trading funds or accounts</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Eligibility & Account Registration */}
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-400">
                <Users className="h-5 w-5" />
                Eligibility & Account Registration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-white">User Eligibility</h3>
                <ul className="list-disc list-inside text-gray-300 space-y-1 ml-4">
                  <li>You must be at least 18 years of age</li>
                  <li>You must have legal capacity to enter into contracts</li>
                  <li>You must provide accurate and complete registration information</li>
                  <li>You are responsible for maintaining the confidentiality of your account</li>
                </ul>
              </div>

              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-white">Account Responsibilities</h3>
                <ul className="list-disc list-inside text-gray-300 space-y-1 ml-4">
                  <li>Maintain accurate and up-to-date account information</li>
                  <li>Notify us immediately of any unauthorized account access</li>
                  <li>You are solely responsible for all activities under your account</li>
                  <li>One account per person; multiple accounts are prohibited</li>
                </ul>
              </div>

              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-white">Geographic Restrictions</h3>
                <p className="text-gray-300">
                  PropTraderJournal is available globally. However, you are responsible for ensuring 
                  your use complies with local laws and regulations in your jurisdiction.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Acceptable Use Policy */}
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-400">
                <Shield className="h-5 w-5" />
                Acceptable Use Policy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-white">Permitted Uses</h3>
                <ul className="list-disc list-inside text-gray-300 space-y-1 ml-4">
                  <li>Track and analyze your trading performance</li>
                  <li>Maintain trading journals and notes</li>
                  <li>Generate reports for personal or business use</li>
                  <li>Share anonymized performance data (with explicit consent)</li>
                </ul>
              </div>

              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-white">Prohibited Activities</h3>
                <div className="bg-red-900 bg-opacity-30 p-4 rounded-lg border border-red-600 border-opacity-30">
                  <p className="text-red-200 text-sm mb-2">You may not:</p>
                  <ul className="list-disc list-inside text-red-200 text-sm space-y-1 ml-4">
                    <li>Violate any applicable laws or regulations</li>
                    <li>Interfere with or disrupt our services or servers</li>
                    <li>Attempt to gain unauthorized access to our systems</li>
                    <li>Upload malicious code or conduct security testing without permission</li>
                    <li>Share account credentials or allow unauthorized access</li>
                    <li>Use the service for any unlawful or fraudulent purposes</li>
                    <li>Reverse engineer, decompile, or disassemble our software</li>
                    <li>Use automated tools to scrape or harvest data without permission</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data & Privacy */}
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-400">
                <Lock className="h-5 w-5" />
                Data Ownership & Privacy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-white">Your Data Rights</h3>
                <div className="bg-purple-900 bg-opacity-30 p-4 rounded-lg border border-purple-600 border-opacity-30">
                  <ul className="text-purple-200 text-sm space-y-1">
                    <li>• <strong>You own your trading data</strong> - We never sell or rent your information</li>
                    <li>• <strong>Data portability</strong> - Export your data at any time in standard formats</li>
                    <li>• <strong>Account deletion</strong> - Request complete data removal with account closure</li>
                    <li>• <strong>Privacy controls</strong> - Manage your data sharing and notification preferences</li>
                  </ul>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-white">Data Processing</h3>
                <p className="text-gray-300 text-sm">
                  We process your data solely to provide our services as outlined in our 
                  <a href="/privacy-policy" className="text-blue-400 hover:text-blue-300 ml-1">Privacy Policy</a>. 
                  We implement industry-standard security measures to protect your information.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Subscription & Billing */}
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-cyan-400">
                <CreditCard className="h-5 w-5" />
                Subscription & Billing Terms
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-white">Subscription Plans</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-800 p-4 rounded-lg">
                    <h4 className="font-semibold text-white mb-2">Basic Plan</h4>
                    <p className="text-gray-400 text-sm">$9.99/month - Up to 5 accounts</p>
                  </div>
                  <div className="bg-gray-800 p-4 rounded-lg">
                    <h4 className="font-semibold text-white mb-2">Pro Plan</h4>
                    <p className="text-gray-400 text-sm">$14.99/month - Up to 10 accounts</p>
                  </div>
                  <div className="bg-gray-800 p-4 rounded-lg">
                    <h4 className="font-semibold text-white mb-2">Premium Plan</h4>
                    <p className="text-gray-400 text-sm">$29.99/month - Unlimited accounts</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-white">Billing Terms</h3>
                <ul className="list-disc list-inside text-gray-300 space-y-1 ml-4">
                  <li>All subscriptions are billed monthly in advance</li>
                  <li>Free trial period: 15 days for all new accounts</li>
                  <li>Automatic renewal unless cancelled before billing date</li>
                  <li>Payments processed through secure third-party providers</li>
                  <li>Price changes require 30 days advance notice</li>
                </ul>
              </div>

              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-white">Cancellation & Refunds</h3>
                <div className="bg-cyan-900 bg-opacity-30 p-4 rounded-lg border border-cyan-600 border-opacity-30">
                  <ul className="text-cyan-200 text-sm space-y-1">
                    <li>• Cancel anytime through your account settings</li>
                    <li>• Access continues until the end of your billing period</li>
                    <li>• No refunds for partial billing periods</li>
                    <li>• Free trial cancellations have no charges</li>
                    <li>• Refund requests within 7 days considered on case-by-case basis</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Service Availability */}
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-yellow-400">
                <Globe className="h-5 w-5" />
                Service Availability & Limitations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-white">Service Level</h3>
                <ul className="list-disc list-inside text-gray-300 space-y-1 ml-4">
                  <li>We aim for 99.9% uptime but cannot guarantee uninterrupted service</li>
                  <li>Planned maintenance will be announced in advance when possible</li>
                  <li>Emergency maintenance may occur without notice</li>
                  <li>Data backups are performed regularly but you should maintain your own copies</li>
                </ul>
              </div>

              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-white">Technical Requirements</h3>
                <ul className="list-disc list-inside text-gray-300 space-y-1 ml-4">
                  <li>Modern web browser with JavaScript enabled</li>
                  <li>Stable internet connection required</li>
                  <li>Mobile responsive design for tablet and smartphone access</li>
                  <li>Cookies must be enabled for authentication</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Intellectual Property */}
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-pink-400">
                <Eye className="h-5 w-5" />
                Intellectual Property Rights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-white">Our Intellectual Property</h3>
                <p className="text-gray-300 text-sm">
                  PropTraderJournal, including its software, design, content, and trademarks, is owned by us 
                  and protected by intellectual property laws. You may not copy, modify, or redistribute our content.
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-white">Your Content</h3>
                <p className="text-gray-300 text-sm">
                  You retain ownership of all data you upload or create. By using our service, you grant us 
                  a limited license to process your data solely to provide our services.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Limitation of Liability */}
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-400">
                <Gavel className="h-5 w-5" />
                Limitation of Liability & Disclaimers
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-red-900 bg-opacity-30 p-4 rounded-lg border border-red-600 border-opacity-30">
                <h4 className="font-semibold text-red-200 mb-2">Trading Risk Disclaimer</h4>
                <p className="text-red-200 text-sm">
                  Trading involves substantial risk and is not suitable for all investors. PropTraderJournal 
                  provides analysis tools only and does not guarantee trading success. Past performance 
                  does not indicate future results. You are solely responsible for your trading decisions.
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-white">Service Disclaimers</h3>
                <ul className="list-disc list-inside text-gray-300 space-y-1 ml-4 text-sm">
                  <li>Service provided "as is" without warranties of any kind</li>
                  <li>We do not guarantee error-free or uninterrupted service</li>
                  <li>No warranty that our service meets your specific requirements</li>
                  <li>You use our service at your own risk and discretion</li>
                </ul>
              </div>

              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-white">Limitation of Damages</h3>
                <p className="text-gray-300 text-sm">
                  Our total liability shall not exceed the amount you paid for our service in the 12 months 
                  preceding the claim. We are not liable for indirect, incidental, or consequential damages.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Termination & Modifications */}
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-indigo-400">
                <Calendar className="h-5 w-5" />
                Termination & Modifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-white">Account Termination</h3>
                <ul className="list-disc list-inside text-gray-300 space-y-1 ml-4">
                  <li>You may terminate your account at any time through account settings</li>
                  <li>We may suspend or terminate accounts for Terms violations</li>
                  <li>Data deletion occurs 30 days after account termination</li>
                  <li>Export your data before termination if needed</li>
                </ul>
              </div>

              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-white">Terms Modifications</h3>
                <p className="text-gray-300 text-sm">
                  We may update these Terms from time to time. Material changes will be communicated via 
                  email or platform notification. Continued use after changes constitutes acceptance of new terms.
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-white">Governing Law</h3>
                <p className="text-gray-300 text-sm">
                  These Terms are governed by and construed in accordance with applicable laws. 
                  Any disputes will be resolved through binding arbitration or appropriate jurisdiction courts.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-400">
                <FileText className="h-5 w-5" />
                Contact & Legal Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-white mb-2">Questions About These Terms</h4>
                  <div className="bg-gray-800 p-3 rounded-lg">
                    <p className="text-gray-300 text-sm">
                      <strong>Email:</strong> legal@proptraderjournal.com<br />
                      <strong>Support:</strong> Available through our 
                      <a href="/support" className="text-blue-400 hover:text-blue-300 ml-1">Support Page</a>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Calendar className="h-4 w-4" />
                  <span>These terms were last updated on January 22, 2025</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Separator className="my-8 bg-gray-700" />

        <div className="text-center pb-6">
          <p className="text-gray-400 text-sm">
            © 2025 PropTraderJournal. All rights reserved.
          </p>
          <div className="flex justify-center gap-4 mt-2">
            <a href="/privacy-policy" className="text-blue-400 hover:text-blue-300 text-sm">Privacy Policy</a>
            <a href="/support" className="text-blue-400 hover:text-blue-300 text-sm">Support</a>
            <a href="/dashboard" className="text-blue-400 hover:text-blue-300 text-sm">Back to Dashboard</a>
          </div>
        </div>
      </div>
    </div>
  );
}
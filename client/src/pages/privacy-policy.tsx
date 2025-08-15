import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Shield, Mail, Lock, Eye, Database, Globe, Calendar } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-dark-bg text-white p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gradient-rainbow mb-4">Privacy Policy</h1>
          <p className="text-gray-400">
            Effective Date: January 22, 2025 | Last Updated: January 22, 2025
          </p>
          <p className="text-gray-300 mt-2">
            PropTraderJournal is committed to protecting your privacy and ensuring the security of your personal information.
            This Privacy Policy explains how we collect, use, and protect your data.
          </p>
        </div>

        <div className="space-y-6">
          {/* Data We Collect */}
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-400">
                <Database className="h-5 w-5" />
                Information We Collect
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-white">Account Information</h3>
                <ul className="list-disc list-inside text-gray-300 space-y-1 ml-4">
                  <li>Email address (for secure authentication)</li>
                  <li>Trading account details you create (account balances, profit targets, risk limits)</li>
                  <li>Trading performance data you input or import</li>
                  <li>Journal entries and trading notes</li>
                </ul>
              </div>

              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-white">Usage Information</h3>
                <ul className="list-disc list-inside text-gray-300 space-y-1 ml-4">
                  <li>Device information and IP addresses</li>
                  <li>Browser type and version</li>
                  <li>Pages visited and features used</li>
                  <li>Session duration and interaction patterns</li>
                </ul>
              </div>

              <div className="bg-blue-900 bg-opacity-30 p-4 rounded-lg border border-blue-600 border-opacity-30">
                <p className="text-blue-200 text-sm">
                  <strong>Important:</strong> PropTraderJournal is an analysis and journaling platform only. 
                  We do not store actual trading funds, process real transactions, or act as a broker.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* How We Use Data */}
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-500">
                <Eye className="h-5 w-5" />
                How We Use Your Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                <li>Provide trading journal and analytics services</li>
                <li>Generate performance reports and insights</li>
                <li>Send notifications about your trading activities (with your consent)</li>
                <li>Improve our platform features and user experience</li>
                <li>Ensure platform security and prevent misuse</li>
                <li>Comply with legal obligations and resolve disputes</li>
              </ul>
              
              <div className="bg-green-900 bg-opacity-30 p-4 rounded-lg border border-green-600 border-opacity-30 mt-4">
                <p className="text-green-200 text-sm">
                  <strong>Data Ownership:</strong> You own your trading data. PropTraderJournal does not sell, 
                  rent, or share your personal information with third parties for marketing purposes.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Data Security */}
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-400">
                <Lock className="h-5 w-5" />
                Data Security & Protection
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-white">Security Measures</h3>
                <ul className="list-disc list-inside text-gray-300 space-y-1 ml-4">
                  <li>End-to-end SSL/TLS encryption for all data transmission</li>
                  <li>Secure PostgreSQL database with encryption at rest</li>
                  <li>Authentication via secure email/password system</li>
                  <li>Regular security audits and vulnerability assessments</li>
                  <li>Access controls and permission-based data access</li>
                </ul>
              </div>

              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-white">Data Storage</h3>
                <ul className="list-disc list-inside text-gray-300 space-y-1 ml-4">
                  <li>Data stored in secure cloud infrastructure</li>
                  <li>Regular automated backups to prevent data loss</li>
                  <li>Geographic data replication for reliability</li>
                  <li>Retention period: Data kept for as long as your account is active</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Third-Party Services */}
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-400">
                <Globe className="h-5 w-5" />
                Third-Party Services
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-gray-300">We use the following trusted third-party services:</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-800 p-4 rounded-lg">
                    <h4 className="font-semibold text-white mb-2">PropTraderJournal Authentication</h4>
                    <p className="text-gray-400 text-sm">
                      Secure email/password authentication system with industry-standard encryption and security measures.
                    </p>
                  </div>

                  <div className="bg-gray-800 p-4 rounded-lg">
                    <h4 className="font-semibold text-white mb-2">Neon Database</h4>
                    <p className="text-gray-400 text-sm">
                      PostgreSQL database hosting with enterprise-grade security.
                      <a href="https://neon.tech/privacy-policy" className="text-blue-400 hover:text-blue-300 ml-1">
                        View Neon Privacy Policy
                      </a>
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Your Rights */}
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-yellow-400">
                <Shield className="h-5 w-5" />
                Your Rights & Choices
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-gray-300">You have the following rights regarding your personal data:</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-white">Access & Portability</h4>
                    <ul className="text-gray-300 text-sm space-y-1">
                      <li>• Request copies of your personal data</li>
                      <li>• Export your trading data in JSON/CSV format</li>
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-semibold text-white">Control & Deletion</h4>
                    <ul className="text-gray-300 text-sm space-y-1">
                      <li>• Update or correct your information</li>
                      <li>• Delete your account and all associated data</li>
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-semibold text-white">Communication Preferences</h4>
                    <ul className="text-gray-300 text-sm space-y-1">
                      <li>• Manage notification settings</li>
                      <li>• Opt-out of non-essential communications</li>
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-semibold text-white">Data Processing</h4>
                    <ul className="text-gray-300 text-sm space-y-1">
                      <li>• Object to certain data processing</li>
                      <li>• Request data processing restrictions</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* International Users */}
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-cyan-400">
                <Globe className="h-5 w-5" />
                International Users & GDPR Compliance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-gray-300">
                  PropTraderJournal complies with the General Data Protection Regulation (GDPR) and other applicable 
                  privacy laws worldwide. If you are located in the European Union, you have additional rights under GDPR.
                </p>

                <div className="bg-cyan-900 bg-opacity-30 p-4 rounded-lg border border-cyan-600 border-opacity-30">
                  <h4 className="font-semibold text-white mb-2">Legal Basis for Processing</h4>
                  <ul className="text-cyan-200 text-sm space-y-1">
                    <li>• <strong>Contract Performance:</strong> Processing necessary to provide our services</li>
                    <li>• <strong>Legitimate Interests:</strong> Platform security and improvement</li>
                    <li>• <strong>Consent:</strong> Marketing communications and optional features</li>
                    <li>• <strong>Legal Compliance:</strong> Meeting regulatory obligations</li>
                  </ul>
                </div>

                <p className="text-gray-300 text-sm">
                  For EU residents: You have the right to lodge a complaint with your local data protection authority 
                  if you believe we have not handled your personal data in accordance with GDPR.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Contact & Updates */}
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-pink-400">
                <Mail className="h-5 w-5" />
                Contact & Policy Updates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-white mb-2">Privacy Questions or Concerns</h4>
                  <p className="text-gray-300 text-sm mb-2">
                    If you have questions about this Privacy Policy or our data practices, please contact us:
                  </p>
                  <div className="bg-gray-800 p-3 rounded-lg">
                    <p className="text-gray-300 text-sm">
                      <strong>Email:</strong> privacy@proptraderjournal.com<br />
                      <strong>Support:</strong> Available through our 
                      <a href="/support" className="text-blue-400 hover:text-blue-300 ml-1">Support Page</a>
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-white mb-2">Policy Updates</h4>
                  <p className="text-gray-300 text-sm">
                    We may update this Privacy Policy from time to time. We will notify you of any material changes 
                    by posting the new policy on this page and updating the "Last Updated" date. Continued use of 
                    PropTraderJournal after changes constitutes acceptance of the updated policy.
                  </p>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Calendar className="h-4 w-4" />
                  <span>This policy was last updated on January 22, 2025</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Separator className="my-8 bg-gray-700" />

        <div className="text-center pb-6">
          <p className="text-gray-400 text-sm">
            © 2025 PropTraderJournal. This Privacy Policy is part of our Terms of Service.
          </p>
          <div className="flex justify-center gap-4 mt-2">
            <a href="/terms" className="text-blue-400 hover:text-blue-300 text-sm">Terms of Service</a>
            <a href="/support" className="text-blue-400 hover:text-blue-300 text-sm">Support</a>
            <a href="/dashboard" className="text-blue-400 hover:text-blue-300 text-sm">Back to Dashboard</a>
          </div>
        </div>
      </div>
    </div>
  );
}
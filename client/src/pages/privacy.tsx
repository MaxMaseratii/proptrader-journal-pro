import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, 
  Lock, 
  Eye, 
  Database,
  UserCheck,
  Globe,
  Cookie,
  Settings,
  AlertTriangle,
  CheckCircle
} from "lucide-react";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-gradient-to-r from-green-600 to-blue-600 rounded-full">
              <Shield className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">
            Privacy Policy
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Your privacy and trading data security are our top priorities
          </p>
          <div className="flex justify-center mt-4">
            <Badge className="bg-green-600 text-white">
              Last Updated: August 4, 2025
            </Badge>
          </div>
        </div>

        {/* Privacy Highlights */}
        <Card className="mb-8 bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-white">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span>Privacy Highlights</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Shield className="h-4 w-4 text-green-500" />
                  <span>Your trading data is never sold</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Lock className="h-4 w-4 text-green-500" />
                  <span>End-to-end encryption for all data</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Eye className="h-4 w-4 text-green-500" />
                  <span>No tracking for advertising purposes</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Database className="h-4 w-4 text-green-500" />
                  <span>Full data portability and deletion rights</span>
                </div>
                <div className="flex items-center space-x-2">
                  <UserCheck className="h-4 w-4 text-green-500" />
                  <span>No sharing with prop firms without consent</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Globe className="h-4 w-4 text-green-500" />
                  <span>GDPR and CCPA compliant</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Privacy Sections */}
        <div className="space-y-8">
          {/* Information We Collect */}
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-white">
                <Database className="h-5 w-5 text-blue-500" />
                <span>1. Information We Collect</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-4">
              <div>
                <h4 className="font-semibold text-white mb-2">Account Information:</h4>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Email address and username</li>
                  <li>Profile information you choose to provide</li>
                  <li>Subscription and billing information</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold text-white mb-2">Trading Data:</h4>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Trade records and performance metrics</li>
                  <li>Journal entries and notes</li>
                  <li>Risk management settings and preferences</li>
                  <li>Custom strategies and analysis</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-white mb-2">Usage Information:</h4>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>How you interact with our features</li>
                  <li>Device and browser information</li>
                  <li>Log files and error reports</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* How We Use Your Information */}
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-white">
                <Settings className="h-5 w-5 text-green-500" />
                <span>2. How We Use Your Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-4">
              <div>
                <h4 className="font-semibold text-white mb-2">Service Provision:</h4>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Provide and maintain the PropTrader Journal platform</li>
                  <li>Process and analyze your trading data for insights</li>
                  <li>Generate personalized reports and recommendations</li>
                  <li>Enable AI-powered features and assistance</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-white mb-2">Communication:</h4>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Send important service updates and notifications</li>
                  <li>Respond to your support requests</li>
                  <li>Provide educational content (only if opted in)</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-white mb-2">Improvement:</h4>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Analyze usage patterns to improve our features</li>
                  <li>Develop new tools and functionality</li>
                  <li>Ensure platform security and prevent fraud</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Data Security */}
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-white">
                <Lock className="h-5 w-5 text-yellow-500" />
                <span>3. Data Security</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-4">
              <div className="p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
                <p className="font-semibold text-green-400 mb-2">Bank-Level Security:</p>
                <p className="text-sm">
                  We employ the same security standards used by major financial institutions to protect your sensitive trading data.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-white mb-2">Technical Safeguards:</h4>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>AES-256 encryption for data at rest</li>
                  <li>TLS 1.3 encryption for data in transit</li>
                  <li>Multi-factor authentication options</li>
                  <li>Regular security audits and penetration testing</li>
                  <li>SOC 2 Type II compliance</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-white mb-2">Access Controls:</h4>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Strict employee access controls and monitoring</li>
                  <li>Zero-trust security architecture</li>
                  <li>Regular access reviews and deprovisioning</li>
                  <li>Comprehensive audit logging</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Data Sharing */}
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-white">
                <UserCheck className="h-5 w-5 text-purple-500" />
                <span>4. Data Sharing and Disclosure</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-4">
              <div className="p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                <p className="font-semibold text-blue-400 mb-2">We Do NOT Share Your Trading Data:</p>
                <p className="text-sm">
                  We never sell, rent, or share your individual trading performance data with prop firms, brokers, or any third parties for marketing purposes.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-white mb-2">Limited Sharing Scenarios:</h4>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li><strong>With Your Consent:</strong> If you explicitly authorize sharing with specific prop firms</li>
                  <li><strong>Service Providers:</strong> Trusted partners who help us operate the platform (under strict data protection agreements)</li>
                  <li><strong>Legal Requirements:</strong> When required by law enforcement or legal proceedings</li>
                  <li><strong>Safety:</strong> In cases of suspected fraud or threats to user safety</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-white mb-2">Anonymized Data:</h4>
                <p>
                  We may use aggregated, anonymized data (with all personal identifiers removed) for:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Industry research and market insights</li>
                  <li>Product improvement and feature development</li>
                  <li>Creating educational content and benchmarks</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Your Rights */}
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-white">
                <Eye className="h-5 w-5 text-green-500" />
                <span>5. Your Privacy Rights</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-4">
              <div>
                <h4 className="font-semibold text-white mb-2">Data Control Rights:</h4>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li><strong>Access:</strong> Request a copy of all data we have about you</li>
                  <li><strong>Correction:</strong> Update or correct inaccurate information</li>
                  <li><strong>Deletion:</strong> Request deletion of your account and data</li>
                  <li><strong>Portability:</strong> Export your data in a portable format</li>
                  <li><strong>Objection:</strong> Object to certain types of data processing</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-white mb-2">How to Exercise Your Rights:</h4>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Access your account settings for many privacy controls</li>
                  <li>Contact privacy@proptraderjournal.com for specific requests</li>
                  <li>Use our automated data export tools</li>
                  <li>Response time: within 30 days for most requests</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Cookies and Tracking */}
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-white">
                <Cookie className="h-5 w-5 text-orange-500" />
                <span>6. Cookies and Tracking</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-4">
              <div>
                <h4 className="font-semibold text-white mb-2">Essential Cookies:</h4>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Authentication and session management</li>
                  <li>Security and fraud prevention</li>
                  <li>Basic functionality and preferences</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-white mb-2">Analytics Cookies (Optional):</h4>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Usage statistics and performance monitoring</li>
                  <li>Feature usage and user experience improvements</li>
                  <li>Error tracking and debugging</li>
                </ul>
              </div>

              <p className="text-sm">
                You can control cookie preferences in your browser settings or through our cookie banner.
              </p>
            </CardContent>
          </Card>

          {/* International Transfers */}
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-white">
                <Globe className="h-5 w-5 text-blue-500" />
                <span>7. International Data Transfers</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-4">
              <p>
                PropTrader Journal operates globally. Your data may be processed in countries other than where you reside.
              </p>
              <div>
                <h4 className="font-semibold text-white mb-2">Transfer Safeguards:</h4>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Standard Contractual Clauses (SCCs) for EU data</li>
                  <li>Adequacy decisions where available</li>
                  <li>Additional safeguards for sensitive data</li>
                  <li>Regular compliance assessments</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Changes to Privacy Policy */}
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-white">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                <span>8. Changes to This Policy</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-4">
              <p>
                We may update this Privacy Policy from time to time. We will notify you of any material changes by:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Email notification to your registered address</li>
                <li>Prominent notice in the application</li>
                <li>Updates to the "Last Updated" date above</li>
              </ul>
              <p>
                Continued use of the service after changes constitutes acceptance of the new policy.
              </p>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-white">
                <Shield className="h-5 w-5 text-green-500" />
                <span>9. Contact Us</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-4">
              <p>
                For privacy-related questions or requests:
              </p>
              <div className="space-y-2">
                <p>Email: privacy@proptraderjournal.com</p>
                <p>Data Protection Officer: dpo@proptraderjournal.com</p>
                <p>Address: PropTrader Journal Privacy Team</p>
                <p>Response Time: Within 30 days</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
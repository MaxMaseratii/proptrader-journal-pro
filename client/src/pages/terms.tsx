import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Shield, 
  Users, 
  CreditCard,
  AlertTriangle,
  CheckCircle,
  Scale,
  Globe
} from "lucide-react";

export default function Terms() {
  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full">
              <FileText className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">
            Terms of Service
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            PropTrader Journal Terms of Service and User Agreement
          </p>
          <div className="flex justify-center mt-4">
            <Badge className="bg-blue-600 text-white">
              Last Updated: August 4, 2025
            </Badge>
          </div>
        </div>

        {/* Quick Summary */}
        <Card className="mb-8 bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-white">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span>Terms Summary</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Free to use basic features</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Your trading data remains private</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>No sharing of data with prop firms</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Cancel premium subscription anytime</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>No hidden fees or charges</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Full data export available</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Terms Sections */}
        <div className="space-y-8">
          {/* Acceptance of Terms */}
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-white">
                <Scale className="h-5 w-5 text-blue-500" />
                <span>1. Acceptance of Terms</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-4">
              <p>
                By accessing and using PropTrader Journal ("the Service"), you accept and agree to be bound by the terms and provision of this agreement.
              </p>
              <p>
                These Terms of Service constitute a legally binding agreement between you and PropTrader Journal regarding your use of the Service.
              </p>
              <p>
                If you do not agree to abide by the above, please do not use this service.
              </p>
            </CardContent>
          </Card>

          {/* Service Description */}
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-white">
                <Globe className="h-5 w-5 text-green-500" />
                <span>2. Service Description</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-4">
              <p>
                PropTrader Journal is a comprehensive trading journal and analytics platform designed specifically for proprietary trading firm traders.
              </p>
              <p>
                The Service provides eight core features:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Pre-Session Mental Fitness Check</li>
                <li>Daily Trading Plan Builder</li>
                <li>Target Projection System</li>
                <li>Prop Firm Spending & Payout Eligibility Tracking</li>
                <li>Risk-Integrated Trading Journal with AI Assistant</li>
                <li>Daily Performance vs Plan Analysis</li>
                <li>Prop Trader News Calendar</li>
                <li>Strategy Builder & Sharing</li>
              </ul>
              <p>
                We reserve the right to modify, suspend, or discontinue any aspect of the Service at any time.
              </p>
            </CardContent>
          </Card>

          {/* User Responsibilities */}
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-white">
                <Users className="h-5 w-5 text-purple-500" />
                <span>3. User Responsibilities</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-4">
              <p>You agree to:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Provide accurate and complete information when creating your account</li>
                <li>Maintain the security and confidentiality of your login credentials</li>
                <li>Use the Service only for lawful purposes</li>
                <li>Not attempt to reverse engineer or tamper with the Service</li>
                <li>Not use the Service to engage in any fraudulent or illegal trading activities</li>
                <li>Respect the intellectual property rights of PropTrader Journal and other users</li>
              </ul>
              <p>
                You are solely responsible for all trading decisions made using information provided by the Service.
              </p>
            </CardContent>
          </Card>

          {/* Data and Privacy */}
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-white">
                <Shield className="h-5 w-5 text-yellow-500" />
                <span>4. Data and Privacy</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-4">
              <p>
                Your trading data and personal information are protected under our Privacy Policy.
              </p>
              <p>Key privacy commitments:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>We do not sell or share your trading data with third parties</li>
                <li>We do not share your performance data with prop firms without explicit consent</li>
                <li>All data is encrypted in transit and at rest</li>
                <li>You maintain full ownership of your trading data</li>
                <li>You can export or delete your data at any time</li>
              </ul>
              <p>
                We may use aggregated, anonymized data for service improvement and research purposes.
              </p>
            </CardContent>
          </Card>

          {/* Payment Terms */}
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-white">
                <CreditCard className="h-5 w-5 text-green-500" />
                <span>5. Payment Terms</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-4">
              <p>
                PropTrader Journal offers both free and premium subscription tiers.
              </p>
              <p>Premium subscription terms:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Monthly subscriptions are billed in advance</li>
                <li>You may cancel your subscription at any time</li>
                <li>Cancellations take effect at the end of the current billing period</li>
                <li>No refunds for partial months, except as required by law</li>
                <li>Prices may change with 30 days advance notice</li>
              </ul>
              <p>
                All payments are processed through secure, PCI-compliant payment processors.
              </p>
            </CardContent>
          </Card>

          {/* Disclaimer and Limitations */}
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-white">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                <span>6. Disclaimer and Limitations</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-4">
              <div className="p-4 bg-orange-900/20 border border-orange-500/30 rounded-lg">
                <p className="font-semibold text-orange-400 mb-2">Trading Risk Disclaimer:</p>
                <p className="text-sm">
                  PropTrader Journal is a tool for tracking and analyzing trading performance. It does not provide investment advice, trading signals, or guaranteed profits. Trading involves substantial risk and may result in significant financial losses.
                </p>
              </div>
              <p>
                The Service is provided "AS IS" without warranties of any kind. We disclaim all warranties, express or implied, including but not limited to merchantability and fitness for a particular purpose.
              </p>
              <p>
                In no event shall PropTrader Journal be liable for any indirect, incidental, special, or consequential damages arising from your use of the Service.
              </p>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-white">
                <FileText className="h-5 w-5 text-blue-500" />
                <span>7. Contact Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-4">
              <p>
                For questions about these Terms of Service, please contact us:
              </p>
              <div className="space-y-2">
                <p>Email: legal@proptraderjournal.com</p>
                <p>Address: PropTrader Journal Legal Department</p>
                <p>Phone: +1 (555) PROP-LAW</p>
              </div>
              <p className="text-sm text-gray-400">
                These terms are governed by the laws of [Jurisdiction] and any disputes will be resolved in the courts of [Jurisdiction].
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
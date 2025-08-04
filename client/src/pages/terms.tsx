import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Terms() {
  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-4xl mx-auto">
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-2xl text-white">Terms of Service</CardTitle>
            <p className="text-gray-300">Last updated: August 4, 2025</p>
          </CardHeader>
          <CardContent className="space-y-6 text-gray-300">
            <section>
              <h2 className="text-xl font-semibold text-white mb-3">1. Acceptance of Terms</h2>
              <p>By accessing and using PropTrader Journal, you accept and agree to be bound by the terms and provision of this agreement.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">2. Use License</h2>
              <p>Permission is granted to temporarily download one copy of PropTrader Journal per device for personal, non-commercial transitory viewing only.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">3. Service Description</h2>
              <p>PropTrader Journal is a trading journal and analytics platform designed specifically for proprietary trading firm traders. We provide tools for trade tracking, risk management, performance analysis, and educational resources.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">4. User Responsibilities</h2>
              <ul className="list-disc list-inside space-y-2">
                <li>Maintain the confidentiality of your account information</li>
                <li>Use the service only for lawful trading activities</li>
                <li>Provide accurate information when creating accounts</li>
                <li>Not attempt to reverse engineer or compromise the platform</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">5. Privacy and Data</h2>
              <p>Your trading data is private and secure. We do not share your trading information with third parties. See our Privacy Policy for detailed information on data handling.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">6. Limitation of Liability</h2>
              <p>PropTrader Journal shall not be liable for any trading losses or damages arising from the use of this platform. All trading decisions are made at your own risk.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">7. Contact Information</h2>
              <p>For questions about these Terms of Service, please contact us at legal@proptraderjournal.com</p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-4xl mx-auto">
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-2xl text-white">Privacy Policy</CardTitle>
            <p className="text-gray-300">Last updated: August 4, 2025</p>
          </CardHeader>
          <CardContent className="space-y-6 text-gray-300">
            <section>
              <h2 className="text-xl font-semibold text-white mb-3">1. Information We Collect</h2>
              <div className="space-y-2">
                <p><strong className="text-white">Account Information:</strong> Email address, name, and authentication data</p>
                <p><strong className="text-white">Trading Data:</strong> Trade history, account balances, and performance metrics</p>
                <p><strong className="text-white">Usage Data:</strong> How you interact with our platform for improvement purposes</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">2. How We Use Your Information</h2>
              <ul className="list-disc list-inside space-y-2">
                <li>Provide and maintain our trading journal services</li>
                <li>Generate analytics and performance reports</li>
                <li>Improve platform features and user experience</li>
                <li>Send important account and service notifications</li>
                <li>Provide customer support and respond to inquiries</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">3. Data Security</h2>
              <p>We implement industry-standard security measures including:</p>
              <ul className="list-disc list-inside space-y-2 mt-2">
                <li>End-to-end encryption for sensitive data</li>
                <li>Secure password hashing with bcrypt</li>
                <li>PostgreSQL session management with auto-expiry</li>
                <li>Regular security audits and monitoring</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">4. Data Sharing</h2>
              <p>We do not sell, trade, or rent your personal information to third parties. Your trading data remains private and is only accessible to you through your secure account.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">5. Data Retention</h2>
              <p>We retain your data for as long as your account is active or as needed to provide services. You may request data deletion by contacting support.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">6. Your Rights</h2>
              <ul className="list-disc list-inside space-y-2">
                <li>Access your personal data</li>
                <li>Correct inaccurate information</li>
                <li>Request data deletion</li>
                <li>Export your trading data</li>
                <li>Opt-out of non-essential communications</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">7. Cookies and Tracking</h2>
              <p>We use essential cookies for authentication and session management. No third-party tracking cookies are used.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">8. Contact Us</h2>
              <p>For privacy-related questions or requests, contact us at privacy@proptraderjournal.com</p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
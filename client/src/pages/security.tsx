import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Lock, Eye, Server, Key, FileCheck } from "lucide-react";

export default function Security() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-full">
              <Shield className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Enterprise-Grade Security
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Your trading data is protected with bank-level security measures and industry-leading encryption protocols.
          </p>
        </div>

        {/* Security Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <Card>
            <CardHeader>
              <Lock className="h-8 w-8 text-blue-500 mb-2" />
              <CardTitle>End-to-End Encryption</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                All data is encrypted using AES-256 encryption both in transit and at rest.
              </p>
              <Badge variant="outline" className="text-green-600 border-green-600">
                Military Grade
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Eye className="h-8 w-8 text-purple-500 mb-2" />
              <CardTitle>Privacy First</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                We never share, sell, or analyze your trading data. Your information stays private.
              </p>
              <Badge variant="outline" className="text-green-600 border-green-600">
                Zero Data Mining
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Server className="h-8 w-8 text-green-500 mb-2" />
              <CardTitle>Secure Infrastructure</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Hosted on enterprise-grade servers with 99.99% uptime and automated backups.
              </p>
              <Badge variant="outline" className="text-green-600 border-green-600">
                SOC 2 Compliant
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Key className="h-8 w-8 text-yellow-500 mb-2" />
              <CardTitle>Access Control</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Multi-factor authentication and session management keep your account secure.
              </p>
              <Badge variant="outline" className="text-green-600 border-green-600">
                MFA Required
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <FileCheck className="h-8 w-8 text-red-500 mb-2" />
              <CardTitle>Regular Audits</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Independent security audits and penetration testing ensure ongoing protection.
              </p>
              <Badge variant="outline" className="text-green-600 border-green-600">
                Quarterly Audits
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Shield className="h-8 w-8 text-indigo-500 mb-2" />
              <CardTitle>Data Ownership</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                You own your data completely. Export anytime, delete on request.
              </p>
              <Badge variant="outline" className="text-green-600 border-green-600">
                Full Control
              </Badge>
            </CardContent>
          </Card>
        </div>

        {/* Compliance */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Compliance & Certifications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
              <div>
                <h3 className="font-semibold text-lg mb-2">GDPR</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Full compliance with EU privacy regulations
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">SOC 2</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Enterprise security standards certified
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">ISO 27001</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Information security management certified
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">CCPA</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  California privacy rights compliant
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
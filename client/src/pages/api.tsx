import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Code, Globe, Key, Zap, FileText, Shield } from "lucide-react";

export default function API() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-indigo-100 dark:bg-indigo-900/20 rounded-full">
              <Code className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            PropTraderJournal API
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Integrate your trading applications with our comprehensive REST API for seamless data synchronization.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <Card>
            <CardHeader>
              <Globe className="h-8 w-8 text-blue-500 mb-2" />
              <CardTitle>REST API</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Full RESTful API with JSON responses for all core functionality.
              </p>
              <Badge className="bg-blue-100 text-blue-700">v1.0 Stable</Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Key className="h-8 w-8 text-green-500 mb-2" />
              <CardTitle>Authentication</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Secure API key authentication with rate limiting and access control.
              </p>
              <Badge className="bg-green-100 text-green-700">Secure</Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Zap className="h-8 w-8 text-yellow-500 mb-2" />
              <CardTitle>Real-time</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                WebSocket connections for real-time updates and notifications.
              </p>
              <Badge className="bg-yellow-100 text-yellow-700">WebSockets</Badge>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">Available Endpoints</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 border rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <code className="text-sm bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">GET /api/trades</code>
                  <Badge className="bg-green-100 text-green-700">Available</Badge>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Retrieve all trading data with filtering and pagination</p>
              </div>
              
              <div className="p-4 border rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <code className="text-sm bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">POST /api/trades</code>
                  <Badge className="bg-green-100 text-green-700">Available</Badge>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Create new trade entries programmatically</p>
              </div>
              
              <div className="p-4 border rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <code className="text-sm bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">GET /api/analytics</code>
                  <Badge className="bg-green-100 text-green-700">Available</Badge>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Access performance analytics and statistics</p>
              </div>
              
              <div className="p-4 border rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <code className="text-sm bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">GET /api/accounts</code>
                  <Badge className="bg-green-100 text-green-700">Available</Badge>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Manage trading accounts and prop firm connections</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <Button size="lg" className="bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white px-8">
            <FileText className="mr-2 h-5 w-5" />
            View Full Documentation
          </Button>
        </div>
      </div>
    </div>
  );
}
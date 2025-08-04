import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Zap, 
  Download, 
  Upload, 
  Globe, 
  Smartphone, 
  BarChart3,
  CheckCircle,
  ArrowRight
} from "lucide-react";

export default function Integrations() {
  const platforms = [
    { name: "Tradovate", status: "Live", type: "Futures" },
    { name: "Interactive Brokers", status: "Live", type: "Multi-Asset" },
    { name: "MetaTrader 4/5", status: "Live", type: "Forex" },
    { name: "NinjaTrader", status: "Live", type: "Futures" },
    { name: "ThinkorSwim", status: "Live", type: "Stocks/Options" },
    { name: "Rithmic", status: "Beta", type: "Futures" },
    { name: "CQG", status: "Coming Soon", type: "Futures" },
    { name: "Binance", status: "Live", type: "Crypto" },
  ];

  const propFirms = [
    { name: "FTMO", status: "Verified" },
    { name: "MyForexFunds", status: "Verified" },
    { name: "TopstepTrader", status: "Verified" },
    { name: "The5%ers", status: "Verified" },
    { name: "FundedNext", status: "Verified" },
    { name: "Apex Trader Funding", status: "Verified" },
    { name: "Leeloo Trading", status: "Beta" },
    { name: "BluFX", status: "Coming Soon" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-full">
              <Zap className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Seamless Integrations
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Connect with all major trading platforms and prop firms for automated data import and analysis.
          </p>
        </div>

        {/* Integration Types */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <Card>
            <CardHeader>
              <Download className="h-8 w-8 text-green-500 mb-2" />
              <CardTitle>CSV Import</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Universal CSV import with intelligent column mapping for any trading platform.
              </p>
              <Badge className="bg-green-100 text-green-700">Universal</Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Globe className="h-8 w-8 text-blue-500 mb-2" />
              <CardTitle>API Connections</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Real-time data synchronization with supported platforms via secure API connections.
              </p>
              <Badge className="bg-blue-100 text-blue-700">Real-time</Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Smartphone className="h-8 w-8 text-purple-500 mb-2" />
              <CardTitle>Mobile Sync</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Access your data across all devices with automatic synchronization.
              </p>
              <Badge className="bg-purple-100 text-purple-700">Cross-platform</Badge>
            </CardContent>
          </Card>
        </div>

        {/* Trading Platforms */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">Supported Trading Platforms</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {platforms.map((platform, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium">{platform.name}</h3>
                    <Badge 
                      className={
                        platform.status === 'Live' 
                          ? 'bg-green-100 text-green-700' 
                          : platform.status === 'Beta'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-gray-100 text-gray-700'
                      }
                    >
                      {platform.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{platform.type}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Prop Firms */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">Verified Prop Firms</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {propFirms.map((firm, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium">{firm.name}</h3>
                    <Badge 
                      className={
                        firm.status === 'Verified' 
                          ? 'bg-green-100 text-green-700' 
                          : firm.status === 'Beta'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-gray-100 text-gray-700'
                      }
                    >
                      {firm.status}
                    </Badge>
                  </div>
                  {firm.status === 'Verified' && (
                    <div className="flex items-center text-sm text-green-600">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      <span>Rules Configured</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Integration Benefits */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">Why Integrate?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold mb-4">Automated Data Import</h3>
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    <span>No manual data entry required</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    <span>Real-time trade synchronization</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    <span>Automatic P&L calculations</span>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4">Enhanced Analytics</h3>
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    <span>Platform-specific insights</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    <span>Cross-platform comparison</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    <span>Unified reporting dashboard</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="text-center">
          <Button 
            size="lg" 
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-8"
          >
            Start Integrating
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
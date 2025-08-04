import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  Code, 
  Download, 
  ExternalLink, 
  Book, 
  Video, 
  Smartphone, 
  Globe 
} from "lucide-react";

export default function Documentation() {
  const docSections = [
    {
      title: "Getting Started",
      icon: Book,
      color: "text-blue-500",
      docs: [
        { title: "Quick Start Guide", type: "Guide", status: "Updated" },
        { title: "Installation & Setup", type: "Tutorial", status: "Updated" },
        { title: "First Steps", type: "Walkthrough", status: "Updated" },
        { title: "Basic Configuration", type: "Guide", status: "Updated" }
      ]
    },
    {
      title: "API Reference",
      icon: Code,
      color: "text-green-500",
      docs: [
        { title: "REST API Documentation", type: "Reference", status: "Latest" },
        { title: "WebSocket API", type: "Reference", status: "Latest" },
        { title: "Authentication", type: "Guide", status: "Updated" },
        { title: "Rate Limiting", type: "Guide", status: "Updated" }
      ]
    },
    {
      title: "Integrations",
      icon: Globe,
      color: "text-purple-500",
      docs: [
        { title: "Trading Platform Connections", type: "Guide", status: "Updated" },
        { title: "CSV Import Guide", type: "Tutorial", status: "Updated" },
        { title: "Prop Firm Integration", type: "Guide", status: "New" },
        { title: "Third-party Tools", type: "Reference", status: "Updated" }
      ]
    },
    {
      title: "Mobile App",
      icon: Smartphone,
      color: "text-orange-500",
      docs: [
        { title: "Mobile App Features", type: "Overview", status: "New" },
        { title: "iOS Setup Guide", type: "Tutorial", status: "Updated" },
        { title: "Android Setup Guide", type: "Tutorial", status: "Updated" },
        { title: "Mobile Sync", type: "Guide", status: "Updated" }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-indigo-100 dark:bg-indigo-900/20 rounded-full">
              <FileText className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Documentation
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Complete technical documentation, guides, and tutorials for PropTraderJournal.
          </p>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
          <Card className="text-center hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="pt-6">
              <Book className="h-8 w-8 text-blue-500 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Quick Start</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Get up and running in 5 minutes</p>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="pt-6">
              <Code className="h-8 w-8 text-green-500 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">API Reference</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Complete API documentation</p>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="pt-6">
              <Video className="h-8 w-8 text-purple-500 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Video Tutorials</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Step-by-step video guides</p>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="pt-6">
              <Download className="h-8 w-8 text-orange-500 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Downloads</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">SDKs and sample code</p>
            </CardContent>
          </Card>
        </div>

        {/* Documentation Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {docSections.map((section, index) => {
            const IconComponent = section.icon;
            return (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <IconComponent className={`h-5 w-5 ${section.color}`} />
                    <span>{section.title}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {section.docs.map((doc, docIndex) => (
                      <div key={docIndex} className="flex justify-between items-center p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">{doc.title}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{doc.type}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge 
                            className={
                              doc.status === 'New' 
                                ? 'bg-green-100 text-green-700' 
                                : doc.status === 'Latest'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-gray-100 text-gray-700'
                            }
                          >
                            {doc.status}
                          </Badge>
                          <ExternalLink className="h-4 w-4 text-gray-400" />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Popular Resources */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Popular Resources</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 border rounded-lg">
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">Complete Trading Guide</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Comprehensive guide to using PropTraderJournal for prop trading success.
                </p>
                <Button variant="outline" size="sm">
                  <Download className="h-3 w-3 mr-1" />
                  Download PDF
                </Button>
              </div>

              <div className="p-4 border rounded-lg">
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">API Postman Collection</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Ready-to-use Postman collection with all API endpoints and examples.
                </p>
                <Button variant="outline" size="sm">
                  <Download className="h-3 w-3 mr-1" />
                  Download Collection
                </Button>
              </div>

              <div className="p-4 border rounded-lg">
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">Video Tutorial Series</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Complete video series covering all features and best practices.
                </p>
                <Button variant="outline" size="sm">
                  <Video className="h-3 w-3 mr-1" />
                  Watch Series
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Help */}
        <Card>
          <CardContent className="pt-6 text-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Need help with implementation?
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Our technical team provides implementation support and consulting services.
            </p>
            <Button className="bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white">
              Get Technical Support
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
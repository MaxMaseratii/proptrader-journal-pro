import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Plus, Bug, Zap, Shield } from "lucide-react";

export default function Changelog() {
  const releases = [
    {
      version: "v2.1.0",
      date: "August 4, 2025",
      type: "feature",
      changes: [
        { type: "feature", text: "Added AI-Integrated Trading Journal with Marthy assistant" },
        { type: "feature", text: "Enhanced Mental Fitness Check with custom assessments" },
        { type: "feature", text: "New Strategy Builder & Sharing community features" },
        { type: "improvement", text: "Improved pricing comparison modal design" },
        { type: "fix", text: "Fixed theme persistence across all pages" }
      ]
    },
    {
      version: "v2.0.5",
      date: "July 28, 2025",
      type: "fix",
      changes: [
        { type: "fix", text: "Resolved P&L calculation error in dashboard widgets" },
        { type: "fix", text: "Fixed logout functionality and session management" },
        { type: "improvement", text: "Enhanced account selection validation for CSV imports" },
        { type: "security", text: "Updated authentication security protocols" }
      ]
    },
    {
      version: "v2.0.0",
      date: "July 15, 2025",
      type: "major",
      changes: [
        { type: "feature", text: "Major UI redesign with dark/light theme support" },
        { type: "feature", text: "New Prop Trader News Calendar with risk assessments" },
        { type: "feature", text: "Target Projection System for profit planning" },
        { type: "feature", text: "Prop Firm Spending & Payout Eligibility tracking" },
        { type: "improvement", text: "Performance optimizations across all components" }
      ]
    },
    {
      version: "v1.9.2",
      date: "June 30, 2025",
      type: "improvement",
      changes: [
        { type: "feature", text: "Added Daily Trading Plan Builder" },
        { type: "improvement", text: "Enhanced CSV import with better error handling" },
        { type: "fix", text: "Fixed timezone issues in trade timestamps" },
        { type: "improvement", text: "Improved mobile responsiveness" }
      ]
    },
    {
      version: "v1.8.0",
      date: "June 10, 2025",
      type: "feature",
      changes: [
        { type: "feature", text: "Introduced Pre-Session Mental Fitness Check" },
        { type: "feature", text: "New discipline scoring algorithm" },
        { type: "improvement", text: "Enhanced risk management calculations" },
        { type: "fix", text: "Resolved memory leaks in analytics charts" }
      ]
    }
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'feature': return <Plus className="h-4 w-4 text-green-500" />;
      case 'fix': return <Bug className="h-4 w-4 text-red-500" />;
      case 'improvement': return <Zap className="h-4 w-4 text-blue-500" />;
      case 'security': return <Shield className="h-4 w-4 text-purple-500" />;
      default: return <Calendar className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'major': return <Badge className="bg-purple-100 text-purple-700">Major Release</Badge>;
      case 'feature': return <Badge className="bg-green-100 text-green-700">Feature</Badge>;
      case 'fix': return <Badge className="bg-red-100 text-red-700">Bug Fix</Badge>;
      case 'improvement': return <Badge className="bg-blue-100 text-blue-700">Improvement</Badge>;
      default: return <Badge className="bg-gray-100 text-gray-700">Update</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-full">
              <Calendar className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Changelog
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Stay updated with the latest features, improvements, and bug fixes in PropTraderJournal.
          </p>
        </div>

        <div className="space-y-8">
          {releases.map((release, index) => (
            <Card key={index} className="border-l-4 border-l-yellow-500">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{release.version}</CardTitle>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">{release.date}</p>
                  </div>
                  {getTypeBadge(release.type)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {release.changes.map((change, changeIndex) => (
                    <div key={changeIndex} className="flex items-start space-x-3">
                      {getTypeIcon(change.type)}
                      <span className="text-gray-700 dark:text-gray-300">{change.text}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            Want to suggest a feature or report a bug? 
            <a href="/contact" className="text-yellow-600 hover:text-yellow-700 ml-1">Contact us</a>
          </p>
        </div>
      </div>
    </div>
  );
}
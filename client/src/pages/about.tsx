import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Target, 
  Users, 
  Award, 
  TrendingUp, 
  Globe, 
  Heart,
  Lightbulb,
  Shield
} from "lucide-react";

export default function About() {
  const team = [
    {
      name: "Sarah Chen",
      role: "CEO & Founder",
      background: "Former prop trader at SMB Capital with 8 years experience",
      avatar: "SC"
    },
    {
      name: "Michael Rodriguez",
      role: "CTO",
      background: "Ex-Goldman Sachs quantitative developer and trading systems architect",
      avatar: "MR"
    },
    {
      name: "Dr. Emma Thompson",
      role: "Head of Psychology",
      background: "PhD in Behavioral Finance, specialized in trading psychology research",
      avatar: "ET"
    },
    {
      name: "James Wilson",
      role: "Head of Product",
      background: "Former product manager at TradingView with prop trading experience",
      avatar: "JW"
    }
  ];

  const values = [
    {
      icon: Target,
      title: "Trader-First Approach",
      description: "Every feature is designed by traders, for traders, with real-world prop trading experience."
    },
    {
      icon: Shield,
      title: "Data Privacy",
      description: "Your trading data is sacred. We never share, sell, or analyze your personal trading information."
    },
    {
      icon: Lightbulb,
      title: "Continuous Innovation",
      description: "We constantly evolve based on prop trader feedback and the latest trading psychology research."
    },
    {
      icon: Heart,
      title: "Trader Success",
      description: "Your success is our mission. We measure our success by your trading performance improvements."
    }
  ];

  const stats = [
    { number: "50,000+", label: "Active Traders", icon: Users },
    { number: "$2.4B+", label: "Trades Tracked", icon: TrendingUp },
    { number: "150+", label: "Prop Firms Supported", icon: Globe },
    { number: "4.9/5", label: "Customer Rating", icon: Award }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            About PropTraderJournal
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            We're on a mission to help prop traders achieve consistent profitability through 
            advanced journaling, psychology tools, and performance analytics.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <Card key={index} className="text-center">
                <CardContent className="pt-6">
                  <IconComponent className="h-8 w-8 text-yellow-500 mx-auto mb-3" />
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                    {stat.number}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">{stat.label}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Mission Statement */}
        <Card className="mb-16 border-l-4 border-l-yellow-500">
          <CardContent className="pt-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Our Mission</h2>
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-4">
              PropTraderJournal was born from the frustration of successful prop traders who couldn't 
              find a journaling solution that understood the unique challenges of prop firm trading.
            </p>
            <p className="text-lg text-gray-700 dark:text-gray-300">
              We're the only trading journal exclusively focused on prop trader success, combining 
              advanced psychology tools, real-time performance tracking, and prop firm-specific 
              features that generic trading journals simply don't offer.
            </p>
          </CardContent>
        </Card>

        {/* Our Story */}
        <Card className="mb-16">
          <CardHeader>
            <CardTitle>Our Story</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 dark:text-blue-400 font-bold">2022</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">The Problem</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Sarah Chen, a successful prop trader, struggled to find a journal that understood 
                    prop firm rules, mental fitness requirements, and the unique pressures of funded trading.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-green-600 dark:text-green-400 font-bold">2023</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">The Solution</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Together with a team of developers and trading psychologists, we built the first 
                    journal designed specifically for prop traders, with features no other platform offered.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-purple-600 dark:text-purple-400 font-bold">2024</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">The Growth</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    PropTraderJournal became the #1 choice for prop traders worldwide, with thousands 
                    of success stories and partnerships with major prop firms.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-yellow-600 dark:text-yellow-400 font-bold">2025</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">The Future</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    We continue to innovate with AI-powered psychology insights, advanced risk management, 
                    and features that help prop traders achieve consistent profitability.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Our Values */}
        <Card className="mb-16">
          <CardHeader>
            <CardTitle>Our Values</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {values.map((value, index) => {
                const IconComponent = value.icon;
                return (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg flex-shrink-0">
                      <IconComponent className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{value.title}</h3>
                      <p className="text-gray-600 dark:text-gray-400">{value.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Team */}
        <Card className="mb-16">
          <CardHeader>
            <CardTitle>Meet Our Team</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {team.map((member, index) => (
                <div key={index} className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">
                    {member.avatar}
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{member.name}</h3>
                  <p className="text-sm text-yellow-600 dark:text-yellow-400 mb-2">{member.role}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{member.background}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <Card>
          <CardContent className="pt-6 text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Ready to Transform Your Trading?
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-2xl mx-auto">
              Join thousands of successful prop traders who use PropTraderJournal to achieve 
              consistent profitability and master their trading psychology.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white px-8">
                Start Your Free Trial
              </Button>
              <Button size="lg" variant="outline">
                Schedule a Demo
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
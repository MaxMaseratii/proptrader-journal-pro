import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  MessageCircle, 
  Mail, 
  Phone, 
  Clock, 
  CheckCircle,
  AlertCircle,
  Search,
  Send,
  Users,
  BookOpen,
  Video,
  Calendar
} from "lucide-react";

export default function Support() {
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketMessage, setTicketMessage] = useState("");

  const supportStats = [
    { label: "Average Response Time", value: "2.3 hours", icon: Clock, color: "text-blue-500" },
    { label: "Customer Satisfaction", value: "98.2%", icon: CheckCircle, color: "text-green-500" },
    { label: "Active Support Agents", value: "24/7", icon: Users, color: "text-purple-500" },
    { label: "Tickets Resolved Daily", value: "450+", icon: MessageCircle, color: "text-orange-500" }
  ];

  const contactMethods = [
    {
      title: "Live Chat",
      description: "Get instant help from our support team",
      icon: MessageCircle,
      availability: "24/7 Available",
      responseTime: "< 5 minutes",
      color: "text-green-500",
      bgColor: "bg-green-100"
    },
    {
      title: "Email Support", 
      description: "Send detailed questions and get comprehensive answers",
      icon: Mail,
      availability: "24/7 Available",
      responseTime: "< 2 hours",
      color: "text-blue-500",
      bgColor: "bg-blue-100"
    },
    {
      title: "Video Call Support",
      description: "Schedule one-on-one screen sharing sessions",
      icon: Video,
      availability: "Mon-Fri 9AM-6PM EST",
      responseTime: "Same day booking",
      color: "text-purple-500",
      bgColor: "bg-purple-100"
    },
    {
      title: "Phone Support",
      description: "Speak directly with our technical experts",
      icon: Phone,
      availability: "Mon-Fri 8AM-8PM EST",
      responseTime: "< 1 minute",
      color: "text-orange-500",
      bgColor: "bg-orange-100"
    }
  ];

  const commonIssues = [
    {
      category: "CSV Import Issues",
      icon: AlertCircle,
      color: "text-red-500",
      issues: [
        "CSV format not recognized - Check broker compatibility guide",
        "Date parsing errors - Ensure MM/DD/YYYY format",
        "Missing commission data - Update broker export settings",
        "Duplicate trade detection - Review import filters"
      ]
    },
    {
      category: "Account Setup",
      icon: Users,
      color: "text-blue-500", 
      issues: [
        "Prop firm account connection - Verify API credentials",
        "Balance discrepancies - Check starting balance settings",
        "Risk parameter setup - Review drawdown calculations",
        "Multiple account management - Enable account switching"
      ]
    },
    {
      category: "Performance Analytics",
      icon: BookOpen,
      color: "text-green-500",
      issues: [
        "P&L calculation errors - Verify trade data completeness",
        "Discipline score questions - Review scoring methodology",
        "Report generation failures - Check date range limits",
        "Chart display issues - Clear browser cache"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-gradient-to-r from-green-600 to-blue-600 rounded-full">
              <MessageCircle className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">
            PropTrader Support Center
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Expert support for prop traders. Our team understands the unique challenges of prop firm trading and is here to help you succeed.
          </p>
        </div>

        {/* Support Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {supportStats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <Card key={index} className="bg-gray-900 border-gray-700 text-center">
                <CardContent className="pt-6">
                  <div className={`inline-flex p-3 rounded-full bg-gray-800 mb-4`}>
                    <IconComponent className={`h-6 w-6 ${stat.color}`} />
                  </div>
                  <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                  <div className="text-sm text-gray-400">{stat.label}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Contact Methods */}
        <Card className="mb-12 bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white text-center">Get Help Now</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {contactMethods.map((method, index) => {
                const IconComponent = method.icon;
                return (
                  <div key={index} className="text-center p-4 border border-gray-700 rounded-lg hover:border-gray-600 transition-colors">
                    <div className={`inline-flex p-3 rounded-full ${method.bgColor.replace('100', '900/20')} mb-4`}>
                      <IconComponent className={`h-6 w-6 ${method.color}`} />
                    </div>
                    <h3 className="font-semibold text-white mb-2">{method.title}</h3>
                    <p className="text-sm text-gray-400 mb-3">{method.description}</p>
                    <div className="space-y-1 text-xs text-gray-500 mb-4">
                      <div>{method.availability}</div>
                      <div>Response: {method.responseTime}</div>
                    </div>
                    <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                      Start {method.title}
                    </Button>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Quick Ticket Form */}
        <Card className="mb-12 bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Submit Support Ticket</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Subject</label>
                <input
                  type="text"
                  value={ticketSubject}
                  onChange={(e) => setTicketSubject(e.target.value)}
                  placeholder="Brief description of your issue"
                  className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-black text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Message</label>
                <textarea
                  value={ticketMessage}
                  onChange={(e) => setTicketMessage(e.target.value)}
                  placeholder="Describe your issue in detail. Include steps to reproduce, error messages, and any relevant account information."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-black text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-500"
                />
              </div>
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                <Send className="h-4 w-4 mr-2" />
                Submit Ticket
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Common Issues */}
        <Card className="mb-12 bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Common Issues & Quick Fixes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {commonIssues.map((category, index) => {
                const IconComponent = category.icon;
                return (
                  <div key={index}>
                    <div className="flex items-center space-x-2 mb-4">
                      <IconComponent className={`h-5 w-5 ${category.color}`} />
                      <h3 className="font-semibold text-white">{category.category}</h3>
                    </div>
                    <div className="space-y-3">
                      {category.issues.map((issue, issueIndex) => (
                        <div key={issueIndex} className="p-3 bg-gray-800 rounded-lg border border-gray-700">
                          <p className="text-sm text-gray-300">{issue}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Emergency Contact */}
        <Card className="bg-gradient-to-r from-red-900/20 to-orange-900/20 border-red-500/30">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">
              Account Emergency?
            </h3>
            <p className="text-gray-300 mb-4">
              For urgent account issues, trading platform outages, or prop firm related emergencies.
            </p>
            <Button className="bg-red-600 hover:bg-red-700 text-white">
              Emergency Hotline: +1 (555) PROP-911
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  MessageCircle, Mail, Phone, Clock, Search, Book, 
  HelpCircle, Bug, CreditCard, Shield, FileText,
  CheckCircle, AlertCircle, Info, ExternalLink,
  Video, Download, Users, Globe
} from "lucide-react";

export default function Support() {
  const [searchQuery, setSearchQuery] = useState("");
  const [supportForm, setSupportForm] = useState({
    name: "",
    email: "",
    category: "",
    subject: "",
    message: "",
    priority: "normal"
  });
  const { toast } = useToast();

  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    // Support ticket submission logic would go here
    toast({
      title: "Support Ticket Submitted",
      description: "We'll respond within 24 hours. Check your email for updates.",
    });
    setSupportForm({
      name: "",
      email: "",
      category: "",
      subject: "",
      message: "",
      priority: "normal"
    });
  };

  const faqItems = [
    {
      category: "Getting Started",
      icon: <Book className="h-5 w-5 text-blue-400" />,
      questions: [
        {
          q: "How do I import my trading data from CSV files?",
          a: "Go to Trades Log → Import CSV tab. Our universal importer supports all major trading platforms including MetaTrader, Tradovate, and ThinkorSwim. Simply select your file and our system will auto-detect the format."
        },
        {
          q: "Can I track multiple prop firm accounts?",
          a: "Yes! PropTraderJournal supports unlimited accounts on Premium plans. Create separate accounts for each prop firm challenge or funded account to track performance independently."
        },
        {
          q: "How do I set up risk management rules?",
          a: "In Account Creation, go to Risk Settings tab. Set your daily loss limits, maximum drawdown, and profit targets. The system will monitor these automatically and send notifications when approaching limits."
        }
      ]
    },
    {
      category: "Account & Billing",
      icon: <CreditCard className="h-5 w-5 text-green-400" />,
      questions: [
        {
          q: "What's included in the free trial?",
          a: "15-day free trial with full access to all features. No credit card required. Trial includes up to 5 accounts and all analytics tools."
        },
        {
          q: "Can I change my subscription plan?",
          a: "Yes, upgrade or downgrade anytime through Profile → Billing. Changes take effect immediately with prorated billing adjustments."
        },
        {
          q: "How do I cancel my subscription?",
          a: "Go to Profile → Billing → Cancel Subscription. Access continues until the end of your billing period. No cancellation fees."
        }
      ]
    },
    {
      category: "Features & Analytics",
      icon: <HelpCircle className="h-5 w-5 text-purple-400" />,
      questions: [
        {
          q: "What is the Discipline Analysis feature?",
          a: "Our advanced AI analyzes your trading behavior across 6 key areas: Risk Management, Emotional Control, Strategy Adherence, Market Analysis, Time Management, and Continuous Learning. Get detailed insights and improvement recommendations."
        },
        {
          q: "How accurate are the payout projections?",
          a: "Projections use your actual trading data and account-specific rules you've entered. They're mathematical calculations based on your performance patterns, but past results don't guarantee future outcomes."
        },
        {
          q: "Can I export my trading data?",
          a: "Yes, export data in JSON, CSV, or PDF formats through Advanced Analytics → Reports. You own your data and can export it anytime."
        }
      ]
    },
    {
      category: "Technical Issues",
      icon: <Bug className="h-5 w-5 text-red-400" />,
      questions: [
        {
          q: "The dashboard isn't loading my data",
          a: "Check your account selection in the top-right filter. If set to an account with no trades, widgets will show 'No Data'. Switch to 'All Accounts' or select an account with trading history."
        },
        {
          q: "CSV import is failing",
          a: "Ensure your CSV has Date, Symbol, Entry Price, Exit Price, and P&L columns. Our system supports most formats but may need manual column mapping for custom layouts."
        },
        {
          q: "Notifications aren't working",
          a: "Check Profile → Notifications to ensure they're enabled. Email notifications require proper email settings. Test notifications are available in the settings panel."
        }
      ]
    }
  ];

  const contactMethods = [
    {
      title: "Email Support",
      description: "Get detailed help via email",
      contact: "support@proptraderjournal.com",
      responseTime: "Within 24 hours",
      icon: <Mail className="h-6 w-6 text-blue-400" />,
      available: "24/7"
    },
    {
      title: "Live Chat",
      description: "Instant help during business hours",
      contact: "Available in-app",
      responseTime: "Usually within 5 minutes",
      icon: <MessageCircle className="h-6 w-6 text-green-400" />,
      available: "Mon-Fri 9AM-6PM EST"
    },
    {
      title: "Priority Support",
      description: "Premium & Premium plan users",
      contact: "priority@proptraderjournal.com",
      responseTime: "Within 4 hours",
      icon: <Shield className="h-6 w-6 text-purple-400" />,
      available: "Mon-Fri 8AM-8PM EST"
    }
  ];

  const resources = [
    {
      title: "Video Tutorials",
      description: "Step-by-step guides for all features",
      link: "#tutorials",
      icon: <Video className="h-5 w-5 text-blue-400" />
    },
    {
      title: "User Manual",
      description: "Complete documentation",
      link: "#manual", 
      icon: <Book className="h-5 w-5 text-green-400" />
    },
    {
      title: "Community Forum",
      description: "Connect with other traders",
      link: "#community",
      icon: <Users className="h-5 w-5 text-purple-400" />
    },
    {
      title: "API Documentation",
      description: "For developers and integrations",
      link: "#api",
      icon: <FileText className="h-5 w-5 text-orange-400" />
    }
  ];

  const filteredFAQ = faqItems.map(category => ({
    ...category,
    questions: category.questions.filter(item => 
      searchQuery === "" || 
      item.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.a.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

  return (
    <div className="min-h-screen bg-dark-bg text-white p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gradient-rainbow mb-4">Support Center</h1>
          <p className="text-gray-300">
            Get help with PropTraderJournal. Search our knowledge base or contact our support team.
          </p>
        </div>

        {/* Quick Search */}
        <Card className="bg-gray-900 border-gray-700 mb-8">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  placeholder="Search for help articles, features, or common issues..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-gray-800 border-gray-600 text-white"
                />
              </div>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* FAQ Section */}
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-400">
                  <HelpCircle className="h-5 w-5" />
                  Frequently Asked Questions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {filteredFAQ.map((category, categoryIndex) => (
                    <div key={categoryIndex}>
                      <div className="flex items-center gap-2 mb-4">
                        {category.icon}
                        <h3 className="text-lg font-semibold text-white">{category.category}</h3>
                        <Badge variant="outline" className="border-gray-600">
                          {category.questions.length} articles
                        </Badge>
                      </div>
                      
                      <div className="space-y-4">
                        {category.questions.map((item, itemIndex) => (
                          <div key={itemIndex} className="bg-gray-800 p-4 rounded-lg">
                            <h4 className="font-medium text-white mb-2">{item.q}</h4>
                            <p className="text-gray-300 text-sm">{item.a}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  
                  {filteredFAQ.length === 0 && searchQuery && (
                    <div className="text-center py-8">
                      <AlertCircle className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-400 mb-2">No results found</h3>
                      <p className="text-gray-500">Try searching with different keywords or contact our support team.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Contact Form */}
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-400">
                  <MessageCircle className="h-5 w-5" />
                  Submit Support Ticket
                </CardTitle>
                <p className="text-gray-400 text-sm">
                  Can't find what you're looking for? Send us a detailed message and we'll help you out.
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitTicket} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={supportForm.name}
                        onChange={(e) => setSupportForm({...supportForm, name: e.target.value})}
                        className="bg-gray-800 border-gray-600 text-white"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={supportForm.email}
                        onChange={(e) => setSupportForm({...supportForm, email: e.target.value})}
                        className="bg-gray-800 border-gray-600 text-white"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="category">Category</Label>
                      <Select value={supportForm.category} onValueChange={(value) => setSupportForm({...supportForm, category: value})}>
                        <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="technical">Technical Issue</SelectItem>
                          <SelectItem value="billing">Billing & Account</SelectItem>
                          <SelectItem value="feature">Feature Request</SelectItem>
                          <SelectItem value="data">Data Import/Export</SelectItem>
                          <SelectItem value="general">General Question</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="priority">Priority</Label>
                      <Select value={supportForm.priority} onValueChange={(value) => setSupportForm({...supportForm, priority: value})}>
                        <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low - General inquiry</SelectItem>
                          <SelectItem value="normal">Normal - Standard support</SelectItem>
                          <SelectItem value="high">High - Urgent issue</SelectItem>
                          <SelectItem value="critical">Critical - Service down</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      value={supportForm.subject}
                      onChange={(e) => setSupportForm({...supportForm, subject: e.target.value})}
                      className="bg-gray-800 border-gray-600 text-white"
                      placeholder="Brief description of your issue"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      value={supportForm.message}
                      onChange={(e) => setSupportForm({...supportForm, message: e.target.value})}
                      className="bg-gray-800 border-gray-600 text-white resize-none"
                      rows={5}
                      placeholder="Please provide as much detail as possible about your issue..."
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Submit Support Ticket
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Methods */}
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-400">
                  <Phone className="h-5 w-5" />
                  Contact Methods
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {contactMethods.map((method, index) => (
                  <div key={index} className="bg-gray-800 p-4 rounded-lg">
                    <div className="flex items-start gap-3">
                      {method.icon}
                      <div className="flex-1">
                        <h4 className="font-semibold text-white mb-1">{method.title}</h4>
                        <p className="text-gray-400 text-sm mb-2">{method.description}</p>
                        <p className="text-blue-400 text-sm">{method.contact}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Clock className="h-3 w-3 text-gray-500" />
                          <span className="text-xs text-gray-500">{method.available}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-3 w-3 text-green-400" />
                          <span className="text-xs text-green-400">{method.responseTime}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Resources */}
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-400">
                  <Book className="h-5 w-5" />
                  Additional Resources
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {resources.map((resource, index) => (
                  <a
                    key={index}
                    href={resource.link}
                    className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors group"
                  >
                    {resource.icon}
                    <div className="flex-1">
                      <h4 className="font-medium text-white group-hover:text-blue-400 transition-colors">
                        {resource.title}
                      </h4>
                      <p className="text-gray-400 text-sm">{resource.description}</p>
                    </div>
                    <ExternalLink className="h-4 w-4 text-gray-500 group-hover:text-blue-400 transition-colors" />
                  </a>
                ))}
              </CardContent>
            </Card>

            {/* System Status */}
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-400">
                  <Globe className="h-5 w-5" />
                  System Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">API Services</span>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-green-400 text-sm">Operational</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Database</span>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-green-400 text-sm">Operational</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Notifications</span>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-green-400 text-sm">Operational</span>
                    </div>
                  </div>
                  <Separator className="bg-gray-700" />
                  <div className="text-xs text-gray-500 text-center">
                    Last checked: Just now
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Separator className="my-8 bg-gray-700" />

        <div className="text-center pb-6">
          <p className="text-gray-400 text-sm">
            © 2025 PropTraderJournal. Need immediate help? Email us at support@proptraderjournal.com
          </p>
          <div className="flex justify-center gap-4 mt-2">
            <a href="/privacy-policy" className="text-blue-400 hover:text-blue-300 text-sm">Privacy Policy</a>
            <a href="/terms" className="text-blue-400 hover:text-blue-300 text-sm">Terms of Service</a>
            <a href="/dashboard" className="text-blue-400 hover:text-blue-300 text-sm">Back to Dashboard</a>
          </div>
        </div>
      </div>
    </div>
  );
}
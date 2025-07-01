import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  Shield, 
  Brain, 
  Target, 
  Zap, 
  BarChart3,
  CheckCircle,
  Star,
  Award,
  BookOpen,
  Sparkles,
  Crown,
  Gem
} from "lucide-react";

export default function Welcome() {
  const features = [
    {
      icon: BookOpen,
      title: "Elite Trading Journal",
      description: "Professional-grade journal designed specifically for prop trading success",
      color: "text-prop-gold"
    },
    {
      icon: Brain,
      title: "Advanced Analytics",
      description: "AI-powered insights and performance metrics to optimize your trading",
      color: "text-prop-tiffany"
    },
    {
      icon: Shield,
      title: "Risk Management",
      description: "Smart position sizing and drawdown protection tools",
      color: "text-prop-green"
    },
    {
      icon: Target,
      title: "Performance Tracking",
      description: "Real-time P&L tracking with detailed performance breakdowns",
      color: "text-prop-blue"
    },
    {
      icon: Zap,
      title: "CSV Import",
      description: "Seamlessly import trades from any broker or prop firm platform",
      color: "text-prop-pink"
    },
    {
      icon: BarChart3,
      title: "Visual Reports",
      description: "Beautiful charts and reports to showcase your trading evolution",
      color: "text-prop-gold"
    }
  ];

  const testimonials = [
    {
      name: "Alex Chen",
      title: "FTMO Funded Trader",
      content: "PropJournal Pro helped me pass my $200K challenge. The risk management tools are incredible.",
      rating: 5,
      gradient: "bg-prop-gradient-gold"
    },
    {
      name: "Sarah Mitchell",
      title: "MyForexFunds Pro",
      content: "Finally, a journal that understands prop trading. The analytics saved my account multiple times.",
      rating: 5,
      gradient: "bg-prop-gradient-tiffany"
    },
    {
      name: "Marcus Rodriguez",
      title: "The Funded Trader Elite",
      content: "From failing challenges to consistent payouts. This platform transformed my trading career.",
      rating: 5,
      gradient: "bg-prop-gradient-green"
    }
  ];

  return (
    <div className="min-h-screen bg-prop-gradient-hero">
      {/* Navigation */}
      <nav className="glass-effect sticky top-0 z-50 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-prop-gradient-rainbow p-3 rounded-xl">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gradient-rainbow">PropJournal Pro</h1>
              <p className="text-xs text-gray-400">Elite Trading Journal</p>
            </div>
          </div>
          <Button 
            onClick={() => window.location.href = '/api/login'}
            className="bg-prop-gradient-gold text-black font-semibold hover:scale-105 smooth-transition border-gradient-gold"
          >
            Sign In
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 pb-32 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="mb-8">
            <Badge className="bg-prop-gradient-rainbow text-white px-6 py-2 text-lg font-semibold mb-6">
              <Crown className="w-4 h-4 mr-2" />
              The Elite Choice for Prop Traders
            </Badge>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-bold mb-8 leading-tight">
            Master Your
            <br />
            <span className="text-gradient-rainbow">Trading Journey</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed">
            The most advanced trading journal built exclusively for prop traders. 
            Transform your performance, pass your challenges, and achieve consistent profitability.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
            <Button 
              onClick={() => window.location.href = '/api/login'}
              size="lg"
              className="bg-prop-gradient-gold text-black text-xl px-12 py-6 font-bold hover-lift smooth-transition border-gradient-gold"
            >
              <Sparkles className="w-6 h-6 mr-3" />
              Start Your Journey
            </Button>
            <Button 
              variant="outline"
              size="lg"
              className="text-xl px-12 py-6 border-prop-tiffany text-prop-tiffany hover:bg-prop-tiffany hover:text-black smooth-transition"
            >
              <Award className="w-6 h-6 mr-3" />
              View Features
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-70">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-prop-green" />
              <span className="text-gray-400">Trusted by 10,000+ Traders</span>
            </div>
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-prop-blue" />
              <span className="text-gray-400">Bank-Level Security</span>
            </div>
            <div className="flex items-center space-x-2">
              <Star className="w-5 h-5 text-prop-gold" />
              <span className="text-gray-400">4.9/5 Rating</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-6 text-gradient-gold">
              Elite Features for Elite Traders
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Every tool you need to dominate prop trading challenges and build a sustainable trading career
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className="bg-prop-card hover:bg-prop-card-hover smooth-transition hover-lift border-gradient-gold"
              >
                <CardHeader>
                  <div className={`w-12 h-12 rounded-xl bg-prop-gradient-rainbow flex items-center justify-center mb-4`}>
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className={`text-xl ${feature.color}`}>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-300 text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-6 text-gradient-tiffany">
              Choose Your Trading Level
            </h2>
            <p className="text-xl text-gray-300">
              From aspiring traders to professional firms - we have the perfect plan for your journey
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Free Starter */}
            <Card className="bg-prop-card hover:bg-prop-card-hover smooth-transition hover-lift border-prop-green">
              <CardHeader className="text-center p-8">
                <div className="w-16 h-16 bg-prop-gradient-green rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl text-prop-green">Free Starter</CardTitle>
                <CardDescription className="text-gray-300 mt-4">Perfect for new traders</CardDescription>
                <div className="mt-6">
                  <span className="text-4xl font-bold text-prop-green">$0</span>
                  <span className="text-gray-400">/month</span>
                </div>
              </CardHeader>
              <CardContent className="p-8 pt-0">
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-prop-green mr-3" />
                    <span className="text-gray-300">5 Trading Accounts</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-prop-green mr-3" />
                    <span className="text-gray-300">Basic Performance Analytics</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-prop-green mr-3" />
                    <span className="text-gray-300">Trade Journal</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-prop-green mr-3" />
                    <span className="text-gray-300">CSV Import</span>
                  </li>
                </ul>
                <Button 
                  onClick={() => window.location.href = '/api/login'}
                  className="w-full bg-prop-gradient-green text-white hover-scale smooth-transition"
                >
                  Get Started Free
                </Button>
              </CardContent>
            </Card>

            {/* Pro Trader */}
            <Card className="bg-prop-card hover:bg-prop-card-hover smooth-transition hover-lift border-prop-gold relative transform scale-105">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-prop-gradient-gold text-black px-6 py-2 font-bold">
                  <Crown className="w-4 h-4 mr-2" />
                  MOST POPULAR
                </Badge>
              </div>
              <CardHeader className="text-center p-8">
                <div className="w-16 h-16 bg-prop-gradient-gold rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="w-8 h-8 text-black" />
                </div>
                <CardTitle className="text-2xl text-prop-gold">Pro Trader</CardTitle>
                <CardDescription className="text-gray-300 mt-4">For serious prop traders</CardDescription>
                <div className="mt-6">
                  <span className="text-4xl font-bold text-prop-gold">$9.99</span>
                  <span className="text-gray-400">/month</span>
                </div>
              </CardHeader>
              <CardContent className="p-8 pt-0">
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-prop-gold mr-3" />
                    <span className="text-gray-300">Unlimited Trading Accounts</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-prop-gold mr-3" />
                    <span className="text-gray-300">Advanced Analytics & Reports</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-prop-gold mr-3" />
                    <span className="text-gray-300">Risk Management Tools</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-prop-gold mr-3" />
                    <span className="text-gray-300">Performance Optimization</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-prop-gold mr-3" />
                    <span className="text-gray-300">Priority Support</span>
                  </li>
                </ul>
                <Button 
                  onClick={() => window.location.href = '/api/login'}
                  className="w-full bg-prop-gradient-gold text-black font-bold hover-scale smooth-transition"
                >
                  Start Pro Trial
                </Button>
              </CardContent>
            </Card>

            {/* Firm Plan */}
            <Card className="bg-prop-card hover:bg-prop-card-hover smooth-transition hover-lift border-prop-pink">
              <CardHeader className="text-center p-8">
                <div className="w-16 h-16 bg-prop-gradient-pink rounded-full flex items-center justify-center mx-auto mb-4">
                  <Gem className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl text-prop-pink">Firm Elite</CardTitle>
                <CardDescription className="text-gray-300 mt-4">For trading firms & teams</CardDescription>
                <div className="mt-6">
                  <span className="text-4xl font-bold text-prop-pink">$14.99</span>
                  <span className="text-gray-400">/month</span>
                </div>
              </CardHeader>
              <CardContent className="p-8 pt-0">
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-prop-pink mr-3" />
                    <span className="text-gray-300">Multi-Trader Management</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-prop-pink mr-3" />
                    <span className="text-gray-300">Firm-Wide Analytics</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-prop-pink mr-3" />
                    <span className="text-gray-300">Advanced Reporting</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-prop-pink mr-3" />
                    <span className="text-gray-300">API Integration</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-prop-pink mr-3" />
                    <span className="text-gray-300">White-Label Options</span>
                  </li>
                </ul>
                <Button 
                  onClick={() => window.location.href = '/api/login'}
                  className="w-full bg-prop-gradient-pink text-white hover-scale smooth-transition"
                >
                  Contact Sales
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-6 text-gradient-rainbow">
              Trusted by Elite Traders
            </h2>
            <p className="text-xl text-gray-300">
              Join thousands of successful prop traders who use PropJournal Pro
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-prop-card hover:bg-prop-card-hover smooth-transition hover-lift">
                <CardContent className="p-8">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-prop-gold fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-300 mb-6 text-lg leading-relaxed">"{testimonial.content}"</p>
                  <div className="flex items-center">
                    <div className={`w-12 h-12 rounded-full ${testimonial.gradient} flex items-center justify-center mr-4`}>
                      <span className="text-white font-bold text-lg">
                        {testimonial.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-white">{testimonial.name}</p>
                      <p className="text-gray-400">{testimonial.title}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-prop-card rounded-3xl p-12 border-gradient-rainbow">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gradient-rainbow">
              Ready to Elevate Your Trading?
            </h2>
            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              Join the elite community of prop traders who use PropJournal Pro to 
              consistently pass challenges and build profitable trading careers.
            </p>
            <Button 
              onClick={() => window.location.href = '/api/login'}
              size="lg"
              className="bg-prop-gradient-rainbow text-white text-xl px-12 py-6 font-bold hover-lift smooth-transition"
            >
              <Sparkles className="w-6 h-6 mr-3" />
              Start Your Elite Journey
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-gray-800">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="bg-prop-gradient-rainbow p-3 rounded-xl">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gradient-rainbow">PropJournal Pro</h3>
              <p className="text-sm text-gray-400">Elite Trading Journal</p>
            </div>
          </div>
          <p className="text-gray-400 mb-6">
            Empowering prop traders worldwide to achieve consistent profitability
          </p>
          <div className="flex justify-center space-x-8 text-gray-400">
            <span>© 2025 PropJournal Pro</span>
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>Support</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
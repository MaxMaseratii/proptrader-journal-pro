import { useRoute } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  BookOpen, 
  Clock, 
  Users, 
  Star,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Target,
  Upload,
  Settings,
  BarChart3,
  PlusCircle
} from "lucide-react";

export default function KnowledgeBaseArticle() {
  const [match, params] = useRoute("/knowledge-base/article/:category/:article");

  const getArticleContent = (category: string, article: string) => {
    if (category === "popular") {
      switch (article) {
        case "complete-guide-to-pre-session-mental-fitness-check":
          return {
            title: "Complete Guide to Pre-Session Mental Fitness Check",
            category: "Mental Fitness",
            readTime: "8 min read",
            views: 5643,
            rating: 4.9,
            content: `
# How to Use the Pre-Session Mental Fitness Check

The Pre-Session Mental Fitness Check is a comprehensive psychological assessment tool designed to evaluate your mental state before each trading session.

## Step 1: Access the Mental Fitness Check

1. Navigate to **Trading Dashboard** from the sidebar
2. Click on **Mental Check & Plan** widget
3. The assessment will automatically appear before you can start trading

## Step 2: Complete the 8-Point Assessment

Rate yourself on a scale of 1-5 for each psychological metric:

### 1. Market Regime Awareness (0-10 points)
- **What it measures**: Your understanding of current market conditions
- **How to rate**: 5 = Crystal clear market direction, 1 = No clue about market state
- **Why it matters**: Prevents trading against the trend

### 2. Risk Respect Level (0-10 points) 
- **What it measures**: Your commitment to risk management rules
- **How to rate**: 5 = Will never violate stop loss, 1 = Likely to move stops
- **Why it matters**: Protects your account from major losses

### 3. Humility Check (0-10 points)
- **What it measures**: Your ego and overconfidence levels
- **How to rate**: 5 = Humble and realistic, 1 = Feeling invincible
- **Why it matters**: Prevents revenge trading and overtrading

### 4. Professional Trader Mindset (0-10 points)
- **What it measures**: Your focus and discipline mindset
- **How to rate**: 5 = Laser focused professional, 1 = Gambling mindset
- **Why it matters**: Ensures systematic trading approach

## Step 3: Review Your Score

- **32-40 points**: GO - Full trading session approved
- **24-31 points**: REDUCED - Trade with smaller size
- **16-23 points**: NO-GO - Take a break, don't trade today

## Step 4: Read the Wisdom Guidance

Based on your score, you'll receive personalized guidance text to help improve your mental state.

## Step 5: Track Your Progress

- View your historical mental fitness scores
- Correlate mental state with trading performance
- Identify patterns and improvement areas

## Best Practices

- Complete the check every single trading day
- Be honest with your self-assessment
- Don't trade if you score below 24 points
- Use the wisdom guidance to improve
- Track correlation with P&L performance

## Troubleshooting

**Q: Can I skip the mental fitness check?**
A: No, it's mandatory before accessing other trading tools

**Q: What if I disagree with the GO/NO-GO recommendation?**
A: The system is designed to protect you - follow the guidance

**Q: How often should I take the assessment?**
A: Once per trading day, before market open
            `
          };
          
        case "daily-trading-plan-builder-structure-for-success":
          return {
            title: "Daily Trading Plan Builder: Structure for Success",
            category: "Planning",
            readTime: "12 min read", 
            views: 4321,
            rating: 4.8,
            content: `
# How to Use the Daily Trading Plan Builder

The Daily Trading Plan Builder helps you create comprehensive trading plans with built-in risk management and performance tracking.

## Step 1: Access the Plan Builder

1. Go to **Trading Dashboard**
2. Click on **Mental Check & Plan** widget
3. After completing mental fitness check, click **Create Daily Plan**

## Step 2: Set Your Session Parameters

### Trading Session Setup
- **Market Session**: Choose NY, London, Asian, or Overlap
- **Trading Hours**: Set your specific start and end times
- **Maximum Trades**: Set daily trade limit (recommended: 3-5)
- **Maximum Risk**: Set total risk per day (recommended: 1-2% of account)

### Account Selection
- Choose which prop firm account you're trading
- Verify current balance and drawdown limits
- Check remaining buffer before hitting daily loss limit

## Step 3: Strategy Selection

### Choose Your Primary Strategy
1. Select from saved strategies or create new
2. Define entry criteria (support/resistance, breakouts, etc.)
3. Set stop loss and take profit parameters
4. Specify position sizing rules

### Risk Management Rules
- **Stop Loss**: Maximum loss per trade
- **Take Profit**: Target profit per trade  
- **Position Size**: Risk amount or percentage
- **Risk-Reward Ratio**: Minimum R:R (recommended 1:2)

## Step 4: Market Analysis

### Pre-Market Analysis
- **Key Levels**: Mark support/resistance levels
- **News Events**: Note high-impact news for the day
- **Market Bias**: Define bullish/bearish outlook
- **Volatility Assessment**: Expected market movement

### Watchlist Setup
- Add 3-5 instruments to focus on
- Set up alerts for key levels
- Define entry and exit points

## Step 5: Psychological Preparation

### Trading Rules Commitment
- Check boxes to commit to your rules
- Set emotional state expectations
- Define what success looks like today

### Contingency Planning
- Plan for if you hit daily loss limit
- Define actions if you start revenge trading
- Set break schedules between trades

## Step 6: Live Tracking During Session

### Real-Time Updates
- Mark trades as they happen
- Update P&L in real-time
- Track adherence to plan

### Plan Deviations
- Note when you deviate from plan
- Record reasons for changes
- Rate emotional state changes

## Step 7: End-of-Day Review

### Performance Analysis
- Compare actual vs planned results
- Calculate plan adherence score
- Identify improvement areas

### Journal Integration
- Automatically link to journal entry
- Add lessons learned
- Plan improvements for tomorrow

## Best Practices

### Daily Plan Checklist
- ✅ Complete mental fitness check first
- ✅ Set realistic trade and risk limits
- ✅ Define clear entry/exit criteria
- ✅ Choose maximum 3-5 instruments
- ✅ Set up all alerts before market open
- ✅ Review previous day's performance
- ✅ Commit to psychological rules

### Common Mistakes to Avoid
- ❌ Planning during market hours
- ❌ Setting unrealistic profit targets
- ❌ Ignoring risk management rules
- ❌ Not tracking real-time performance
- ❌ Changing plan mid-session without reason

## Advanced Features

### Strategy Templates
- Save successful plans as templates
- Create different plans for different market conditions
- Share templates with team members (Enterprise)

### Performance Analytics
- Track plan adherence over time
- Correlate planning quality with results
- Identify most successful plan types

## Troubleshooting

**Q: Can I modify my plan during the trading session?**
A: Yes, but document why you're making changes

**Q: What if I exceed my planned trade limit?**
A: The system will alert you and recommend stopping

**Q: How detailed should my market analysis be?**
A: Include enough detail to guide trading decisions

**Q: Can I copy yesterday's plan?**
A: Yes, use the "Copy Previous Plan" feature and modify as needed
            `
          };

        default:
          return {
            title: "Article Not Found",
            category: "Error",
            readTime: "0 min",
            views: 0,
            rating: 0,
            content: "This article could not be found."
          };
      }
    }

    // Handle category-specific articles
    if (category === "getting-started") {
      switch (article) {
        case "setting-up-your-first-trading-account":
          return {
            title: "Setting up your first trading account",
            category: "Getting Started",
            readTime: "6 min read",
            views: 2847,
            rating: 4.8,
            content: `
# How to Set Up Your First Trading Account

Follow this step-by-step guide to create and configure your prop firm trading account with proper settings.

## Step 1: Create New Account

1. Navigate to **Dashboard** and click the **Account Manager** widget
2. Click **Add New Account** button
3. Fill in the account details:
   - **Account Name**: Give it a memorable name (e.g., "FTMO $100K Challenge")
   - **Account Type**: Select Challenge, Live, or Demo
   - **Firm Name**: Choose your prop firm from the dropdown
   - **Starting Balance**: Enter your account size
   - **Currency**: Select USD, EUR, GBP, etc.

## Step 2: Configure Risk Settings

### Drawdown Limits
- **Max Daily Loss**: Set your daily loss limit (usually 5% of account)
- **Max Total Drawdown**: Set overall drawdown limit (usually 10-12%)
- **Trailing Drawdown**: Enable if your prop firm uses trailing drawdown

### Position Sizing
- **Risk Per Trade**: Recommended 1-2% of account balance
- **Max Position Size**: Set maximum lot size per trade
- **Currency Risk**: Define risk in account currency

## Step 3: Set Up Profit Targets

### Challenge Accounts
- **Profit Target**: Enter required profit percentage (usually 8-10%)
- **Trading Days**: Minimum trading days required
- **Consistency Rule**: Enable if required (max 50% of profits from single day)

### Live Accounts  
- **Monthly Target**: Optional monthly profit goal
- **Payout Schedule**: Set expected payout frequency
- **Performance Fee**: Enter profit sharing percentage

## Step 4: Configure Trading Rules

### Time Restrictions
- **Trading Hours**: Set allowed trading times
- **News Trading**: Enable/disable news trading
- **Weekend Holds**: Allow/restrict holding positions over weekend

### Instrument Restrictions
- **Allowed Instruments**: Select Forex, Indices, Commodities, Crypto
- **Restricted Pairs**: Add any banned instruments
- **Lot Size Limits**: Set min/max position sizes

## Step 5: Connect Data Sources

### CSV Import Setup
- Click **Import Trades** to connect your broker
- Select broker type (MT4/5, Tradovate, NinjaTrader, etc.)
- Upload historical trades if available
- Set up automatic import schedule

### API Connections (Premium)
- Connect directly to supported brokers
- Enable real-time trade sync
- Set up automatic balance updates

## Step 6: Verify Settings

### Account Overview Check
- Review all settings in the account summary
- Verify risk calculations are correct
- Test position sizing calculator

### Risk Management Test
- Place a test trade entry to verify stop loss calculation
- Check that daily loss limits are enforced
- Confirm drawdown calculations are accurate

## Best Practices

### Account Naming Convention
- Use clear, descriptive names
- Include firm name and account size
- Add account type (Challenge/Live/Demo)
- Example: "FTMO-100K-Challenge-Phase1"

### Risk Settings Guidelines
- Start conservative with 1% risk per trade
- Never exceed prop firm's daily loss limits
- Set alerts at 50% and 75% of daily limit
- Use trailing stops for partial protection

### Regular Maintenance
- Update balance after each trading day
- Review and adjust risk settings monthly
- Archive completed challenge accounts
- Back up account configurations

## Troubleshooting

**Q: Why won't my account save?**
A: Check that all required fields are filled and balance is positive

**Q: Can I change risk settings after account creation?**
A: Yes, go to Account Settings and modify as needed

**Q: How do I handle multiple accounts with same prop firm?**
A: Create separate accounts with different names (e.g., Phase1, Phase2)

**Q: What if I don't see my prop firm in the list?**
A: Select "Other" and enter details manually, or contact support to add it
            `
          };

        default:
          return {
            title: "Article Not Found", 
            category: "Error",
            readTime: "0 min",
            views: 0,
            rating: 0,
            content: "This article could not be found."
          };
      }
    }

    return {
      title: "Article Not Found",
      category: "Error", 
      readTime: "0 min",
      views: 0,
      rating: 0,
      content: "This article could not be found."
    };
  };

  if (!match) {
    return <div>Article not found</div>;
  }

  const article = getArticleContent(params.category, params.article);

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            className="mb-4 text-gray-400 hover:text-white"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Knowledge Base
          </Button>
          
          <div className="flex items-center space-x-4 mb-4">
            <Badge className="bg-blue-600 text-white">{article.category}</Badge>
            <span className="text-gray-400 text-sm flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              {article.readTime}
            </span>
            <span className="text-gray-400 text-sm flex items-center">
              <Users className="h-4 w-4 mr-1" />
              {article.views.toLocaleString()} views
            </span>
            <span className="text-yellow-500 text-sm flex items-center">
              <Star className="h-4 w-4 mr-1" />
              {article.rating}/5
            </span>
          </div>
          
          <h1 className="text-3xl font-bold text-white mb-4">{article.title}</h1>
        </div>

        {/* Content */}
        <Card className="bg-gray-900 border-gray-700">
          <CardContent className="p-8">
            <div className="prose prose-invert max-w-none">
              <div 
                className="text-gray-300 leading-relaxed"
                dangerouslySetInnerHTML={{ 
                  __html: article.content
                    .split('\n')
                    .map(line => {
                      if (line.startsWith('# ')) {
                        return `<h1 class="text-2xl font-bold text-white mt-8 mb-4">${line.substring(2)}</h1>`;
                      } else if (line.startsWith('## ')) {
                        return `<h2 class="text-xl font-semibold text-white mt-6 mb-3">${line.substring(3)}</h2>`;
                      } else if (line.startsWith('### ')) {
                        return `<h3 class="text-lg font-medium text-white mt-4 mb-2">${line.substring(4)}</h3>`;
                      } else if (line.startsWith('- ')) {
                        return `<li class="ml-4 mb-1">${line.substring(2)}</li>`;
                      } else if (line.startsWith('* ')) {
                        return `<li class="ml-4 mb-1">${line.substring(2)}</li>`;
                      } else if (line.startsWith('**') && line.endsWith('**')) {
                        return `<p class="font-semibold text-white mb-2">${line.slice(2, -2)}</p>`;
                      } else if (line.includes('✅') || line.includes('❌')) {
                        return `<p class="mb-2 flex items-center">${line}</p>`;
                      } else if (line.trim() === '') {
                        return '<br>';
                      } else {
                        return `<p class="mb-3">${line}</p>`;
                      }
                    })
                    .join('')
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Related Articles */}
        <Card className="mt-8 bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Related Articles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border border-gray-700 rounded-lg hover:bg-gray-800 cursor-pointer">
                <h4 className="font-medium text-white mb-2">Understanding the dashboard</h4>
                <p className="text-gray-400 text-sm">Navigate the comprehensive dashboard widgets and analytics</p>
              </div>
              <div className="p-4 border border-gray-700 rounded-lg hover:bg-gray-800 cursor-pointer">
                <h4 className="font-medium text-white mb-2">Creating your first journal entry</h4>
                <p className="text-gray-400 text-sm">Document trades effectively with emotional insights</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
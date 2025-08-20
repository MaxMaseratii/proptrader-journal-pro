# Frontend Pages Implementation Prompts

## Core Application Pages

### 1. Main Dashboard Page (/)
**File: `client/src/pages/dashboard.tsx`**

**Prompt:**
Create a comprehensive trading dashboard with the following features:

**Key Components:**
- **Account Selection System**: Dropdown to select trading accounts with persistent global selection
- **Real-time P&L Widgets**: Live profit/loss tracking with color-coded values
- **Risk Management Panel**: Daily loss limits, drawdown tracking, position sizing
- **Trading Calendar**: Interactive calendar showing daily trading performance
- **Performance Analytics**: Win rate, profit factor, best/worst trades
- **Quick Trade Entry**: Form for manual trade entry
- **Journal Entry Integration**: Daily reflection entries linked to calendar dates
- **Target Progress**: Visual progress bars for profit targets and risk limits

**Styling Requirements:**
- Dark theme with gradient backgrounds (gray-900 to black)
- Gold/yellow accent colors for profits and highlights
- Red for losses, green for profits
- Card-based layout with glassmorphism effects
- Responsive grid system (works on mobile/desktop)
- Hover animations and transitions

**State Management:**
- Use TanStack Query for data fetching
- Local state for UI interactions (modals, selections)
- Global account selection persistence
- Real-time data updates

**Data Integration:**
- Fetch accounts from `/api/accounts`
- Fetch trades from `/api/trades`
- Fetch journal entries from `/api/journal-entries`
- Submit new trades via `/api/trades`

### 2. CSV Import Page (/csv-import)
**File: `client/src/pages/csv-import.tsx`**

**Prompt:**
Build an advanced CSV import system supporting 37+ trading platforms:

**Features:**
- **Universal File Uploader**: Drag-and-drop with progress tracking
- **Automatic Broker Detection**: AI-powered platform identification
- **Data Preview Table**: Show parsed data before import
- **Mapping Interface**: Column mapping for custom formats
- **Validation System**: Data validation with error reporting
- **Import Progress**: Real-time import status with success/error counts
- **History Panel**: Previous import records and statistics

**Supported Platforms:**
- Interactive Brokers (IBKR)
- ThinkorSwim (TD Ameritrade)
- MetaTrader 4/5
- NinjaTrader
- Tradovate
- TradingView
- Robinhood
- E*TRADE
- Charles Schwab
- Fidelity
- Plus 27+ more

**Technical Implementation:**
- Use `react-dropzone` for file upload
- CSV parsing with `papaparse`
- Progress tracking with percentages
- Error handling and user feedback
- Account-specific import validation

### 3. Trading Journal Page (/journal)
**File: `client/src/pages/journal.tsx`**

**Prompt:**
Create a comprehensive trading journal system:

**Features:**
- **Daily Entry Form**: What went right, what went wrong, improvement plans
- **Emotional State Tracking**: Mood indicators and psychological assessment
- **Strategy Adherence**: Rule compliance tracking
- **Market Conditions**: Market environment notes
- **Photo Attachments**: Chart screenshots and trade images
- **Search and Filter**: Find entries by date, account, or keywords
- **Analytics Dashboard**: Journal insights and patterns
- **Export Functionality**: PDF and CSV export options

**Components:**
- Rich text editor for detailed entries
- Image upload for trade screenshots
- Rating system for emotional states
- Calendar integration for date selection
- Tag system for categorization

### 4. Performance Analytics (/performance)
**File: `client/src/pages/performance.tsx`**

**Prompt:**
Build advanced performance analytics dashboard:

**Key Metrics:**
- **Equity Curve**: Interactive chart showing account growth
- **Monthly Performance**: Calendar heatmap of monthly returns
- **Win Rate Analysis**: Success rates by time, asset, strategy
- **Risk Metrics**: Sharpe ratio, maximum drawdown, profit factor
- **Trade Distribution**: Profit/loss histograms
- **Time Analysis**: Performance by day of week, time of day
- **Asset Performance**: Returns by trading instrument
- **Strategy Comparison**: Performance by trading strategy

**Chart Components:**
- Use Chart.js for interactive charts
- Responsive design for mobile viewing
- Exportable charts (PNG, PDF)
- Customizable time ranges
- Real-time data updates

### 5. Account Management (/accounts)
**File: `client/src/pages/accounts.tsx`**

**Prompt:**
Create comprehensive account management system:

**Account Creation:**
- **Multi-step Form**: Account details, risk parameters, trading rules
- **Prop Firm Templates**: Pre-configured settings for major firms
- **Risk Configuration**: Drawdown limits, daily loss limits, position sizing
- **Trading Rules**: Time restrictions, asset preferences, copy trading settings
- **Payout Settings**: Frequency, minimum amounts, profit splits

**Account Dashboard:**
- **Status Overview**: Active, passed, failed accounts
- **Balance Tracking**: Real-time balance calculations
- **Risk Monitoring**: Current drawdown, daily P&L limits
- **Progress Tracking**: Challenge phase progress
- **Account Actions**: Edit, archive, reset accounts

**Integration:**
- CSV account ID mapping for import validation
- Automatic balance calculations from trades
- Risk rule enforcement
- Phase transition management

### 6. Risk Management (/risk-management)
**File: `client/src/pages/risk-management.tsx`**

**Prompt:**
Build comprehensive risk management dashboard:

**Risk Monitoring:**
- **Position Sizing Calculator**: Automatic calculation based on account rules
- **Daily Risk Tracker**: Current risk usage vs. limits
- **Drawdown Monitor**: Real-time drawdown calculations
- **Risk Alerts**: Notifications for rule violations
- **Risk History**: Historical risk metrics and violations

**Risk Rules Engine:**
- **Customizable Rules**: Create account-specific risk rules
- **Violation Tracking**: Log and analyze rule breaches
- **Alert System**: Email/browser notifications
- **Risk Scoring**: Overall risk discipline score

### 7. Reports Page (/reports)
**File: `client/src/pages/reports.tsx`**

**Prompt:**
Create professional reporting system:

**Report Types:**
- **Daily Reports**: Daily performance summary
- **Weekly Summary**: Week-over-week analysis
- **Monthly Analysis**: Comprehensive monthly review
- **Quarterly Review**: Strategic performance analysis
- **Custom Reports**: User-defined date ranges and metrics

**Export Options:**
- **PDF Export**: Professional formatted reports
- **Excel Export**: Detailed data for analysis
- **Email Reports**: Automated report delivery
- **Print-friendly**: Optimized for printing

**Customization:**
- **Branding Options**: Add logos and custom styling
- **Metric Selection**: Choose which metrics to include
- **Chart Integration**: Include performance charts
- **Comparison Mode**: Compare periods side-by-side

### 8. Spending Tracker (/spending)
**File: `client/src/pages/spending.tsx`**

**Prompt:**
Build prop account spending management:

**Expense Tracking:**
- **Account Costs**: Initial account purchase costs
- **Monthly Fees**: Subscription and maintenance fees
- **Reset Costs**: Account reset expenses
- **Activation Fees**: Fees for passing to funded accounts
- **Other Costs**: Miscellaneous trading-related expenses

**Budget Planning:**
- **Monthly Budgets**: Set spending limits by category
- **ROI Tracking**: Calculate return on investment
- **Break-even Analysis**: Time to profitability calculations
- **Cost Categories**: Organized expense categorization

**Financial Analytics:**
- **Spending Trends**: Monthly/yearly spending analysis
- **Cost vs. Performance**: Correlation between costs and returns
- **Budget Alerts**: Notifications when approaching limits
- **Tax Reporting**: Export for tax purposes

### 9. Trading Companion (/trading-companion)
**File: `client/src/pages/trading-companion.tsx`**

**Prompt:**
Create AI-powered trading assistant:

**AI Features:**
- **Trade Analysis**: AI analysis of trading patterns
- **Strategy Suggestions**: Personalized strategy recommendations
- **Risk Alerts**: AI-powered risk warnings
- **Performance Insights**: AI-generated performance analysis
- **Market Commentary**: Real-time market insights

**Chat Interface:**
- **Interactive Chat**: Natural language trading discussions
- **Voice Commands**: Voice-to-text trading queries
- **Context Awareness**: Chat understands your trading history
- **Learning System**: Improves with usage

**Integration:**
- Connect to OpenAI or similar AI service
- Real-time data integration
- Personalized recommendations based on trading history

### 10. Daily Plan (/daily-plan)
**File: `client/src/pages/daily-plan.tsx`**

**Prompt:**
Build comprehensive daily trading planner:

**Planning Features:**
- **Pre-market Analysis**: Market preparation and bias
- **Strategy Selection**: Choose trading strategies for the day
- **Risk Parameters**: Set daily risk limits and position sizes
- **Target Setting**: Profit targets and stop loss levels
- **Market Events**: Economic calendar integration

**Live Tracking:**
- **Real-time P&L**: Live tracking during trading session
- **Trade Execution**: Quick trade entry during session
- **Risk Monitoring**: Live risk usage tracking
- **Performance Updates**: Real-time performance metrics

**Post-session Review:**
- **Journal Entry**: End-of-day reflection
- **Goal Achievement**: Review target completion
- **Lesson Learned**: Key takeaways from the session
- **Next Day Preparation**: Planning for tomorrow

## Supporting Pages

### Profile Management (/profile)
- User settings and preferences
- Subscription management
- Account security settings
- Notification preferences

### Billing (/billing)
- Subscription status and history
- Payment method management
- Billing history and invoices
- Plan upgrade/downgrade options

### Support (/support)
- Help documentation
- Contact forms
- FAQ section
- Video tutorials

### Settings Pages
- Application preferences
- Trading preferences
- Notification settings
- Data export/import

Each page should follow the established design system with:
- Dark theme with gold accents
- Consistent card layouts
- Responsive design
- Loading states and error handling
- Proper form validation
- Real-time data updates where appropriate
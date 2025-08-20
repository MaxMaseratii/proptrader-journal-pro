# Backend API Implementation Prompts

## Authentication System

### 1. Authentication Routes (`server/authRoutes.ts`)

**Prompt:**
Create a complete authentication system with the following endpoints:

**POST /api/auth/signup**
- Validate user input (email, name, password)
- Check for existing users
- Hash passwords with bcrypt (12 salt rounds)
- Generate email verification tokens
- Handle Stripe customer creation for paid plans
- Send verification emails
- Store user in database with pending verification

**POST /api/auth/login**
- Validate credentials
- Check email verification status
- Create secure sessions
- Return user data (excluding sensitive fields)
- Handle session persistence

**GET /api/auth/verify-email?token=**
- Validate verification tokens
- Update user verification status
- Handle expired/invalid tokens
- Redirect to login page on success

**POST /api/auth/logout**
- Destroy user sessions
- Clear session cookies
- Return success confirmation

**GET /api/auth/user**
- Return current authenticated user
- Exclude sensitive data (password, tokens)
- Handle unauthenticated requests

**Security Features:**
- Session-based authentication with PostgreSQL storage
- bcrypt password hashing with 12 salt rounds
- CSRF protection
- Rate limiting on auth endpoints
- Secure session cookies (httpOnly, secure, sameSite)

### 2. Core API Routes (`server/routes.ts`)

**Prompt:**
Build comprehensive API routes for the trading journal application:

## Account Management Routes

**GET /api/accounts**
- Fetch all accounts for authenticated user
- Include calculated current balance (starting balance + total P&L)
- Support filtering by account type
- Return account status and risk metrics

**POST /api/accounts**
- Create new trading accounts
- Validate required fields (name, type, firm, balances, risk rules)
- Support prop firm templates with pre-configured settings
- Generate unique CSV account IDs for import validation

**PUT /api/accounts/:id**
- Update account settings and risk parameters
- Validate risk rule changes
- Update account status (active, passed, failed)
- Handle account transitions (challenge -> funded -> live)

**DELETE /api/accounts/:id**
- Soft delete accounts (mark as archived)
- Prevent deletion of accounts with trades
- Handle cascade rules for related data

## Trade Management Routes

**GET /api/trades**
- Fetch trades with filtering (account, date range, symbol)
- Include P&L calculations and risk metrics
- Support pagination for large datasets
- Calculate aggregate statistics

**POST /api/trades**
- Create individual trades manually
- Validate trade data (symbol, quantity, prices, dates)
- Automatic P&L calculation
- Risk compliance checking
- Integration with journal entries

**PUT /api/trades/:id**
- Update existing trades
- Recalculate affected statistics
- Validate trade modifications
- Audit trail for changes

**DELETE /api/trades/:id**
- Delete trades with confirmation
- Update account statistics
- Handle impact on daily stats

## CSV Import Routes

**POST /api/csv-import/upload**
- Handle file upload (multipart/form-data)
- Validate file format and size
- Store temporary files securely
- Return upload confirmation with file ID

**POST /api/csv-import/analyze**
- Analyze uploaded CSV structure
- Detect broker/platform automatically
- Map columns to trade fields
- Return preview data with mapping suggestions

**POST /api/csv-import/process**
- Process CSV with confirmed mapping
- Validate trade data
- Handle duplicate detection
- Batch insert trades efficiently
- Return import summary (success/error counts)

**GET /api/csv-import/history**
- Fetch import history for user
- Include file names, dates, record counts
- Show import status and error logs

## Journal Routes

**GET /api/journal-entries**
- Fetch journal entries by date range
- Filter by account
- Include linked daily plans
- Support full-text search

**POST /api/journal-entries**
- Create daily journal entries
- Link to specific accounts and daily plans
- Handle image attachments
- Auto-generate entry IDs

**PUT /api/journal-entries/:id**
- Update existing entries
- Maintain edit history
- Handle image updates
- Version control for changes

## Analytics Routes

**GET /api/analytics/performance**
- Calculate performance metrics (win rate, profit factor, Sharpe ratio)
- Support date range filtering
- Include drawdown analysis
- Return equity curve data

**GET /api/analytics/risk**
- Risk metrics and compliance tracking
- Daily risk usage vs. limits
- Historical risk violations
- Risk scoring algorithms

**GET /api/analytics/monthly**
- Monthly performance breakdowns
- Calendar heatmap data
- Month-over-month comparisons
- Seasonal analysis

## Spending Management Routes

**GET /api/spending**
- Fetch spending records by category
- Calculate monthly budgets and usage
- Include ROI calculations
- Support expense categorization

**POST /api/spending**
- Record new expenses
- Categorize automatically
- Budget impact calculations
- Receipt/documentation storage

## Daily Plans Routes

**GET /api/daily-plans**
- Fetch daily trading plans
- Include strategy assignments
- Show completion status
- Link to journal entries

**POST /api/daily-plans**
- Create daily trading plans
- Set targets and risk parameters
- Strategy selection and rules
- Market bias and preparation notes

## Real-time Data Routes

**GET /api/dashboard/summary**
- Real-time dashboard data
- Current account balances
- Today's P&L across all accounts
- Risk usage and alerts
- Quick statistics

**GET /api/notifications**
- User notifications and alerts
- Risk violations and achievements
- System announcements
- Trading reminders

## Reports Routes

**GET /api/reports/daily**
- Generate daily performance reports
- Include all relevant metrics
- Support multiple output formats

**GET /api/reports/monthly**
- Comprehensive monthly analysis
- Performance comparisons
- Goal achievement tracking

**POST /api/reports/custom**
- Generate custom reports with date ranges
- User-selected metrics
- Export in PDF/Excel formats

## Middleware and Security

**Authentication Middleware:**
```typescript
const requireAuth = (req: any, res: any, next: any) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Authentication required" });
  }
  next();
};
```

**Rate Limiting:**
- General API: 1000 requests per 15 minutes
- Auth endpoints: 100 requests per 15 minutes
- CSV import: 10 uploads per hour
- AI/LLM endpoints: 10 requests per minute

**Validation Middleware:**
- Use Zod schemas for request validation
- Sanitize input data
- Handle validation errors gracefully
- Return descriptive error messages

**Error Handling:**
- Centralized error handling middleware
- Structured error responses
- Logging for debugging
- User-friendly error messages

## Database Integration

**Connection Management:**
- PostgreSQL connection pooling
- Automated reconnection handling
- Transaction management for data consistency
- Query optimization with proper indexing

**Data Access Patterns:**
- Use Drizzle ORM for type-safe queries
- Implement caching for frequently accessed data
- Batch operations for performance
- Proper relationship handling

**Performance Optimization:**
- Database indexes on frequently queried columns
- Query result caching with Redis (development fallback)
- Pagination for large datasets
- Efficient aggregate calculations

## Integration Features

**Email System:**
- SMTP configuration for verification emails
- Template-based email generation
- Delivery status tracking
- Fallback mechanisms

**Stripe Integration:**
- Customer creation and management
- Subscription handling
- Webhook processing for payment events
- Invoice generation

**File Storage:**
- Secure file upload handling
- Image processing for trade screenshots
- CSV temporary storage
- Document management

Each route should include:
- Proper error handling and status codes
- Request/response validation
- Authentication checks where required
- Performance optimization
- Comprehensive logging
- API documentation
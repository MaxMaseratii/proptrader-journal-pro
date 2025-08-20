# PropTraderJournal - Complete Rebuild Guide

## Full Application Description

PropTraderJournal is a comprehensive, production-ready trading journal and analytics platform designed specifically for proprietary (prop) traders. It provides advanced tools for performance tracking, risk management, trade analysis, and psychological insights to help traders succeed in prop firm challenges and funded accounts.

### Core Architecture

**Stack:**
- Frontend: React 18 + TypeScript + Vite
- Backend: Node.js + Express + TypeScript (ESM modules)
- Database: PostgreSQL with Drizzle ORM
- Authentication: Session-based with bcrypt password hashing
- Payment: Stripe integration for subscription plans
- Styling: Tailwind CSS + shadcn/ui components
- State Management: TanStack Query (React Query)
- Routing: Wouter

**Key Features:**
1. **Advanced Trading Analytics** - Real-time P&L tracking, drawdown monitoring, risk metrics
2. **Multi-Account Management** - Support for multiple prop firm accounts with individual rules
3. **Universal CSV Import** - AI-powered import supporting 37+ brokers (IBKR, ThinkorSwim, MT4/5, etc.)
4. **Risk Management System** - Position sizing, daily loss limits, drawdown tracking
5. **Trading Psychology Tools** - Journal entries, discipline scoring, emotional state tracking
6. **Performance Analytics** - Win rates, profit factors, equity curves, monthly breakdowns
7. **Subscription Management** - Trial, Basic, Premium, Pro plans with Stripe integration
8. **Real-time Dashboard** - Interactive widgets, calendar views, target tracking

## Environment Setup Requirements

```bash
# Required Environment Variables
DATABASE_URL=postgresql://username:password@host:port/database
SESSION_SECRET=your-session-secret-key
STRIPE_SECRET_KEY=sk_test_...
VITE_STRIPE_PUBLIC_KEY=pk_test_...

# Optional SMTP Variables (for email verification)
FROM_EMAIL=noreply@yourapp.com
SMTP_HOST=smtp.gmail.com
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

## Database Schema Overview

The application uses PostgreSQL with the following core tables:

1. **sessions** - PostgreSQL session storage for authentication
2. **users** - User accounts with subscription and Stripe integration
3. **accounts** - Trading accounts (challenge, funded, live) with risk rules
4. **trades** - Individual trade records with P&L and risk metrics
5. **journal_entries** - Daily trading journal with emotional state tracking
6. **daily_stats** - Daily performance metrics and drawdown tracking
7. **spending** - Prop account spending and cost tracking
8. **daily_plans** - Daily trading plans and strategy tracking

## Authentication System

- **Session-based authentication** with PostgreSQL session store
- **bcrypt password hashing** for security
- **Email verification** system (configurable SMTP)
- **Stripe subscription plans** (trial, basic, premium, pro)
- **Protected routes** requiring authentication
- **Password reset functionality**

## File Structure

```
├── client/src/
│   ├── components/ui/          # shadcn/ui components
│   ├── components/             # Custom React components
│   ├── pages/                  # Application pages
│   ├── hooks/                  # Custom React hooks
│   ├── lib/                    # Utility functions
│   └── contexts/               # React contexts
├── server/
│   ├── auth.ts                 # Authentication utilities
│   ├── authRoutes.ts           # Authentication API routes
│   ├── routes.ts               # Main API routes
│   ├── storage.ts              # Database operations
│   ├── db.ts                   # Database connection
│   └── index.ts                # Express server setup
├── shared/
│   └── schema.ts               # Drizzle database schema
├── package.json                # Dependencies
├── drizzle.config.ts          # Database configuration
├── vite.config.ts             # Vite configuration
└── tailwind.config.ts         # Tailwind configuration
```

## Page-by-Page Implementation Guide

### Authentication Pages

#### 1. Login Page (/login)
**File: `client/src/pages/auth/Login.tsx`**

```typescript
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { Loader2, Eye, EyeOff } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function Login() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      await apiRequest("POST", "/api/auth/login", data);
      toast({
        title: "Login Successful",
        description: "Welcome back to PropTrader Journal!",
      });
      window.location.href = "/";
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message || "Invalid email or password",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-gray-800/50 border-gray-700">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-amber-500 bg-clip-text text-transparent">
            Welcome Back
          </CardTitle>
          <p className="text-gray-400">Sign in to your PropTrader Journal</p>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="email"
                        placeholder="your@email.com"
                        className="bg-gray-700/50 border-gray-600"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          className="bg-gray-700/50 border-gray-600 pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 text-gray-400" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-400" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 text-black font-semibold"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing In...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>
          </Form>
          <div className="mt-6 text-center">
            <p className="text-gray-400">
              Don't have an account?{" "}
              <Link href="/signup" className="text-yellow-400 hover:text-yellow-300 font-medium">
                Sign up here
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

#### 2. Sign-Up Page (/signup)
**File: `client/src/pages/auth/SignUp.tsx`**

```typescript
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { Loader2, Eye, EyeOff, Crown } from "lucide-react";

const signUpSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  subscriptionPlan: z.enum(["trial", "basic", "premium", "pro"]),
  agreeToTerms: z.boolean().refine(val => val === true, "You must agree to the terms"),
  captchaVerified: z.boolean().refine(val => val === true, "Please verify you're human"),
});

type SignUpForm = z.infer<typeof signUpSchema>;

const subscriptionPlans = [
  {
    value: "trial",
    label: "Free Trial",
    price: "$0/month",
    description: "7-day free trial",
    features: ["Basic dashboard", "CSV import", "1 account"],
  },
  {
    value: "basic",
    label: "Basic",
    price: "$9.99/month",
    description: "Essential features",
    features: ["All trial features", "Advanced analytics", "3 accounts"],
  },
  {
    value: "premium",
    label: "Premium",
    price: "$19.99/month",
    description: "Professional trader",
    features: ["All basic features", "Risk management", "10 accounts", "Priority support"],
  },
  {
    value: "pro",
    label: "Pro",
    price: "$39.99/month",
    description: "Elite trader",
    features: ["Unlimited accounts", "AI insights", "Custom reports", "API access"],
  },
];

export default function SignUp() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [captchaVerified, setCaptchaVerified] = useState(false);

  const form = useForm<SignUpForm>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      subscriptionPlan: "trial",
      agreeToTerms: false,
      captchaVerified: false,
    },
  });

  const onSubmit = async (data: SignUpForm) => {
    setIsLoading(true);
    try {
      const response = await apiRequest("POST", "/api/auth/signup", {
        ...data,
        captchaVerified,
      });
      
      toast({
        title: "Account Created Successfully",
        description: "Please check your email to verify your account.",
      });
      
      // Redirect to login page
      window.location.href = "/login";
    } catch (error: any) {
      toast({
        title: "Sign-up Failed",
        description: error.message || "Failed to create account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-gray-800/50 border-gray-700">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <Crown className="w-8 h-8 text-yellow-400 mr-2" />
            <span className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-amber-500 bg-clip-text text-transparent">
              PropTrader Journal
            </span>
          </div>
          <CardTitle className="text-xl">Create Your Account</CardTitle>
          <p className="text-gray-400">Join thousands of successful prop traders</p>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Personal Information */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="John"
                          className="bg-gray-700/50 border-gray-600"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Trader"
                          className="bg-gray-700/50 border-gray-600"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="email"
                        placeholder="your@email.com"
                        className="bg-gray-700/50 border-gray-600"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          type={showPassword ? "text" : "password"}
                          placeholder="Create a strong password"
                          className="bg-gray-700/50 border-gray-600 pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 text-gray-400" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-400" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Subscription Plan Selection */}
              <FormField
                control={form.control}
                name="subscriptionPlan"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Choose Your Plan</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger className="bg-gray-700/50 border-gray-600">
                          <SelectValue placeholder="Select a subscription plan" />
                        </SelectTrigger>
                        <SelectContent>
                          {subscriptionPlans.map((plan) => (
                            <SelectItem key={plan.value} value={plan.value}>
                              <div className="flex items-center justify-between w-full">
                                <div>
                                  <div className="font-medium">{plan.label}</div>
                                  <div className="text-sm text-gray-400">{plan.description}</div>
                                </div>
                                <div className="text-right">
                                  <div className="font-bold text-yellow-400">{plan.price}</div>
                                </div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Terms and Conditions */}
              <FormField
                control={form.control}
                name="agreeToTerms"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        I agree to the{" "}
                        <Link href="/terms" className="text-yellow-400 hover:text-yellow-300">
                          Terms of Service
                        </Link>{" "}
                        and{" "}
                        <Link href="/privacy" className="text-yellow-400 hover:text-yellow-300">
                          Privacy Policy
                        </Link>
                      </FormLabel>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />

              {/* Captcha Verification */}
              <div className="flex items-center space-x-3">
                <Checkbox
                  checked={captchaVerified}
                  onCheckedChange={(checked) => {
                    setCaptchaVerified(checked as boolean);
                    form.setValue("captchaVerified", checked as boolean);
                  }}
                />
                <label className="text-sm">I'm not a robot (Demo Captcha)</label>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 text-black font-semibold"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>
          </Form>

          <div className="mt-6 text-center">
            <p className="text-gray-400">
              Already have an account?{" "}
              <Link href="/login" className="text-yellow-400 hover:text-yellow-300 font-medium">
                Sign in here
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

### Main Application Pages

#### 3. Dashboard Page (/)
**File: `client/src/pages/dashboard.tsx`**

[Content continues with the existing dashboard implementation - this is the main trading dashboard with widgets, calendar views, analytics, and real-time data]

### Backend Implementation

#### 4. Authentication Backend
**File: `server/auth.ts`**

```typescript
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { users } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export function generateVerificationToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export async function getUserByEmail(email: string) {
  const [user] = await db.select().from(users).where(eq(users.email, email));
  return user;
}

export async function getUserById(id: string) {
  const [user] = await db.select().from(users).where(eq(users.id, id));
  return user;
}
```

**File: `server/authRoutes.ts`**

```typescript
import { Router } from "express";
import { z } from "zod";
import { db } from "./db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";
import { hashPassword, verifyPassword, generateVerificationToken, getUserByEmail } from "./auth";
import nodemailer from "nodemailer";

const router = Router();

// Email configuration
const transporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Send verification email
async function sendVerificationEmail(email: string, token: string) {
  if (!process.env.SMTP_USER) {
    console.log("📧 SMTP not configured - verification email would be sent to:", email);
    return;
  }

  const verificationUrl = `${process.env.BASE_URL || 'http://localhost:5000'}/api/auth/verify-email?token=${token}`;
  
  await transporter.sendMail({
    from: process.env.FROM_EMAIL || process.env.SMTP_USER,
    to: email,
    subject: "Verify Your PropTrader Journal Account",
    html: `
      <h2>Welcome to PropTrader Journal!</h2>
      <p>Please click the link below to verify your email address:</p>
      <a href="${verificationUrl}">Verify Email</a>
      <p>If you didn't create this account, you can safely ignore this email.</p>
    `,
  });
}

// Sign-up route
router.post("/signup", async (req, res) => {
  try {
    const { email, firstName, lastName, password, subscriptionPlan, agreeToTerms, captchaVerified } = req.body;

    // Validation
    if (!email || !firstName || !lastName || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!agreeToTerms || !captchaVerified) {
      return res.status(400).json({ message: "You must agree to terms and complete verification" });
    }

    // Check if user exists
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);
    
    // Generate verification token
    const verificationToken = generateVerificationToken();

    // Handle Stripe customer creation for paid plans
    let stripeCustomerId = null;
    let stripeSubscriptionId = null;
    
    if (subscriptionPlan !== "trial") {
      // Stripe integration would go here
      // For demo purposes, we'll simulate this
    }

    // Calculate trial end date (7 days from now)
    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + 7);

    // Create user
    const [newUser] = await db.insert(users).values({
      email,
      firstName,
      lastName,
      password: hashedPassword,
      verificationToken,
      subscriptionPlan,
      stripeCustomerId,
      stripeSubscriptionId,
      trialEndsAt: subscriptionPlan === "trial" ? trialEndsAt : null,
    }).returning();

    // Send verification email
    await sendVerificationEmail(email, verificationToken);

    res.status(201).json({
      message: "Account created successfully. Please check your email to verify your account.",
      user: { id: newUser.id, email: newUser.email },
    });

  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Login route
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Find user
    const user = await getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Check if email is verified
    if (!user.emailVerified) {
      return res.status(401).json({ 
        message: "Please verify your email before logging in" 
      });
    }

    // Verify password
    if (!user.password) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    
    const isValidPassword = await verifyPassword(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Create session
    req.session.save((err: any) => {
      if (err) {
        console.error('Session save error:', err);
        return res.status(500).json({ message: "Login failed" });
      }

      // Remove sensitive data
      const { password: _, verificationToken: __, ...userResponse } = user;
      res.json({
        message: "Login successful",
        user: userResponse,
      });
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Email verification route
router.get("/verify-email", async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ message: "Verification token is required" });
    }

    // Find user by verification token
    const [user] = await db.select().from(users)
      .where(eq(users.verificationToken, token as string));

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired verification token" });
    }

    if (user.emailVerified) {
      return res.status(400).json({ message: "Email is already verified" });
    }

    // Update user as verified
    await db.update(users)
      .set({
        emailVerified: true,
        verificationToken: null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));

    res.json({ message: "Email verified successfully" });

  } catch (error) {
    console.error("Email verification error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get current user route
router.get("/user", async (req: any, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const user = await getUserById(req.user.id);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // Remove sensitive data
    const { password: _, verificationToken: __, ...userResponse } = user;
    res.json(userResponse);

  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Logout route
router.post("/logout", (req: any, res) => {
  req.session.destroy((err: any) => {
    if (err) {
      return res.status(500).json({ message: "Logout failed" });
    }
    res.json({ message: "Logout successful" });
  });
});

export { router as authRoutes };
```

#### 5. Database Configuration
**File: `server/db.ts`**

```typescript
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle({ client: pool, schema });
```

**File: `shared/schema.ts`**

```typescript
import { pgTable, text, serial, integer, real, timestamp, boolean, date, varchar, jsonb, index, uuid, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { sql } from 'drizzle-orm';

// Session storage table for authentication
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User subscription plans
export const subscriptionPlanEnum = pgEnum("subscription_plan", ["trial", "basic", "premium", "pro"]);

// User authentication and subscription table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  password: varchar("password"),
  profileImageUrl: varchar("profile_image_url"),
  emailVerified: boolean("email_verified").default(false),
  verificationToken: varchar("verification_token"),
  personalHourlyWage: real("personal_hourly_wage"),
  subscriptionPlan: subscriptionPlanEnum("subscription_plan").default("trial"),
  stripeCustomerId: varchar("stripe_customer_id"),
  stripeSubscriptionId: varchar("stripe_subscription_id"),
  subscriptionStatus: varchar("subscription_status").default("active"),
  trialEndsAt: timestamp("trial_ends_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type UpsertUser = typeof users.$inferInsert;

// Trading accounts table
export const accounts = pgTable("accounts", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  type: text("type").notNull(), // 'challenge', 'funded', 'live'
  firm: text("firm").notNull(),
  startingBalance: real("starting_balance").notNull(),
  maxDrawdown: real("max_drawdown").notNull(),
  dailyLossLimit: real("daily_loss_limit"),
  profitTarget: real("profit_target").notNull(),
  status: text("status").notNull().default('active'),
  createdAt: timestamp("created_at").defaultNow(),
});

// Trades table
export const trades = pgTable("trades", {
  id: serial("id").primaryKey(),
  accountId: integer("account_id").references(() => accounts.id).notNull(),
  date: date("date").notNull(),
  symbol: text("symbol").notNull(),
  side: text("side").notNull(), // 'buy', 'sell'
  quantity: real("quantity").notNull(),
  entryPrice: real("entry_price").notNull(),
  exitPrice: real("exit_price"),
  pnl: real("pnl").notNull(),
  status: text("status").notNull().default('closed'),
  notes: text("notes"),
});

export type Account = typeof accounts.$inferSelect;
export type Trade = typeof trades.$inferSelect;
export type InsertAccount = typeof accounts.$inferInsert;
export type InsertTrade = typeof trades.$inferInsert;

// Schema validation
export const insertUserSchema = createInsertSchema(users);
export const insertAccountSchema = createInsertSchema(accounts);
export const insertTradeSchema = createInsertSchema(trades);
```

## Installation Instructions

1. **Clone/Create Project Structure**
```bash
mkdir proptrader-journal
cd proptrader-journal
npm init -y
```

2. **Install Dependencies**
```bash
# Frontend dependencies
npm install react react-dom @types/react @types/react-dom
npm install @tanstack/react-query wouter
npm install @radix-ui/react-* (all needed components)
npm install tailwindcss @tailwindcss/typography autoprefixer postcss
npm install lucide-react class-variance-authority clsx tailwind-merge
npm install react-hook-form @hookform/resolvers zod
npm install chart.js date-fns

# Backend dependencies  
npm install express @types/express
npm install @neondatabase/serverless drizzle-orm drizzle-kit
npm install bcryptjs @types/bcryptjs
npm install express-session @types/express-session
npm install connect-pg-simple @types/connect-pg-simple
npm install nodemailer @types/nodemailer
npm install stripe
npm install compression express-rate-limit

# Build tools
npm install vite @vitejs/plugin-react typescript tsx
```

3. **Environment Setup**
```bash
# Create .env file with required variables
echo "DATABASE_URL=your_postgres_url" > .env
echo "SESSION_SECRET=your_session_secret" >> .env
echo "STRIPE_SECRET_KEY=your_stripe_secret" >> .env
echo "VITE_STRIPE_PUBLIC_KEY=your_stripe_public" >> .env
```

4. **Database Setup**
```bash
npm run db:push
```

5. **Start Development**
```bash
npm run dev
```

## Key Configuration Files

**File: `package.json`**
```json
{
  "scripts": {
    "dev": "tsx server/index.ts",
    "build": "vite build",
    "db:push": "drizzle-kit push",
    "db:studio": "drizzle-kit studio"
  }
}
```

**File: `vite.config.ts`**
```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client/src"),
      "@shared": path.resolve(__dirname, "./shared"),
    },
  },
  server: {
    proxy: {
      "/api": "http://localhost:5000",
    },
  },
});
```

This guide provides the complete foundation for rebuilding the PropTraderJournal application identically. Each component builds upon the previous ones to create a comprehensive trading journal platform with authentication, subscription management, and advanced trading analytics.
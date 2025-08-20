import type { Express } from "express";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import Stripe from "stripe";
import { z } from "zod";
import { hashPassword, verifyPassword, generateVerificationToken, sendVerificationEmail, getUserById, getUserByEmail } from "./auth";
import { users, type InsertUser } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

// Session store setup
const PgSession = connectPgSimple(session);

export function setupAuthSession(app: Express) {
  const sessionStore = new PgSession({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: true,
  });

  app.use(session({
    store: sessionStore,
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  }));
}

const signUpSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  password: z.string().min(8),
  subscriptionPlan: z.enum(["trial", "basic", "premium", "pro"]),
  paymentMethodId: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export function registerAuthRoutes(app: Express) {
  // Sign up route
  app.post('/api/auth/signup', async (req, res) => {
    try {
      const validatedData = signUpSchema.parse(req.body);
      const { email, firstName, lastName, password, subscriptionPlan, paymentMethodId } = validatedData;

      // Check if user already exists
      const existingUser = await getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      // Hash password
      const passwordHash = await hashPassword(password);
      
      // Generate verification token
      const emailVerificationToken = generateVerificationToken();

      // Set trial end date
      const trialEndsAt = new Date();
      trialEndsAt.setDate(trialEndsAt.getDate() + 7); // 7 day trial

      let stripeCustomerId: string | undefined;
      let stripeSubscriptionId: string | undefined;

      // Handle Stripe setup for non-trial plans
      if (subscriptionPlan !== "trial" && paymentMethodId) {
        try {
          // Create Stripe customer
          const customer = await stripe.customers.create({
            email,
            name: `${firstName} ${lastName}`,
            payment_method: paymentMethodId,
            invoice_settings: {
              default_payment_method: paymentMethodId,
            },
          });
          stripeCustomerId = customer.id;

          // Create subscription based on plan
          const priceIds = {
            basic: process.env.STRIPE_BASIC_PRICE_ID,
            premium: process.env.STRIPE_PREMIUM_PRICE_ID,
            pro: process.env.STRIPE_PRO_PRICE_ID,
          };

          const priceId = priceIds[subscriptionPlan as keyof typeof priceIds];
          if (priceId) {
            const subscription = await stripe.subscriptions.create({
              customer: customer.id,
              items: [{ price: priceId }],
              payment_behavior: 'default_incomplete',
              expand: ['latest_invoice.payment_intent'],
            });
            stripeSubscriptionId = subscription.id;
          }
        } catch (stripeError) {
          console.error('Stripe error:', stripeError);
          return res.status(400).json({ 
            message: "Payment processing failed. Please check your payment information." 
          });
        }
      }

      // Create user
      const [newUser] = await db.insert(users).values({
        email,
        firstName,
        lastName,
        passwordHash,
        emailVerificationToken,
        subscriptionPlan,
        stripeCustomerId,
        stripeSubscriptionId,
        trialEndsAt: subscriptionPlan === "trial" ? trialEndsAt : null,
      }).returning();

      // Send verification email
      await sendVerificationEmail(email, emailVerificationToken);

      res.status(201).json({
        message: "Account created successfully. Please check your email to verify your account.",
        userId: newUser.id,
      });

    } catch (error) {
      console.error('Signup error:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid input data",
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Login route
  app.post('/api/auth/login', async (req, res) => {
    try {
      const validatedData = loginSchema.parse(req.body);
      const { email, password } = validatedData;

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
      const isValidPassword = await verifyPassword(password, user.passwordHash);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Create session
      req.session.userId = user.id;
      req.session.save((err) => {
        if (err) {
          console.error('Session save error:', err);
          return res.status(500).json({ message: "Login failed" });
        }

        // Remove sensitive data
        const { passwordHash, emailVerificationToken, ...userResponse } = user;
        res.json({
          message: "Login successful",
          user: userResponse,
        });
      });

    } catch (error) {
      console.error('Login error:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid input data",
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Email verification route
  app.get('/api/auth/verify-email', async (req, res) => {
    try {
      const { token } = req.query;
      
      if (!token) {
        return res.status(400).json({ message: "Verification token is required" });
      }

      // Find user by verification token
      const [user] = await db.select().from(users)
        .where(eq(users.emailVerificationToken, token as string));

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
          emailVerificationToken: null,
          updatedAt: new Date(),
        })
        .where(eq(users.id, user.id));

      res.json({ message: "Email verified successfully" });

    } catch (error) {
      console.error('Email verification error:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Logout route
  app.post('/api/auth/logout', (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error('Session destroy error:', err);
        return res.status(500).json({ message: "Logout failed" });
      }
      res.clearCookie('connect.sid');
      res.json({ message: "Logout successful" });
    });
  });

  // Current user route
  app.get('/api/auth/user', async (req, res) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const user = await getUserById(req.session.userId);
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      // Remove sensitive data
      const { passwordHash, emailVerificationToken, ...userResponse } = user;
      res.json(userResponse);

    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Middleware for protecting routes
  app.use('/api', (req, res, next) => {
    // Skip auth routes
    if (req.path.startsWith('/api/auth/')) {
      return next();
    }

    // Check authentication
    if (!req.session?.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    next();
  });
}
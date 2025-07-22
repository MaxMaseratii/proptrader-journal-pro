import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as GitHubStrategy } from "passport-github2";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";
import connectPg from "connect-pg-simple";
import nodemailer from "nodemailer";
import crypto from "crypto";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

// Email service setup
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function sendVerificationEmail(email: string, token: string) {
  const verificationUrl = `${process.env.BASE_URL}/api/auth/verify-email?token=${token}`;
  
  await transporter.sendMail({
    from: process.env.SMTP_FROM || "noreply@proptraderjournal.com",
    to: email,
    subject: "Verify Your PropTraderJournal Account",
    html: `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <div style="background: linear-gradient(135deg, #1f2937 0%, #000000 100%); padding: 30px; border-radius: 10px; text-align: center;">
          <h1 style="color: #fbbf24; margin-bottom: 20px;">Welcome to PropTraderJournal!</h1>
          <p style="color: #d1d5db; font-size: 16px; margin-bottom: 30px;">
            Thank you for joining thousands of successful prop traders. Please verify your email address to get started.
          </p>
          <a href="${verificationUrl}" style="display: inline-block; background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); color: #000; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">
            Verify Email Address
          </a>
          <p style="color: #9ca3af; font-size: 14px; margin-top: 30px;">
            If you didn't create this account, you can safely ignore this email.
          </p>
        </div>
      </div>
    `,
  });
}

export function setupAuth(app: Express) {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: true,
    ttl: sessionTtl,
    tableName: "sessions",
  });

  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: sessionTtl,
      sameSite: 'lax',
    },
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  // Local Strategy (Email/Password)
  passport.use(
    new LocalStrategy(
      { usernameField: "email" },
      async (email, password, done) => {
        try {
          const user = await storage.getUserByEmail(email);
          if (!user || !(await comparePasswords(password, user.password))) {
            return done(null, false, { message: "Invalid email or password" });
          }
          // Skip email verification check for production launch
          // if (!user.emailVerified) {
          //   return done(null, false, { message: "Please verify your email address" });
          // }
          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  // Google OAuth Strategy
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(
      new GoogleStrategy(
        {
          clientID: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          callbackURL: "/api/auth/oauth/google/callback",
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            let user = await storage.getUserByEmail(profile.emails?.[0]?.value || "");
            
            if (!user) {
              user = await storage.createUser({
                email: profile.emails?.[0]?.value || "",
                firstName: profile.name?.givenName || "",
                lastName: profile.name?.familyName || "",
                password: "", // OAuth users don't need password
                emailVerified: true, // OAuth emails are pre-verified
                profileImageUrl: profile.photos?.[0]?.value,
              });
            }
            
            return done(null, user);
          } catch (error) {
            return done(error);
          }
        }
      )
    );
  }

  // GitHub OAuth Strategy
  if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
    passport.use(
      new GitHubStrategy(
        {
          clientID: process.env.GITHUB_CLIENT_ID,
          clientSecret: process.env.GITHUB_CLIENT_SECRET,
          callbackURL: "/api/auth/oauth/github/callback",
        },
        async (accessToken: string, refreshToken: string, profile: any, done: any) => {
          try {
            let user = await storage.getUserByEmail(profile.emails?.[0]?.value || "");
            
            if (!user) {
              user = await storage.createUser({
                email: profile.emails?.[0]?.value || "",
                firstName: profile.displayName?.split(" ")[0] || "",
                lastName: profile.displayName?.split(" ")[1] || "",
                password: "", // OAuth users don't need password
                emailVerified: true, // OAuth emails are pre-verified
                profileImageUrl: profile.photos?.[0]?.value,
              });
            }
            
            return done(null, user);
          } catch (error) {
            return done(error);
          }
        }
      )
    );
  }

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await storage.getUserById(id);
      if (user) {
        done(null, user);
      } else {
        done(null, false);
      }
    } catch (error) {
      console.error('Failed to deserialize user:', error);
      done(null, false);
    }
  });

  // Registration endpoint
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { firstName, lastName, email, password } = req.body;
      
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "Email already registered" });
      }

      const hashedPassword = await hashPassword(password);
      
      const user = await storage.createUser({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        emailVerified: true,
        verificationToken: null,
      });

      // Auto-login after registration
      req.login(user, (err) => {
        if (err) {
          console.error("Auto-login error:", err);
          return res.status(500).json({ message: "Registration successful but login failed" });
        }
        res.status(201).json({ 
          message: "Account created successfully",
          user: { id: user.id, email: user.email, firstName: user.firstName }
        });
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Failed to create account" });
    }
  });

  // Login endpoint
  app.post("/api/auth/login", (req, res, next) => {
    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) return next(err);
      if (!user) {
        return res.status(401).json({ message: info?.message || "Invalid credentials" });
      }
      
      req.logIn(user, (err) => {
        if (err) return next(err);
        res.json({ user: { id: user.id, email: user.email, firstName: user.firstName } });
      });
    })(req, res, next);
  });

  // Email verification endpoint
  app.get("/api/auth/verify-email", async (req, res) => {
    try {
      const { token } = req.query;
      const user = await storage.verifyEmail(token as string);
      
      if (!user) {
        return res.status(400).send("Invalid or expired verification token");
      }
      
      res.redirect("/?verified=true");
    } catch (error) {
      res.status(500).send("Email verification failed");
    }
  });

  // OAuth routes
  app.get("/api/auth/oauth/google", passport.authenticate("google", { scope: ["profile", "email"] }));
  app.get("/api/auth/oauth/google/callback", 
    passport.authenticate("google", { failureRedirect: "/auth" }),
    (req, res) => res.redirect("/")
  );

  app.get("/api/auth/oauth/github", passport.authenticate("github", { scope: ["user:email"] }));
  app.get("/api/auth/oauth/github/callback",
    passport.authenticate("github", { failureRedirect: "/auth" }),
    (req, res) => res.redirect("/")
  );

  // Apple OAuth placeholder (requires more complex setup)
  app.get("/api/auth/oauth/apple", (req, res) => {
    res.status(501).json({ message: "Apple OAuth coming soon" });
  });

  // Logout endpoint
  app.post("/api/auth/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.json({ message: "Logged out successfully" });
    });
  });

  // Get current user
  app.get("/api/auth/user", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    res.json(req.user);
  });
}
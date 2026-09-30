// Subscription plan configurations for PropTraderJournal
export interface SubscriptionPlan {
  id: string;
  name: string;
  monthlyPrice: number;
  annualPrice: number;
  annualDiscount: number;
  description: string;
  features: {
    accounts: {
      maxAccounts: number;
      accountTypes: string[];
    };
    dataRetention: {
      days: number;
      description: string;
    };
    performance: {
      dashboard: string;
      challengeTargetPlanner: string;
      chartsAnalytics: boolean | string;
      achievements: boolean | string;
    };
    preSession: {
      mentalCheck: boolean;
      dailyPlan: boolean;
      flowStateTraining: {
        enabled: boolean;
        monthlyLimit: number;
      };
      disciplineTracker: string;
    };
    accountsRecords: {
      tradesLog: {
        enabled: boolean;
        limit: number;
      };
      tradingJournal: string;
      tradingCompanion: boolean | string;
    };
    financialManagement: {
      propFirmSpending: boolean;
      payoutRecords: boolean | string;
      reports: boolean | string;
    };
  };
}

export const SUBSCRIPTION_PLANS: Record<string, SubscriptionPlan> = {
  starter: {
    id: 'starter',
    name: 'Starter Plan',
    monthlyPrice: 9.99,
    annualPrice: 113.89, // (9.99 * 12) * 0.95 = 5% discount
    annualDiscount: 5,
    description: 'Perfect for new prop traders',
    features: {
      accounts: {
        maxAccounts: 1,
        accountTypes: ['challenge', 'live', 'demo']
      },
      dataRetention: {
        days: 30,
        description: '30-day data history'
      },
      performance: {
        dashboard: 'basic', // 7 days history only
        challengeTargetPlanner: 'basic',
        chartsAnalytics: false,
        achievements: false
      },
      preSession: {
        mentalCheck: true,
        dailyPlan: true,
        flowStateTraining: {
          enabled: true,
          monthlyLimit: 3
        },
        disciplineTracker: 'basic'
      },
      accountsRecords: {
        tradesLog: {
          enabled: true,
          limit: 30 // last 30 trades only
        },
        tradingJournal: 'basic', // text only
        tradingCompanion: false
      },
      financialManagement: {
        propFirmSpending: false,
        payoutRecords: false,
        reports: false
      }
    }
  },
  professional: {
    id: 'professional',
    name: 'Professional Plan',
    monthlyPrice: 14.99,
    annualPrice: 170.89, // (14.99 * 12) * 0.95 = 5% discount
    annualDiscount: 5,
    description: 'Most popular for active traders',
    features: {
      accounts: {
        maxAccounts: 5,
        accountTypes: ['challenge', 'live', 'demo']
      },
      dataRetention: {
        days: 90,
        description: '90-day data history'
      },
      performance: {
        dashboard: 'full', // unlimited history
        challengeTargetPlanner: 'advanced',
        chartsAnalytics: 'intermediate',
        achievements: 'basic'
      },
      preSession: {
        mentalCheck: true,
        dailyPlan: true,
        flowStateTraining: {
          enabled: true,
          monthlyLimit: Infinity // unlimited
        },
        disciplineTracker: 'advanced'
      },
      accountsRecords: {
        tradesLog: {
          enabled: true,
          limit: Infinity // unlimited
        },
        tradingJournal: 'enhanced', // photos, links, tags
        tradingCompanion: 'basic'
      },
      financialManagement: {
        propFirmSpending: true,
        payoutRecords: 'basic',
        reports: 'basic'
      }
    }
  },
  elite: {
    id: 'elite',
    name: 'Elite Plan',
    monthlyPrice: 24.99,
    annualPrice: 284.89, // (24.99 * 12) * 0.95 = 5% discount  
    annualDiscount: 5,
    description: 'For Professional Traders',
    features: {
      accounts: {
        maxAccounts: Infinity,
        accountTypes: ['challenge', 'live', 'demo']
      },
      dataRetention: {
        days: Infinity,
        description: 'Unlimited data history'
      },
      performance: {
        dashboard: 'professional', // real-time updates, custom layouts
        challengeTargetPlanner: 'professional',
        chartsAnalytics: 'professional',
        achievements: 'advanced'
      },
      preSession: {
        mentalCheck: true,
        dailyPlan: true,
        flowStateTraining: {
          enabled: true,
          monthlyLimit: Infinity
        },
        disciplineTracker: 'professional'
      },
      accountsRecords: {
        tradesLog: {
          enabled: true,
          limit: Infinity
        },
        tradingJournal: 'professional', // video analysis, custom tags, advanced search
        tradingCompanion: 'advanced'
      },
      financialManagement: {
        propFirmSpending: true,
        payoutRecords: 'advanced',
        reports: 'professional'
      }
    }
  }
};

// Utility functions for pricing calculations
export function calculateAnnualSavings(plan: SubscriptionPlan): number {
  const monthlyTotal = plan.monthlyPrice * 12;
  return monthlyTotal - plan.annualPrice;
}

export function formatPrice(price: number): string {
  return `$${price.toFixed(2)}`;
}

export function getPlanPricing(plan: SubscriptionPlan, isAnnual: boolean = false) {
  if (isAnnual) {
    const monthlyEquivalent = plan.annualPrice / 12;
    const savings = calculateAnnualSavings(plan);
    return {
      price: plan.annualPrice,
      displayPrice: formatPrice(monthlyEquivalent),
      period: "/month (billed annually)",
      savings: formatPrice(savings),
      totalPrice: formatPrice(plan.annualPrice)
    };
  } else {
    return {
      price: plan.monthlyPrice,
      displayPrice: formatPrice(plan.monthlyPrice),
      period: "/month",
      savings: null,
      totalPrice: formatPrice(plan.monthlyPrice)
    };
  }
}

export const getPlanLimits = (planId: string) => {
  return SUBSCRIPTION_PLANS[planId]?.features || SUBSCRIPTION_PLANS.starter.features;
};

export const canAccessFeature = (userPlan: string, feature: string): boolean => {
  const plan = SUBSCRIPTION_PLANS[userPlan];
  if (!plan) return false;

  // Feature access matrix
  const featureAccess: Record<string, string[]> = {
    achievements: ['professional', 'elite'],
    chartsAnalytics: ['professional', 'elite'],
    tradingCompanion: ['professional', 'elite'],
    propFirmSpending: ['professional', 'elite'],
    monteCarlo: ['elite'],
    advancedReports: ['elite'],
    unlimitedAccounts: ['elite'],
    professionalAnalytics: ['elite']
  };

  return featureAccess[feature]?.includes(userPlan) || false;
};
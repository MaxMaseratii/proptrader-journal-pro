// Subscription plan configurations for PropTraderJournal
export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
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
    price: 9.00,
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
    price: 14.99,
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
    price: 24.99,
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
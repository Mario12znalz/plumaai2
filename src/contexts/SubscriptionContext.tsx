import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  messages: number;
  model: string;
  context: string;
  features: string[];
}

interface SubscriptionContextType {
  currentPlan: SubscriptionPlan | null;
  plans: SubscriptionPlan[];
  messagesUsed: number;
  messagesRemaining: number;
  upgradePlan: (planId: string) => void;
  useMessage: () => void;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
}

const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: 'basic',
    name: 'Basic',
    price: 10,
    messages: 600,
    model: 'Cydonia 22B',
    context: '8K Context',
    features: ['600 messages/day', '8K context window', 'Basic support', 'All AI features']
  },
  {
    id: 'standard',
    name: 'Standard',
    price: 18,
    messages: 800,
    model: 'Cydonia 22B',
    context: '8K Context',
    features: ['800 messages/day', '8K context window', 'Priority support', 'All AI features', 'Advanced exports']
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 25,
    messages: 1000,
    model: 'Cydonia 22B',
    context: '16K Context',
    features: ['1000 messages/day', '16K context window', 'Premium support', 'All AI features', 'Advanced exports', 'Custom models']
  }
];

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [currentPlan, setCurrentPlan] = useState<SubscriptionPlan | null>(null);
  const [messagesUsed, setMessagesUsed] = useState(0);

  useEffect(() => {
    if (user?.subscription) {
      const plan = subscriptionPlans.find(p => p.id === user.subscription);
      setCurrentPlan(plan || subscriptionPlans[0]);
    }
  }, [user]);

  const messagesRemaining = currentPlan ? currentPlan.messages - messagesUsed : 0;

  const upgradePlan = (planId: string) => {
    const plan = subscriptionPlans.find(p => p.id === planId);
    if (plan) {
      setCurrentPlan(plan);
      // In production, this would trigger PayPal payment
    }
  };

  const useMessage = () => {
    if (messagesRemaining > 0) {
      setMessagesUsed(prev => prev + 1);
    }
  };

  const value = {
    currentPlan,
    plans: subscriptionPlans,
    messagesUsed,
    messagesRemaining,
    upgradePlan,
    useMessage
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
}
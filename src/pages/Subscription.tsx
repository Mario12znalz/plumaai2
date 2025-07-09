import React, { useState } from 'react';
import { CreditCard, Check, Crown, Zap, AlertCircle } from 'lucide-react';
import { useSubscription } from '../contexts/SubscriptionContext';

export default function Subscription() {
  const { currentPlan, plans, upgradePlan, messagesUsed, messagesRemaining } = useSubscription();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleUpgrade = async (planId: string) => {
    setIsProcessing(true);
    
    // Simulate PayPal payment process
    // In production, this would redirect to PayPal or open PayPal modal
    const confirmUpgrade = window.confirm(
      `You will be redirected to PayPal to complete the payment for ${plans.find(p => p.id === planId)?.name}. Continue?`
    );
    
    if (confirmUpgrade) {
      // Simulate payment delay
      setTimeout(() => {
        upgradePlan(planId);
        setIsProcessing(false);
        alert('Payment successful! Your plan has been upgraded.');
      }, 2000);
    } else {
      setIsProcessing(false);
    }
  };

  const getPlanIcon = (planId: string) => {
    if (planId === 'premium') return Crown;
    if (planId === 'advanced') return Zap;
    return CreditCard;
  };

  const getPlanColor = (planId: string) => {
    if (planId === 'premium') return 'from-yellow-500 to-orange-500';
    if (planId === 'advanced') return 'from-purple-500 to-blue-500';
    return 'from-gray-500 to-gray-600';
  };

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Subscription Plans</h1>
          <p className="text-xl text-gray-600 mb-8">
            Choose the perfect plan for your writing needs
          </p>
          
          {currentPlan && (
            <div className="bg-white rounded-xl shadow-lg p-6 max-w-md mx-auto mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Current Usage</h2>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Messages Used</span>
                    <span>{messagesUsed} / {currentPlan.messages}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(messagesUsed / currentPlan.messages) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <div className="text-center">
                  <span className="text-2xl font-bold text-purple-600">{messagesRemaining}</span>
                  <span className="text-gray-600 ml-2">messages remaining today</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {plans.map((plan) => {
            const Icon = getPlanIcon(plan.id);
            const isCurrentPlan = currentPlan?.id === plan.id;
            const isPremiumPlan = plan.id === 'advanced';
            
            return (
              <div 
                key={plan.id} 
                className={`bg-white rounded-xl shadow-lg overflow-hidden relative ${
                  isPremiumPlan ? 'ring-2 ring-purple-500' : ''
                }`}
              >
                {isPremiumPlan && (
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <span className="bg-purple-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <div className="p-8">
                  <div className="text-center mb-6">
                    <div className={`w-16 h-16 mx-auto rounded-full bg-gradient-to-r ${getPlanColor(plan.id)} flex items-center justify-center mb-4`}>
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
                    <div className="text-4xl font-bold text-gray-900 mt-2">
                      ${plan.price}
                      <span className="text-lg text-gray-500 font-normal">/month</span>
                    </div>
                  </div>

                  <div className="space-y-4 mb-8">
                    <div className="text-center">
                      <div className="text-lg font-semibold text-gray-900">{plan.messages} messages/day</div>
                      <div className="text-sm text-gray-600">{plan.model}</div>
                      <div className="text-sm text-gray-600">{plan.context}</div>
                    </div>
                    
                    <ul className="space-y-3">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center">
                          <Check className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                          <span className="text-gray-700 text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="text-center">
                    {isCurrentPlan ? (
                      <div className="bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-semibold">
                        Current Plan
                      </div>
                    ) : (
                      <button
                        onClick={() => handleUpgrade(plan.id)}
                        disabled={isProcessing}
                        className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${
                          plan.id === 'advanced'
                            ? 'bg-purple-600 text-white hover:bg-purple-700'
                            : 'bg-gray-900 text-white hover:bg-gray-800'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {isProcessing ? 'Processing...' : 'Upgrade Now'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Payment Info */}
        <div className="bg-blue-50 rounded-xl p-6 mb-8">
          <div className="flex items-start">
            <AlertCircle className="h-6 w-6 text-blue-600 mr-3 mt-1 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-semibold text-blue-900 mb-2">Payment Information</h3>
              <ul className="text-blue-800 space-y-1 text-sm">
                <li>• All payments are processed securely through PayPal</li>
                <li>• Billing is monthly and automatic</li>
                <li>• You can cancel or change your plan at any time</li>
                <li>• Messages reset daily at midnight UTC</li>
                <li>• Unused messages do not roll over to the next day</li>
              </ul>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Frequently Asked Questions</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">What's the difference between Cydonia and Anubis?</h3>
              <p className="text-gray-600 text-sm">
                All plans use the powerful Cydonia model. Higher tiers offer more daily messages and enhanced context windows for longer conversations.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Can I change my plan anytime?</h3>
              <p className="text-gray-600 text-sm">
                Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately, and billing adjusts accordingly.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">What happens if I exceed my daily limit?</h3>
              <p className="text-gray-600 text-sm">
                Once you reach your daily message limit, you'll need to wait until the next day (midnight UTC) or upgrade to a higher plan for more messages.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Is there a free trial?</h3>
              <p className="text-gray-600 text-sm">
                New users start with limited access to test the platform. After that, choose a paid plan to continue using PlumaAI's full features.
              </p>
            </div>
          </div>
        </div>

        {/* Contact Support */}
        <div className="text-center mt-12">
          <p className="text-gray-600">
            Need help choosing a plan or have billing questions?{' '}
            <a href="mailto:support@plumaai.com" className="text-purple-600 hover:text-purple-800 font-semibold">
              Contact our support team
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
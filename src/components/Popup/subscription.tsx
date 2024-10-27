import { X } from 'lucide-react'

interface Plan {
    name: string
    price: string
    features: string[]
    recommended?: boolean
}

interface SubscriptionPopupProps {
    isOpen: boolean
    onClose: () => void
    onSubscribe: (plan: string) => void
}

const plans: Plan[] = [
    {
        name: 'Free',
        price: '$0/month',
        features: ['Basic code analysis', 'Limited AI suggestions', 'Community support']
    },
    {
        name: 'Coder',
        price: '$9.99/month',
        features: ['Advanced code analysis', 'Unlimited AI suggestions', 'Email support', 'Custom themes'],
        recommended: true
    },
    {
        name: 'Cyber-coder',
        price: '$19.99/month',
        features: ['Premium code analysis', 'Priority AI processing', '24/7 support', 'Team collaboration', 'Custom plugins']
    }
]

export default function SubscriptionPopup({ isOpen, onClose, onSubscribe }: SubscriptionPopupProps) {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-8 w-full max-w-4xl">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Choose Your Plan</h2>
                    <button 
                        onClick={onClose} 
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>
                <div className="grid md:grid-cols-3 gap-8">
                    {plans.map((plan) => (
                        <div 
                            key={plan.name} 
                            className={`flex flex-col h-full rounded-xl p-6 ${
                                plan.recommended 
                                    ? 'border-2 border-blue-500 dark:border-blue-400 shadow-lg' 
                                    : 'border border-gray-200 dark:border-gray-700'
                            }`}
                        >
                            <div className="mb-8">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                        {plan.name}
                                    </h3>
                                    {plan.recommended && (
                                        <span className="px-3 py-1 text-xs font-semibold text-blue-500 bg-blue-50 dark:bg-blue-900/30 rounded-full">
                                            Recommended
                                        </span>
                                    )}
                                </div>
                                <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                                    {plan.price}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    per user, billed monthly
                                </p>
                            </div>
                            
                            <div className="flex-grow">
                                <ul className="space-y-4 mb-8">
                                    {plan.features.map((feature, index) => (
                                        <li key={index} className="flex items-start text-gray-600 dark:text-gray-300">
                                            <svg 
                                                className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" 
                                                fill="none" 
                                                stroke="currentColor" 
                                                viewBox="0 0 24 24"
                                            >
                                                <path 
                                                    strokeLinecap="round" 
                                                    strokeLinejoin="round" 
                                                    strokeWidth={2} 
                                                    d="M5 13l4 4L19 7"
                                                />
                                            </svg>
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <button
                                onClick={() => onSubscribe(plan.name)}
                                className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-200 ${
                                    plan.recommended
                                        ? 'bg-blue-500 hover:bg-blue-600 text-white shadow-md hover:shadow-lg'
                                        : 'bg-gray-100 hover:bg-gray-200 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white'
                                }`}
                            >
                                Subscribe Now
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

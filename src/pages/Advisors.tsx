import { useState } from 'react'
import { Users, Star, BadgeCheck, Filter, Calendar, CheckCircle, X } from 'lucide-react'
import { cn, formatCurrency } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

// Placeholder data
const advisors = [
  {
    id: '1',
    name: 'Rajesh Sharma',
    avatar: '👨‍💼',
    tier: 'elite',
    specializations: ['Large Cap', 'Banking'],
    yearsExperience: 15,
    aum: '₹250 Cr+',
    rating: 4.9,
    reviewCount: 127,
    consultationFee: 2999,
    bio: 'Former fund manager at HDFC AMC with 15+ years experience in Indian equities.',
    nextAvailable: 'Tomorrow, 10:00 AM',
  },
  {
    id: '2',
    name: 'Priya Patel',
    avatar: '👩‍💼',
    tier: 'expert',
    specializations: ['Small Cap', 'Growth'],
    yearsExperience: 8,
    aum: '₹50 Cr+',
    rating: 4.7,
    reviewCount: 84,
    consultationFee: 1499,
    bio: 'SEBI-registered advisor specializing in high-growth small cap opportunities.',
    nextAvailable: 'Today, 4:00 PM',
  },
  {
    id: '3',
    name: 'Amit Verma',
    avatar: '👨‍🏫',
    tier: 'emerging',
    specializations: ['Value', 'Dividend'],
    yearsExperience: 5,
    aum: '₹15 Cr+',
    rating: 4.5,
    reviewCount: 42,
    consultationFee: 799,
    bio: 'Value investor focused on dividend-paying quality stocks.',
    nextAvailable: 'Today, 6:30 PM',
  },
]

const tierColors = {
  elite: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  expert: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  emerging: 'bg-success-500/20 text-success-400 border-success-500/30',
}

export function Advisors() {
  const [selectedTier, setSelectedTier] = useState('All')
  const [bookingConfirm, setBookingConfirm] = useState<string | null>(null)

  const filteredAdvisors = selectedTier === 'All'
    ? advisors
    : advisors.filter(a => a.tier.toLowerCase() === selectedTier.toLowerCase())

  const handleBook = (advisorName: string) => {
    setBookingConfirm(advisorName)
    setTimeout(() => setBookingConfirm(null), 4000)
  }

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Booking Confirmation Toast */}
      <AnimatePresence>
        {bookingConfirm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-success-500/20 border border-success-500/30 rounded-xl px-5 py-3 flex items-center gap-3"
          >
            <CheckCircle className="w-5 h-5 text-success-400" />
            <span className="text-white font-medium">Demo: Booking request sent to {bookingConfirm}</span>
            <button onClick={() => setBookingConfirm(null)} className="text-neutral-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Users className="w-7 h-7 text-primary-500" />
          Advisor Marketplace
        </h1>
        <p className="text-neutral-400 mt-1">
          Get human expert validation on your investment decisions
        </p>
      </div>

      {/* Info Banner */}
      <div className="bg-primary-500/10 border border-primary-500/30 rounded-2xl p-4">
        <div className="flex items-start gap-3">
          <BadgeCheck className="w-6 h-6 text-primary-400 flex-shrink-0" />
          <div>
            <div className="font-medium text-primary-300">All advisors are SEBI-registered</div>
            <div className="text-sm text-primary-400/80">
              Verified credentials, transparent track records, and regulated fee structures.
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <button className="flex items-center gap-2 px-4 py-2 bg-dark-700 border border-white/10 rounded-xl text-neutral-300 hover:bg-dark-600 transition-colors">
          <Filter className="w-4 h-4" />
          Filters
        </button>
        <div className="flex gap-2">
          {['All', 'Elite', 'Expert', 'Emerging'].map(tier => (
            <button
              key={tier}
              onClick={() => setSelectedTier(tier)}
              className={cn(
                'px-4 py-2 rounded-xl text-sm font-medium transition-colors',
                tier === selectedTier
                  ? 'bg-primary-500 text-white'
                  : 'bg-dark-700/50 text-neutral-400 hover:bg-dark-700 hover:text-white border border-white/5'
              )}
            >
              {tier}
            </button>
          ))}
        </div>
      </div>

      {/* Advisor Cards */}
      <div className="space-y-4">
        {filteredAdvisors.map(advisor => (
          <motion.div
            key={advisor.id}
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-dark-800 rounded-2xl border border-white/5 p-5 hover:border-white/10 transition-colors"
          >
            <div className="flex items-start gap-4">
              <div className="text-4xl">{advisor.avatar}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="font-semibold text-lg text-white">{advisor.name}</span>
                  <span
                    className={cn(
                      'px-2 py-0.5 rounded text-xs font-medium border capitalize',
                      tierColors[advisor.tier as keyof typeof tierColors]
                    )}
                  >
                    {advisor.tier}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-sm text-neutral-400 mb-2 flex-wrap">
                  <span className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                    {advisor.rating} ({advisor.reviewCount})
                  </span>
                  <span>{advisor.yearsExperience} yrs exp</span>
                  <span>AUM: {advisor.aum}</span>
                </div>

                <p className="text-sm text-neutral-400 mb-3">{advisor.bio}</p>

                <div className="flex items-center gap-2 mb-4 flex-wrap">
                  {advisor.specializations.map(spec => (
                    <span key={spec} className="px-2.5 py-1 bg-dark-700/50 rounded-lg text-xs text-neutral-300 border border-white/5">
                      {spec}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-white/5 flex-wrap gap-3">
                  <div className="flex items-center gap-4">
                    <div>
                      <span className="text-neutral-500 text-sm">Fee: </span>
                      <span className="font-semibold text-white">{formatCurrency(advisor.consultationFee)}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm text-neutral-400">
                      <Calendar className="w-4 h-4" />
                      <span>{advisor.nextAvailable}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleBook(advisor.name)}
                    className="px-5 py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-xl transition-colors"
                  >
                    Book Consultation
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Demo Note */}
      <div className="text-center py-6">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-dark-700/50 rounded-xl text-sm text-neutral-400 border border-white/5">
          <span>Demo Mode</span>
          <span className="text-neutral-600">•</span>
          <span>Full booking and payment flow coming soon</span>
        </div>
      </div>
    </motion.div>
  )
}

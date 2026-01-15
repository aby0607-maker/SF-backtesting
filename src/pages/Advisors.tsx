import { Users, Star, BadgeCheck, Filter } from 'lucide-react'
import { cn, formatCurrency } from '@/lib/utils'

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
  },
]

const tierColors = {
  elite: 'bg-amber-100 text-amber-700 border-amber-300',
  expert: 'bg-blue-100 text-blue-700 border-blue-300',
  emerging: 'bg-green-100 text-green-700 border-green-300',
}

export function Advisors() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-h2 flex items-center gap-2">
          <Users className="w-7 h-7 text-primary-600" />
          Advisor Marketplace
        </h1>
        <p className="text-body text-content-secondary mt-1">
          Get human expert validation on your investment decisions
        </p>
      </div>

      {/* Info Banner */}
      <div className="card bg-primary-50 border-primary-100">
        <div className="flex items-start gap-3">
          <BadgeCheck className="w-6 h-6 text-primary-600 flex-shrink-0" />
          <div>
            <div className="font-medium text-primary-800">All advisors are SEBI-registered</div>
            <div className="text-body-sm text-primary-700">
              Verified credentials, transparent track records, and regulated fee structures.
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <button className="btn-secondary flex items-center gap-2">
          <Filter className="w-4 h-4" />
          Filters
        </button>
        <div className="flex gap-2">
          {['All', 'Elite', 'Expert', 'Emerging'].map(tier => (
            <button
              key={tier}
              className={cn(
                'px-3 py-1.5 rounded-full text-body-sm font-medium transition-colors',
                tier === 'All'
                  ? 'bg-primary-600 text-white'
                  : 'bg-surface-tertiary text-content-secondary hover:bg-gray-200'
              )}
            >
              {tier}
            </button>
          ))}
        </div>
      </div>

      {/* Advisor Cards */}
      <div className="space-y-4">
        {advisors.map(advisor => (
          <div key={advisor.id} className="card">
            <div className="flex items-start gap-4">
              <div className="text-4xl">{advisor.avatar}</div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-h4">{advisor.name}</span>
                  <span
                    className={cn(
                      'px-2 py-0.5 rounded text-caption font-medium border capitalize',
                      tierColors[advisor.tier as keyof typeof tierColors]
                    )}
                  >
                    {advisor.tier}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-body-sm text-content-secondary mb-2">
                  <span className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    {advisor.rating} ({advisor.reviewCount})
                  </span>
                  <span>{advisor.yearsExperience} yrs exp</span>
                  <span>AUM: {advisor.aum}</span>
                </div>

                <p className="text-body-sm text-content-secondary mb-3">{advisor.bio}</p>

                <div className="flex items-center gap-2 mb-4">
                  {advisor.specializations.map(spec => (
                    <span key={spec} className="badge bg-surface-tertiary text-content-secondary">
                      {spec}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div>
                    <span className="text-content-secondary text-body-sm">Consultation fee: </span>
                    <span className="font-medium">{formatCurrency(advisor.consultationFee)}</span>
                  </div>
                  <button className="btn-primary">Book Consultation</button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Coming Soon Note */}
      <div className="text-center py-8 text-content-secondary">
        <p className="text-body-sm">
          💡 Full booking and payment flow coming in Phase 3
        </p>
      </div>
    </div>
  )
}

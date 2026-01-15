import type { Stock } from '@/types'

export const stocks: Stock[] = [
  {
    id: 'zomato',
    symbol: 'ZOMATO',
    name: 'Eternal (Zomato)',
    sector: 'Food Tech',
    subSector: 'Quick Commerce & Food Delivery',
    currentPrice: 268,
    previousClose: 262,
    change: 6,
    changePercent: 2.29,
    marketCap: 235000,
    high52w: 305,
    low52w: 125,
    beta: 1.8,
    peerGroup: ['Swiggy', 'Nykaa', 'Paytm', 'PolicyBazaar'],
  },
  {
    id: 'axisbank',
    symbol: 'AXISBANK',
    name: 'Axis Bank',
    sector: 'Banking',
    subSector: 'Private Sector Banks',
    currentPrice: 1078,
    previousClose: 1070,
    change: 8,
    changePercent: 0.75,
    marketCap: 332000,
    high52w: 1340,
    low52w: 995,
    beta: 1.2,
    peerGroup: ['HDFC Bank', 'ICICI Bank', 'Kotak Bank', 'IndusInd Bank'],
  },
  {
    id: 'tcs',
    symbol: 'TCS',
    name: 'Tata Consultancy Services',
    sector: 'IT Services',
    subSector: 'Large Cap IT',
    currentPrice: 4150,
    previousClose: 4165,
    change: -15,
    changePercent: -0.36,
    marketCap: 1502000,
    high52w: 4590,
    low52w: 3575,
    beta: 0.7,
    peerGroup: ['Infosys', 'Wipro', 'HCL Tech', 'Tech Mahindra'],
  },
]

export const getStockById = (id: string): Stock | undefined => {
  return stocks.find(s => s.id === id || s.symbol.toLowerCase() === id.toLowerCase())
}

export const getStockBySymbol = (symbol: string): Stock | undefined => {
  return stocks.find(s => s.symbol.toLowerCase() === symbol.toLowerCase())
}

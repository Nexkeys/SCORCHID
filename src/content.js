/**
 * All site copy in one place. SCORCHID / $SCRCH is a concept token: every
 * figure, partner, quote and link below is placeholder content.
 */

export const NAV_LINKS = [
  { id: 'protocol', label: 'Protocol' },
  { id: 'security', label: 'Security' },
  { id: 'tokenomics', label: 'Tokenomics' },
  { id: 'ecosystem', label: 'Ecosystem' },
  { id: 'roadmap', label: 'Roadmap' },
  { id: 'community', label: 'Community' },
]

export const TICKER = [
  ['SCRCH', '0.0421', '+12.9%'],
  ['BTC', '108,420', '+2.4%'],
  ['ETH', '4,021', '+1.8%'],
  ['SOL', '312.50', '+5.1%'],
  ['BURNED', '182.4M', '+0.3%'],
  ['ARB', '1.88', '-0.6%'],
  ['OP', '2.94', '+3.2%'],
  ['STAKED', '418.0M', '+1.1%'],
  ['LINK', '32.10', '+0.9%'],
  ['AVAX', '61.40', '-1.2%'],
]

export const HERO_STATS = [
  { label: 'Price', value: '$0.0421', delta: '+12.9%' },
  { label: 'Market cap', value: '$42.1M', delta: '+8.4%' },
  { label: 'Holders', value: '24,718', delta: '+312' },
  { label: 'Supply burned', value: '18.2%', delta: '+0.3%' },
]

export const STATEMENT = {
  before: 'Every trade burns. Every holder earns. No team mint, no hidden wallets, no second chances for supply. This is',
  accent: 'heat',
  after: 'you can verify on-chain.',
}

export const STEPS = [
  {
    n: '01',
    title: 'Stake',
    body: 'Lock $SCRCH in the vault and take a cut of every swap fee, streamed to your wallet each block. No lockup games.',
    meta: 'APY 14.2% · paid per block',
  },
  {
    n: '02',
    title: 'Burn',
    body: '0.25% of every trade goes straight to the furnace contract and is destroyed forever. Supply only moves one way.',
    meta: '182.4M burned · counting',
  },
  {
    n: '03',
    title: 'Earn',
    body: 'Burns make the float scarcer while stakers collect the fees. Hold longer, earn longer, let the heat compound.',
    meta: 'Auto-compounding vaults',
  },
]

export const SECURITY_CHECKS = [
  'Ownership renounced at launch',
  'Liquidity locked for 4 years',
  'Treasury behind a 4 of 7 multisig',
  'Contracts open source and verified',
  'Zero mint functions. Ever.',
]

export const SECURITY_STATS = [
  { value: 2, decimals: 0, label: 'Independent audits' },
  { value: 4, suffix: ' yr', decimals: 0, label: 'Liquidity lock' },
  { value: 0, decimals: 0, label: 'Critical findings' },
  { value: 250, prefix: '$', suffix: 'K', decimals: 0, label: 'Bug bounty' },
]

export const AUDITORS = ['HALBORN', 'CERTIK', 'OTTERSEC', 'SPEARBIT', 'ZELLIC']

export const ALLOCATION = [
  { label: 'Community & liquidity', pct: 45, color: '#fbbf24' },
  { label: 'Staking rewards', pct: 25, color: '#22d3ee' },
  { label: 'Ecosystem fund', pct: 15, color: '#818cf8' },
  { label: 'Team (3 yr vest)', pct: 10, color: '#34d399' },
  { label: 'Treasury', pct: 5, color: '#f472b6' },
]

export const TOKEN_STATS = [
  { value: 1, suffix: 'B', decimals: 2, label: 'Total supply' },
  { value: 18.2, suffix: '%', decimals: 1, label: 'Burned so far' },
  { value: 41.8, suffix: '%', decimals: 1, label: 'Staked' },
  { value: 0.25, suffix: '%', decimals: 2, label: 'Burn per trade' },
]

// 30 days of an illustrative price series (in tenths of a cent) for the chart.
export const PRICE_SERIES = [
  21, 22, 21.5, 23, 24.2, 23.6, 25, 26.4, 25.8, 27, 28.6, 27.9, 29.4, 30.1, 29.2, 31, 32.8, 31.9, 33.5,
  34.2, 33.1, 35.4, 36.9, 36.1, 37.8, 38.4, 39.9, 39.2, 41, 42.1,
]

export const ECOSYSTEM = [
  { name: 'Furnace DEX', tag: 'Swap', status: 'Live', body: 'Swap anything. The burn is built into every route.', hue: '#34d399', stat: '$1.2B volume' },
  { name: 'Ember Wallet', tag: 'Wallet', status: 'Live', body: 'Self custody, passkeys and a burn tracker in your pocket.', hue: '#22d3ee', stat: '80K wallets' },
  { name: 'Ashbridge', tag: 'Bridge', status: 'Beta', body: 'Move $SCRCH across six L2s in under a minute.', hue: '#818cf8', stat: '6 chains' },
  { name: 'Kiln Launchpad', tag: 'Launch', status: 'Beta', body: 'Fair launches with burn-locked liquidity by default.', hue: '#fbbf24', stat: '14 launches' },
  { name: 'Cinder', tag: 'NFT', status: 'Soon', body: 'Collectibles that burn to mint the next drop.', hue: '#f472b6', stat: 'Q2 2027' },
  { name: 'Heat Index', tag: 'Data', status: 'Live', body: 'Real-time burn, stake and flow analytics for everyone.', hue: '#38bdf8', stat: '2.4M queries' },
]

export const ROADMAP = [
  { phase: '01', name: 'Ignite', when: 'Q1 2026', status: 'Done', items: ['Fair launch, no presale', 'Liquidity locked for 4 years', 'First external audit'] },
  { phase: '02', name: 'Spread', when: 'Q3 2026', status: 'Live', items: ['Staking vault v1', 'Furnace DEX mainnet', 'Tier 1 exchange listing'] },
  { phase: '03', name: 'Blaze', when: 'Q1 2027', status: 'Next', items: ['Ashbridge cross-chain', 'On-chain DAO governance', 'Ember Wallet mobile'] },
  { phase: '04', name: 'Inferno', when: '2027+', status: 'Soon', items: ['SCORCHID L2 testnet', 'Builder grants program', 'Burn-to-mint NFT protocol'] },
]

export const VOICES = [
  { n: '01', handle: '@0xmira', quote: 'First token where I check the burn chart before the price chart.' },
  { n: '02', handle: '@kestrel.eth', quote: 'Staking paid out every block. I watched it tick up like a meter.' },
  { n: '03', handle: '@solsurfer', quote: 'The audits, the lock, the renounced keys. Finally a dev team that gets it.' },
  { n: '04', handle: '@degenpoet', quote: 'Supply goes down, my bags feel heavier. Simple math, good vibes.' },
  { n: '05', handle: '@ashlynn', quote: 'Bridged to Base in forty seconds. Ashbridge is unreal.' },
  { n: '06', handle: '@node_runner', quote: 'Heat Index is my new homepage. Pure on-chain truth.' },
]

export const FAQ = [
  { q: 'What is $SCRCH?', a: 'A community-run token where every trade burns a slice of supply and stakers earn the fees. No team mint, no hidden wallets.' },
  { q: 'Where can I buy it?', a: 'On Furnace DEX and any major aggregator. Always check the contract address on this site before you swap.' },
  { q: 'How does staking pay out?', a: 'Swap fees are streamed to the vault every block and split pro rata between stakers. Unstake at any time.' },
  { q: 'Is the burn really permanent?', a: 'Yes. Burned tokens go to a contract with no withdraw function. Every burn is verifiable on-chain.' },
]

export const SOCIALS = [
  { label: 'X / Twitter', href: '#' },
  { label: 'Telegram', href: '#' },
  { label: 'Discord', href: '#' },
  { label: 'GitHub', href: '#' },
]

export const CONTRACT = '0x5C0R...C41D'

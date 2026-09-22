/**
 * Trimmed but structurally verbatim samples captured from Hyperliquid on 2026-09-19
 * (`outcomeMeta` + `outcomeTemplates`, mainnet and testnet). Long rules text is
 * shortened; every field name, key ordering and `metadata=` tail is real.
 */
import type { OutcomeTemplate, RawOutcomeMeta } from '../types'

export const TEMPLATES: OutcomeTemplate[] = [
  {
    id: 'binaryPrice',
    role: { standaloneOutcome: { sideNames: ['Yes', 'No'] } },
    name: '{perp} above {threshold} at {time}?',
    description:
      'The market resolves to Yes if the {perp} price is above {threshold} at {time}, and otherwise resolves to No. Settlement is according to the {seconds}-second TWAP of {priceDescription} price ending at {time}. metadata=category:price|subCategory:N/A|semanticRestriction:This market must refer to the price of a Hyperliquid perp.',
    keywords: [
      ['perp', 'hlPerp'],
      ['priceDescription', 'string'],
      ['seconds', 'uInt'],
      ['threshold', 'uDecimal'],
      ['time', 'dateTime']
    ]
  },
  {
    id: 'priceTouch',
    role: { standaloneOutcome: { sideNames: ['Yes', 'No'] } },
    name: '{perp} touches {target} by {time}',
    description:
      'The market resolves to Yes if the {perp} price touches {target} at or before {time}, and otherwise resolves to No. metadata=category:price|subCategory:N/A|semanticRestriction:This market must refer to the price of a Hyperliquid perp.',
    keywords: [
      ['perp', 'hlPerp'],
      ['priceDescription', 'string'],
      ['seconds', 'uInt'],
      ['target', 'uDecimal'],
      ['time', 'dateTime']
    ]
  },
  {
    id: 'scalarPrice',
    role: { standaloneOutcome: { sideNames: ['Long', 'Short'] } },
    name: '{perp} from {low} to {high} at {time}',
    description:
      'If the {perp} price is at or above {high} at {time}, Long tokens pay out $1 each. metadata=category:price|subCategory:N/A|semanticRestriction:This market must refer to the price of a Hyperliquid perp.',
    keywords: [
      ['high', 'uDecimal'],
      ['low', 'uDecimal'],
      ['perp', 'hlPerp'],
      ['priceDescription', 'string'],
      ['seconds', 'uInt'],
      ['time', 'dateTime']
    ]
  },
  {
    id: 'companyIpoConfirmed',
    role: { standaloneOutcome: { sideNames: ['Yes', 'No'] } },
    name: '{company} IPO confirmed by {dateTime}',
    description:
      "The market resolves to Yes if {company}'s first public common-equity offering is publicly confirmed at or before {dateTime}. metadata=category:economics|subCategory:N/A|semanticRestriction:This market must refer to confirmation of a company's initial public offering.",
    keywords: [
      ['company', 'string'],
      ['dateTime', 'dateTime']
    ]
  },
  {
    id: 'sportsContestWinner',
    role: { standaloneOutcome: { sideNames: ['{shortNameA}', '{shortNameB}'] } },
    name: '{competition} {stage}: {participantA} v {participantB}',
    description:
      'This {sport} market has two sides, {shortNameA} for {participantA} and {shortNameB} for {participantB}. It covers the {contestType} between {participantA} and {participantB} in the {season} {competition} {stage}, scheduled for {scheduledStart} UTC. metadata=category:sports|subCategory:{sport}|semanticRestriction:This market must refer to a single scheduled sports contest.',
    keywords: [
      ['competition', 'string'],
      ['contestType', 'string'],
      ['countedPlay', 'string'],
      ['officialSource', 'string'],
      ['participantA', 'string'],
      ['participantB', 'string'],
      ['resolutionDeadline', 'dateTime'],
      ['scheduledStart', 'dateTime'],
      ['season', 'string'],
      ['shortNameA', 'shortString'],
      ['shortNameB', 'shortString'],
      ['sport', 'string'],
      ['stage', 'string']
    ]
  },
  {
    id: 'sportsOverUnderMarket',
    role: { standaloneOutcome: { sideNames: ['Over', 'Under'] } },
    name: '{event}: {measure} over/under {line}',
    description:
      'This {sport} market covers {measure} in {event}, scheduled for {scheduledStart}. metadata=category:sports|subCategory:{sport}|semanticRestriction:This market must refer to a numerical measure from a single scheduled sports contest.',
    keywords: [
      ['countedPlay', 'string'],
      ['event', 'string'],
      ['line', 'uDecimal'],
      ['measure', 'string'],
      ['officialSource', 'string'],
      ['resolutionDeadline', 'dateTime'],
      ['scheduledStart', 'dateTime'],
      ['sport', 'string']
    ]
  },
  {
    id: 'sportsContestResult',
    role: 'question',
    name: '{competition} {stage}: {participantA} v {participantB}',
    description:
      'This {sport} market has three possible results: {participantA}, Draw, or {participantB}. Exactly one corresponding named outcome resolves to Yes. metadata=category:sports|subCategory:{sport}|semanticRestriction:This market must refer to a single scheduled sports contest.',
    keywords: [
      ['competition', 'string'],
      ['contestType', 'string'],
      ['countedPlay', 'string'],
      ['officialSource', 'string'],
      ['participantA', 'string'],
      ['participantB', 'string'],
      ['resolutionDeadline', 'dateTime'],
      ['scheduledStart', 'dateTime'],
      ['season', 'string'],
      ['sport', 'string'],
      ['stage', 'string']
    ]
  },
  {
    id: 'sportsContestParticipant2',
    role: { questionOutcome: { parent: 'sportsContestResult' } },
    name: '{participant}',
    description:
      "This outcome resolves to Yes if {participant} is the sole winner of the Contest under the parent question's rules, and otherwise resolves to No.",
    keywords: [['participant', 'string']]
  },
  {
    id: 'sportsContestDraw2',
    role: { questionOutcome: { parent: 'sportsContestResult' } },
    name: 'Draw',
    description:
      "This outcome resolves to Yes if, under the parent question's rules, the Contest Result is a draw or the Residual Conditions apply, and otherwise resolves to No.",
    keywords: []
  },
  {
    id: 'sportsTournamentWinner',
    role: 'question',
    name: '{season} {competition} winner',
    description:
      'This {sport} market has one named outcome per listed participant in the {season} {competition} plus the fallback. metadata=category:sports|subCategory:{sport}|semanticRestriction:This market must refer to the overall winner of a sports tournament.',
    keywords: [
      ['competition', 'string'],
      ['officialSource', 'string'],
      ['resolutionDeadline', 'dateTime'],
      ['season', 'string'],
      ['sport', 'string']
    ]
  },
  {
    id: 'sportsTournamentParticipant',
    role: { questionOutcome: { parent: 'sportsTournamentWinner' } },
    name: '{participant}',
    description:
      "This outcome resolves to Yes if {participant} is named the sole winner of the Tournament under the parent question's rules.",
    keywords: [['participant', 'string']]
  },
  {
    id: 'policyRateDecision',
    role: 'question',
    name: '{institution} {decisionLabel} rate decision',
    description:
      'This market has three possible results: No change, Decrease, or Increase. It covers the {decisionLabel} {institution} decision concerning {policyMeasure}, scheduled for {scheduledDecision} UTC. metadata=category:economics|subCategory:N/A|semanticRestriction:This market must refer to a scheduled policy rate decision by an official institution.',
    keywords: [
      ['decisionDeadline', 'dateTime'],
      ['decisionLabel', 'string'],
      ['institution', 'string'],
      ['officialSource', 'string'],
      ['policyMeasure', 'string'],
      ['scheduledDecision', 'dateTime']
    ]
  },
  {
    id: 'policyRateDecrease',
    role: { questionOutcome: { parent: 'policyRateDecision' } },
    name: 'Decrease',
    description:
      "This outcome resolves to Yes if the Decision Value is lower than the Prior Value under the parent question's rules.",
    keywords: []
  }
]

/** Mainnet + testnet outcomes (ids preserved) covering every rendering path. */
export const META: RawOutcomeMeta = {
  outcomes: [
    // mainnet: template standalone, venue "out"
    {
      outcome: 1210,
      name: 'template:binaryPrice',
      description:
        'perp:BTC|priceDescription:BTC-USDC mark|seconds:1|threshold:100000|time:20261001-0000',
      sideSpecs: [{ name: 'template:Yes' }, { name: 'template:No' }],
      quoteToken: 'USDC',
      venue: 'out',
      deployerFeeScale: '1.0'
    },
    // mainnet: HIP-3 perp → Tradfi
    {
      outcome: 1230,
      name: 'template:binaryPrice',
      description:
        'perp:xyz:CL|priceDescription:xyz:CL|seconds:1|threshold:83.196|time:20260929-2100',
      sideSpecs: [{ name: 'template:Yes' }, { name: 'template:No' }],
      quoteToken: 'USDC',
      venue: 'out',
      deployerFeeScale: '1.0'
    },
    // mainnet: touch
    {
      outcome: 1209,
      name: 'template:priceTouch',
      description:
        'perp:HYPE|priceDescription:HYPE-USDC perp mark |seconds:1|target:100|time:20261001-0000',
      sideSpecs: [{ name: 'template:Yes' }, { name: 'template:No' }],
      quoteToken: 'USDC',
      venue: 'out',
      deployerFeeScale: '1.0'
    },
    // mainnet: sports contest winner with {shortNameA}/{shortNameB} sides
    {
      outcome: 3002,
      name: 'template:sportsContestWinner',
      description:
        'competition:NCAAF|contestType:game|countedPlay:regulation time and any overtime|officialSource:ESPN|participantA:LSU Tigers|participantB:Ole Miss Rebels|resolutionDeadline:20260920-0530|scheduledStart:20260919-2330|season:2026|shortNameA:LSU|shortNameB:Ole Miss|sport:football|stage:Regular Season',
      sideSpecs: [{ name: 'template:{shortNameA}' }, { name: 'template:{shortNameB}' }],
      quoteToken: 'USDC',
      venue: 'txyz'
    },
    // mainnet: over/under
    {
      outcome: 3940,
      name: 'template:sportsOverUnderMarket',
      description:
        'countedPlay:regulation time and any overtime|event:NFL: Browns vs Buccaneers|line:8.5|measure:TB points minus CLE points|officialSource:ESPN|resolutionDeadline:20260920-2300|scheduledStart:20260920-1700|sport:football',
      sideSpecs: [{ name: 'template:Over' }, { name: 'template:Under' }],
      quoteToken: 'USDC',
      venue: 'txyz'
    },
    // mainnet: economics
    {
      outcome: 2597,
      name: 'template:companyIpoConfirmed',
      description: 'company:Anthropic|dateTime:20261031-2359',
      sideSpecs: [{ name: 'template:Yes' }, { name: 'template:No' }],
      quoteToken: 'USDC',
      venue: 'txyz'
    },
    // mainnet: native recurring binary (no venue field at all)
    {
      outcome: 4219,
      name: 'Recurring',
      description:
        'class:priceBinary|underlying:BTC|expiry:20260920-0600|targetPrice:81081|period:1d',
      sideSpecs: [{ name: 'Yes' }, { name: 'No' }],
      quoteToken: 'USDC'
    },
    // testnet: native bucket question children
    {
      outcome: 20202,
      name: 'Recurring Fallback',
      description: 'other',
      sideSpecs: [{ name: 'Yes' }, { name: 'No' }],
      quoteToken: 'USDC'
    },
    {
      outcome: 20203,
      name: 'Recurring Named Outcome',
      description: 'index:0',
      sideSpecs: [{ name: 'Yes' }, { name: 'No' }],
      quoteToken: 'USDC'
    },
    {
      outcome: 20204,
      name: 'Recurring Named Outcome',
      description: 'index:1',
      sideSpecs: [{ name: 'Yes' }, { name: 'No' }],
      quoteToken: 'USDC'
    },
    {
      outcome: 20205,
      name: 'Recurring Named Outcome',
      description: 'index:2',
      sideSpecs: [{ name: 'Yes' }, { name: 'No' }],
      quoteToken: 'USDC'
    },
    // mainnet: template question children (sportsContestResult)
    {
      outcome: 3016,
      name: 'template fallback',
      description: 'other',
      sideSpecs: [{ name: 'Yes' }, { name: 'No' }],
      quoteToken: 'USDC',
      venue: 'txyz',
      deployerFeeScale: '1.0'
    },
    {
      outcome: 3017,
      name: 'template:sportsContestParticipant2',
      description: 'participant:Paris Saint-Germain',
      sideSpecs: [{ name: 'Yes' }, { name: 'No' }],
      quoteToken: 'USDC',
      venue: 'txyz',
      deployerFeeScale: '1.0'
    },
    {
      outcome: 3018,
      name: 'template:sportsContestDraw2',
      description: '',
      sideSpecs: [{ name: 'Yes' }, { name: 'No' }],
      quoteToken: 'USDC',
      venue: 'txyz',
      deployerFeeScale: '1.0'
    },
    {
      outcome: 3019,
      name: 'template:sportsContestParticipant2',
      description: 'participant:Marseille',
      sideSpecs: [{ name: 'Yes' }, { name: 'No' }],
      quoteToken: 'USDC',
      venue: 'txyz',
      deployerFeeScale: '1.0'
    },
    // mainnet: tournament winner children
    {
      outcome: 1472,
      name: 'template fallback',
      description: 'other',
      sideSpecs: [{ name: 'Yes' }, { name: 'No' }],
      quoteToken: 'USDC',
      venue: 'out',
      deployerFeeScale: '1.0'
    },
    {
      outcome: 1473,
      name: 'template:sportsTournamentParticipant',
      description: 'participant:Arsenal',
      sideSpecs: [{ name: 'Yes' }, { name: 'No' }],
      quoteToken: 'USDC',
      venue: 'out',
      deployerFeeScale: '1.0'
    },
    // testnet: validator-deployed plain-text question child + standalone
    {
      outcome: 10233,
      name: 'Argentina',
      description:
        'This outcome resolves to Yes if Argentina is officially declared the 2026 HYPURR World Cup champion.',
      sideSpecs: [{ name: 'Yes' }, { name: 'No' }],
      quoteToken: 'USDC'
    },
    {
      outcome: 10231,
      name: 'Fallback',
      description: '',
      sideSpecs: [{ name: 'Yes' }, { name: 'No' }],
      quoteToken: 'USDC'
    },
    {
      outcome: 10225,
      name: 'June Fed rate change',
      description:
        'The market resolves to Change if the upper bound of the target federal funds rate range in the FOMC statement differs from the prior one.',
      sideSpecs: [{ name: 'Change' }, { name: 'No Change' }],
      quoteToken: 'USDC'
    }
  ],
  questions: [
    {
      question: 1377,
      name: 'Recurring',
      description:
        'class:priceBucket|underlying:BTC|expiry:20260920-0600|priceThresholds:79526,82772|period:1d',
      fallbackOutcome: 20202,
      namedOutcomes: [20203, 20204, 20205],
      settledNamedOutcomes: []
    },
    {
      question: 271,
      name: 'template:sportsContestResult',
      description:
        'competition:LIGUE1|contestType:game|countedPlay:regulation time, including stoppage time|officialSource:ESPN|participantA:Paris Saint-Germain|participantB:Marseille|resolutionDeadline:20260921-0045|scheduledStart:20260920-1845|season:2026|sport:soccer|stage:Regular Season',
      fallbackOutcome: 3016,
      namedOutcomes: [3017, 3018, 3019],
      settledNamedOutcomes: []
    },
    {
      question: 198,
      name: 'template:sportsTournamentWinner',
      description:
        'competition:English Premier League|officialSource:English Premier League|resolutionDeadline:20270605-1200|season:2026/2027|sport:football/soccer',
      fallbackOutcome: 1472,
      namedOutcomes: [1473],
      settledNamedOutcomes: []
    },
    {
      question: 500,
      name: '2026 HYPURR World Cup winner',
      description: 'Which nation will be declared the 2026 HYPURR World Cup champion?',
      fallbackOutcome: 10231,
      namedOutcomes: [10233],
      settledNamedOutcomes: []
    }
  ]
}

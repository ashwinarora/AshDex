export interface BarData {
  time: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export const INTERVALS = [
  '1',
  '3',
  '5',
  '15',
  '30',
  '60',
  '120',
  '240',
  '480',
  '720',
  '1D',
  '3D',
  '1W',
  '1M'
] as const

export type IntervalType = (typeof INTERVALS)[number]

export interface TradingViewWidget {
  new (config: TradingViewWidgetConfig): TradingViewWidgetInstance
}

export interface TradingViewWidgetInstance {
  remove(): void
  onChartReady(callback: () => void): void
  activeChart(): {
    setSymbol: (symbol: string, interval: string) => void
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    createShape: (point: { price: number }, options: any) => Promise<string>
    removeAllShapes: () => void
    removeEntity: (shapeId: string) => void
  }
}

export interface ThemeColors {
  color1: string[]
  color2: string[]
  color3: string[]
  color4: string[]
  color5: string[]
  color6: string[]
  color7: string[]
  white: string
  black: string
}

export interface CustomThemes {
  dark: ThemeColors
  light: ThemeColors
}

export interface TradingViewWidgetConfig {
  symbol: string
  debug: boolean
  interval: string
  timeframe: string
  container: HTMLElement | null
  datafeed: Datafeed
  library_path: string
  locale: string
  theme: string
  autosize: boolean
  disabled_features: string[]
  overrides: Record<string, string>
  custom_themes: CustomThemes
}

export interface PeriodParams {
  countBack: number
  firstDataRequest: boolean
  from: number
  to: number
}

export interface Datafeed {
  onReady: (callback: DatafeedCallback) => void
  resolveSymbol: (symbolName: string, onResolve: (symbolInfo: SymbolInfo) => void) => void
  getBars: (
    symbolInfo: SymbolInfo,
    resolution: IntervalType,
    periodParams: PeriodParams,
    onHistoryCallback: HistoryCallback,
    onErrorCallback: ErrorCallback
  ) => void
  subscribeBars: (
    symbolInfo: SymbolInfo,
    resolution: IntervalType,
    onRealtimeCallback: RealtimeCallback,
    subscriberUID: string
  ) => void
  unsubscribeBars: (subscriberUID: string) => void
}

export interface DatafeedCallback {
  (data: { supported_resolutions: readonly string[] }): void
}

export interface SymbolInfo {
  symbol: string
  exchange: string
  type: string
  session: string
  timezone: string
  supported_resolutions: readonly string[]
  pricescale: number
  minmov: number
  has_intraday: boolean
  has_daily: boolean
  has_weekly_and_monthly: boolean
}

export interface HistoryCallback {
  (bars: BarData[], meta: { noData: boolean }): void
}

export interface ErrorCallback {
  (error: string): void
}

export interface RealtimeCallback {
  (bar: BarData): void
}

export const customThemes = {
  dark: {
    color1: [
      '#fbefea',
      '#f7dfd5',
      '#f3cfc0',
      '#efbfaa',
      '#ebaf95',
      '#e89f80',
      '#e48f6b',
      '#e07f56',
      '#dc6f41',
      '#5F46F9',
      '#d03f01',
      '#5F46F9',
      '#ad3501',
      '#9c2f01',
      '#8b2a01',
      '#792501',
      '#682001',
      '#571a00',
      '#451500',
      '#341000'
    ],
    color2: [
      '#e4e4e5',
      '#d7d6d8',
      '#cac8cb',
      '#bcbabe',
      '#afadb1',
      '#a29fa4',
      '#949197',
      '#87848a',
      '#7a767e',
      '#6c6871',
      '#5f5a64',
      '#524d57',
      '#443f4a',
      '#37313d',
      '#2a2330',
      '#140B1E',
      '#140B1E',
      '#140B1E',
      '#0a050f',
      '#050307'
    ],
    color3: [
      '#e2464a',
      '#e2464a',
      '#e2464a',
      '#e2464a',
      '#e2464a',
      '#e2464a',
      '#e2464a',
      '#e2464a',
      '#e2464a',
      '#e2464a',
      '#e2464a',
      '#e2464a',
      '#e2464a',
      '#e2464a',
      '#e2464a',
      '#e2464a',
      '#e2464a',
      '#e2464a',
      '#e2464a',
      '#e2464a'
    ],
    color4: [
      '#2fa766',
      '#2fa766',
      '#2fa766',
      '#2fa766',
      '#2fa766',
      '#2fa766',
      '#2fa766',
      '#2fa766',
      '#2fa766',
      '#2fa766',
      '#2fa766',
      '#2fa766',
      '#2fa766',
      '#2fa766',
      '#2fa766',
      '#2fa766',
      '#2fa766',
      '#2fa766',
      '#2fa766',
      '#2fa766'
    ],
    color5: [
      '#fffff0',
      '#ffffe0',
      '#feffd1',
      '#feffc2',
      '#feffb2',
      '#feffa3',
      '#fdff94',
      '#fdff84',
      '#fdff75',
      '#fdff66',
      '#fcff47',
      '#e7ea41',
      '#d2d53b',
      '#bdbf35',
      '#a8aa2f',
      '#939529',
      '#7e8024',
      '#696a1e',
      '#545518',
      '#3f4012'
    ],
    color6: [
      '#fff1ff',
      '#ffe2ff',
      '#ffd4ff',
      '#ffc5ff',
      '#ffb7ff',
      '#ffa9ff',
      '#ff9aff',
      '#ff8cff',
      '#ff7dff',
      '#ff6fff',
      '#ff52ff',
      '#ea4bea',
      '#d544d5',
      '#bf3ebf',
      '#aa37aa',
      '#953095',
      '#802980',
      '#6a226a',
      '#551b55',
      '#401540'
    ],
    color7: [
      '#eff8ff',
      '#dff1ff',
      '#cfeaff',
      '#bee3ff',
      '#aedcff',
      '#9ed5ff',
      '#8eceff',
      '#7ec7ff',
      '#6ec0ff',
      '#5db9ff',
      '#3dabff',
      '#389dea',
      '#338fd5',
      '#2e80bf',
      '#2972aa',
      '#246495',
      '#1f5680',
      '#19476a',
      '#143955',
      '#0f2b40'
    ],
    white: '#ffffff',
    black: '#000000'
  },
  light: {
    color1: [
      '#fbefea',
      '#f7dfd5',
      '#f3cfc0',
      '#efbfaa',
      '#ebaf95',
      '#e89f80',
      '#e48f6b',
      '#e07f56',
      '#dc6f41',
      '#d85f2b',
      '#d03f01',
      '#bf3a01',
      '#ad3501',
      '#9c2f01',
      '#8b2a01',
      '#792501',
      '#682001',
      '#571a00',
      '#451500',
      '#341000'
    ],
    color2: [
      '#e4e4e5',
      '#d7d6d8',
      '#cac8cb',
      '#bcbabe',
      '#afadb1',
      '#a29fa4',
      '#949197',
      '#87848a',
      '#7a767e',
      '#6c6871',
      '#5f5a64',
      '#524d57',
      '#443f4a',
      '#37313d',
      '#2a2330',
      '#1c1623',
      '#0f0816',
      '#0F0816',
      '#0a050f',
      '#050307'
    ],
    color3: [
      '#fff0f0',
      '#ffe1e1',
      '#ffd3d3',
      '#ffc4c4',
      '#ffb5b5',
      '#ffa6a6',
      '#ff9797',
      '#ff8888'
    ],
    color4: [
      '#f2fdf8',
      '#e5faf0',
      '#d7f8e9',
      '#caf5e1',
      '#bdf3da',
      '#b0f1d2',
      '#a2eecb',
      '#95ecc3',
      '#88e9bc',
      '#7be7b4',
      '#60e2a5',
      '#58cf97',
      '#50bc8a',
      '#48aa7c',
      '#40976e',
      '#388460',
      '#307153',
      '#285e45',
      '#204b37',
      '#183929'
    ],
    color5: [
      '#fef5ea',
      '#fdecd5',
      '#fbe2bf',
      '#fad9aa',
      '#f9cf95',
      '#f8c680',
      '#f6bc6a',
      '#f5b255',
      '#f4a940',
      '#f39f2b',
      '#f08c00',
      '#dc8000',
      '#c87500',
      '#b46900',
      '#a05d00',
      '#8c5200',
      '#784600',
      '#643a00',
      '#502f00',
      '#3c2300'
    ],
    color6: [
      '#feeafe',
      '#fcd5fc',
      '#fbbffb',
      '#f9aaf9',
      '#f895f8',
      '#f780f7',
      '#f56af5',
      '#f455f4',
      '#f240f2',
      '#f12bf1',
      '#ee00ee',
      '#da00da',
      '#c600c6',
      '#b300b3',
      '#9f009f',
      '#8b008b',
      '#770077',
      '#630063',
      '#4f004f',
      '#3c003c'
    ],
    color7: [
      '#fefeea',
      '#fcfcd5',
      '#fbfbbf',
      '#f9f9aa',
      '#f8f895',
      '#f7f780',
      '#f5f56a',
      '#f4f455',
      '#f2f240',
      '#f1f12b',
      '#eeee00',
      '#dada00',
      '#c6c600',
      '#b3b300',
      '#9f9f00',
      '#8b8b00',
      '#777700',
      '#636300',
      '#4f4f00',
      '#3c3c00'
    ],
    white: '#f2e6ff',
    black: '#421b50'
  }
}

export const UNIT_TYPES = ['berat', 'volume', 'hitungan'] as const
export type UnitType = (typeof UNIT_TYPES)[number]

/** Units are never reviewed, so unlike bahan and equipment they are only active or inactive. */
export const UNIT_STATUSES = ['active', 'inactive'] as const
export type UnitStatus = (typeof UNIT_STATUSES)[number]

export const CONVERSION_SCOPES = ['global', 'per-bahan'] as const
export type ConversionScope = (typeof CONVERSION_SCOPES)[number]

export type Unit = {
  id: string
  name: string
  /** Other spellings users may type. */
  aliases: string[]
  type: UnitType
  symbol: string
  /** The reference unit of its type; other units convert to it. */
  isBase: boolean
  /** The base unit this one converts to; null for a base unit. */
  baseUnitId: string | null
  status: UnitStatus
  /** How many conversion rules involve this unit. */
  ruleCount: number
  /** How many recipes use this unit. */
  recipeCount: number
}

export type UnitRef = {
  id: string
  name: string
  symbol: string
}

export type BaseUnitOption = UnitRef & { type: UnitType }

export type BasisFilter = 'all' | 'base' | 'derived'
export type RulesFilter = 'all' | 'has-rules' | 'no-rules'

export type UnitListParams = {
  search: string
  types: UnitType[]
  basis: BasisFilter
  status: UnitStatus | 'all'
  rules: RulesFilter
  /** 1-based. */
  page: number
  pageSize: number
}

export type UnitListResult = {
  items: Unit[]
  total: number
}

export type UnitFormValues = {
  name: string
  aliases: string[]
  type: UnitType
  symbol: string
  isBase: boolean
  baseUnitId: string | null
  status: UnitStatus
}

/** An existing unit that already uses the symbol being typed. */
export type UnitDuplicate = { unit: Unit }

export type Conversion = {
  id: string
  from: UnitRef
  to: UnitRef
  /** 1 `from` = `factor` × `to`. */
  factor: number
  scope: ConversionScope
  /** Set for a per-bahan conversion. */
  bahanName: string | null
  status: UnitStatus
}

export type ConversionListParams = {
  search: string
  scope: ConversionScope | 'all'
  /** Unit id, or 'all'. */
  fromId: string
  toId: string
  status: UnitStatus | 'all'
  /** 1-based. */
  page: number
  pageSize: number
}

export type ConversionListResult = {
  items: Conversion[]
  total: number
}

export type ConversionFormValues = {
  fromId: string
  toId: string
  factor: number
  scope: ConversionScope
  bahanName: string | null
  status: UnitStatus
}

/** The same pair (for the same bahan, when per-bahan) that already has a conversion. */
export type ConversionDuplicate = { conversion: Conversion }

export type UnitCounts = { units: number; conversions: number; byType: Record<UnitType, number> }

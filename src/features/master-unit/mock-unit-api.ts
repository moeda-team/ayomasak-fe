import { failLoadIfMocked, isMockMode } from '@/lib/mock-load-failure'
import type {
  BaseUnitOption,
  Conversion,
  ConversionDuplicate,
  ConversionFormValues,
  ConversionListParams,
  ConversionListResult,
  ConversionScope,
  Unit,
  UnitCounts,
  UnitDuplicate,
  UnitFormValues,
  UnitListParams,
  UnitListResult,
  UnitRef,
  UnitStatus,
  UnitType,
} from './unit-types'

/**
 * MOCK: replace each function with a real request. The signatures are what the hooks depend on.
 *
 * Saving a unit whose name contains {@link FAILING_NAME_MARKER}, or a conversion whose factor is
 * {@link FAILING_FACTOR}, fails on purpose so the error toast can be seen without a broken backend.
 * Deactivating that unit, or deleting that conversion, fails too.
 */
const MOCK_LATENCY_MS = 600
export const FAILING_NAME_MARKER = 'fail'
export const FAILING_FACTOR = 999

const wait = () => new Promise((resolve) => setTimeout(resolve, MOCK_LATENCY_MS))

type StoredUnit = Omit<Unit, 'ruleCount'>

type UnitSeed = [
  name: string,
  aliases: string[],
  type: UnitType,
  symbol: string,
  baseSymbol: string | null,
  status: UnitStatus,
  recipeCount: number,
]

const UNIT_SEED: UnitSeed[] = [
  ['Gram', ['gr', 'gramme'], 'berat', 'g', null, 'active', 48],
  ['Mililiter', ['milliliter', 'cc'], 'volume', 'ml', null, 'active', 31],
  ['Sendok Makan', ['sdm', 'tablespoon'], 'volume', 'tbsp', 'ml', 'active', 26],
  ['Buah', ['biji', 'pcs'], 'hitungan', 'pcs', null, 'active', 19],
  ['Sendok Teh', ['sdt', 'teaspoon'], 'volume', 'tsp', 'ml', 'active', 22],
  ['Porsi', ['serving'], 'hitungan', 'porsi', null, 'inactive', 12],
  ['Kilogram', ['kilo'], 'berat', 'kg', 'g', 'active', 9],
  ['Liter', ['litre'], 'volume', 'l', 'ml', 'active', 7],
  ['Siung', ['clove'], 'hitungan', 'siung', null, 'active', 14],
]

const unitDb: StoredUnit[] = UNIT_SEED.map(([name, aliases, type, symbol, , status, recipeCount], index) => ({
  id: `unit-${index + 1}`,
  name,
  aliases,
  type,
  symbol,
  isBase: false,
  baseUnitId: null,
  status,
  recipeCount,
}))

UNIT_SEED.forEach(([, , , , baseSymbol], index) => {
  const unit = unitDb[index]
  if (!unit) return
  const base = baseSymbol === null ? undefined : unitDb.find((candidate) => candidate.symbol === baseSymbol)
  unit.isBase = base === undefined
  unit.baseUnitId = base?.id ?? null
})

const unitBySymbol = (symbol: string) => {
  const unit = unitDb.find((candidate) => candidate.symbol === symbol)
  if (!unit) throw new Error(`Seed refers to a missing unit: ${symbol}`)
  return unit.id
}

type StoredConversion = Omit<Conversion, 'from' | 'to'> & { fromId: string; toId: string }

const conversionDb: StoredConversion[] = [
  ['tbsp', 'ml', 15, 'global', null, 'active'],
  ['tsp', 'ml', 5, 'global', null, 'active'],
  ['kg', 'g', 1000, 'global', null, 'active'],
  ['l', 'ml', 1000, 'global', null, 'active'],
  ['pcs', 'g', 50, 'per-bahan', 'Telur Ayam', 'active'],
  ['siung', 'g', 5, 'per-bahan', 'Bawang Putih', 'inactive'],
].map(([from, to, factor, scope, bahanName, status], index) => ({
  id: `conversion-${index + 1}`,
  fromId: unitBySymbol(String(from)),
  toId: unitBySymbol(String(to)),
  factor: Number(factor),
  scope: scope as ConversionScope,
  bahanName: bahanName === null ? null : String(bahanName),
  status: status as UnitStatus,
}))

const MOCK_BAHAN_NAMES = ['Telur Ayam', 'Bawang Putih', 'Bawang Merah', 'Kemiri', 'Tahu', 'Tempe', 'Wortel', 'Tomat', 'Jeruk Nipis']

const normalize = (text: string) => text.trim().toLowerCase()

const visibleUnits = () => (isMockMode('empty') ? [] : unitDb)
const visibleConversions = () => (isMockMode('empty') ? [] : conversionDb)

const toRef = ({ id, name, symbol }: StoredUnit): UnitRef => ({ id, name, symbol })

const requireUnit = (id: string) => {
  const unit = unitDb.find((candidate) => candidate.id === id)
  if (!unit) throw new Error('This unit no longer exists.')
  return unit
}

const ruleCountOf = (unitId: string) =>
  visibleConversions().filter((conversion) => conversion.fromId === unitId || conversion.toId === unitId).length

const toUnit = (unit: StoredUnit): Unit => ({ ...unit, aliases: [...unit.aliases], ruleCount: ruleCountOf(unit.id) })

const toConversion = (conversion: StoredConversion): Conversion => ({
  id: conversion.id,
  from: toRef(requireUnit(conversion.fromId)),
  to: toRef(requireUnit(conversion.toId)),
  factor: conversion.factor,
  scope: conversion.scope,
  bahanName: conversion.bahanName,
  status: conversion.status,
})

const paginate = <TItem>(items: TItem[], page: number, pageSize: number) => {
  const start = (page - 1) * pageSize
  return items.slice(start, start + pageSize)
}

// ---- Units ----

const matchesUnit = (unit: StoredUnit, params: UnitListParams) => {
  const needle = normalize(params.search)
  const ruleCount = ruleCountOf(unit.id)
  return (
    (needle === '' || [unit.name, unit.symbol, ...unit.aliases].some((text) => normalize(text).includes(needle))) &&
    (params.types.length === 0 || params.types.includes(unit.type)) &&
    (params.basis === 'all' || unit.isBase === (params.basis === 'base')) &&
    (params.status === 'all' || unit.status === params.status) &&
    (params.rules === 'all' || (params.rules === 'has-rules') === ruleCount > 0)
  )
}

export const fetchUnitList = async (params: UnitListParams): Promise<UnitListResult> => {
  failLoadIfMocked('fetchUnitList')
  await wait()
  const filtered = visibleUnits().filter((unit) => matchesUnit(unit, params))
  return { items: paginate(filtered, params.page, params.pageSize).map(toUnit), total: filtered.length }
}

export const fetchUnitCounts = async (): Promise<UnitCounts> => {
  await wait()
  const units = visibleUnits()
  return {
    units: units.length,
    conversions: visibleConversions().length,
    byType: {
      berat: units.filter((unit) => unit.type === 'berat').length,
      volume: units.filter((unit) => unit.type === 'volume').length,
      hitungan: units.filter((unit) => unit.type === 'hitungan').length,
    },
  }
}

/** Every unit, for the pickers on the conversion form and the filters. */
export const fetchUnitRefs = async (): Promise<UnitRef[]> => {
  await wait()
  return visibleUnits().map(toRef)
}

/** Base units a derived unit can convert to; `ignoreId` skips the unit being edited. */
export const fetchBaseUnits = async (ignoreId?: string): Promise<BaseUnitOption[]> => {
  await wait()
  return unitDb.filter((unit) => unit.isBase && unit.id !== ignoreId).map((unit) => ({ ...toRef(unit), type: unit.type }))
}

/** The unit that already uses `symbol`; `ignoreId` skips the one being edited. */
export const findDuplicateUnitSymbol = async (symbol: string, ignoreId?: string): Promise<UnitDuplicate | null> => {
  await wait()
  const needle = normalize(symbol)
  const unit = unitDb.find((candidate) => candidate.id !== ignoreId && normalize(candidate.symbol) === needle)
  return unit ? { unit: toUnit(unit) } : null
}

const assertCanSaveUnit = (name: string) => {
  if (normalize(name).includes(FAILING_NAME_MARKER)) throw new Error('The server rejected this request.')
}

export const createUnit = async (values: UnitFormValues): Promise<Unit> => {
  await wait()
  assertCanSaveUnit(values.name)
  const unit: StoredUnit = { ...values, id: `unit-${crypto.randomUUID()}`, recipeCount: 0 }
  unitDb.unshift(unit)
  return toUnit(unit)
}

export const updateUnit = async (id: string, values: UnitFormValues): Promise<Unit> => {
  await wait()
  assertCanSaveUnit(values.name)
  const unit = requireUnit(id)
  Object.assign(unit, values)
  return toUnit(unit)
}

export const deactivateUnit = async (id: string): Promise<void> => {
  await wait()
  const unit = requireUnit(id)
  assertCanSaveUnit(unit.name)
  unit.status = 'inactive'
}

// ---- Conversions ----

const matchesConversion = (conversion: StoredConversion, params: ConversionListParams) => {
  const needle = normalize(params.search)
  const from = requireUnit(conversion.fromId)
  const to = requireUnit(conversion.toId)
  return (
    (needle === '' ||
      [from.name, from.symbol, to.name, to.symbol, conversion.bahanName ?? ''].some((text) => normalize(text).includes(needle))) &&
    (params.scope === 'all' || conversion.scope === params.scope) &&
    (params.fromId === 'all' || conversion.fromId === params.fromId) &&
    (params.toId === 'all' || conversion.toId === params.toId) &&
    (params.status === 'all' || conversion.status === params.status)
  )
}

export const fetchConversionList = async (params: ConversionListParams): Promise<ConversionListResult> => {
  failLoadIfMocked('fetchConversionList')
  await wait()
  const filtered = visibleConversions().filter((conversion) => matchesConversion(conversion, params))
  return { items: paginate(filtered, params.page, params.pageSize).map(toConversion), total: filtered.length }
}

/** Bahan a per-bahan conversion can apply to. */
export const fetchBahanNames = async (): Promise<string[]> => {
  await wait()
  return MOCK_BAHAN_NAMES
}

type ConversionKey = Pick<ConversionFormValues, 'fromId' | 'toId' | 'scope' | 'bahanName'>

/** The conversion that already covers this from → to pair (for the same bahan, when per-bahan). */
export const findDuplicateConversion = async (key: ConversionKey, ignoreId?: string): Promise<ConversionDuplicate | null> => {
  await wait()
  const conversion = conversionDb.find(
    (candidate) =>
      candidate.id !== ignoreId &&
      candidate.fromId === key.fromId &&
      candidate.toId === key.toId &&
      candidate.scope === key.scope &&
      (key.scope === 'global' || candidate.bahanName === key.bahanName),
  )
  return conversion ? { conversion: toConversion(conversion) } : null
}

const assertCanSaveConversion = (factor: number) => {
  if (factor === FAILING_FACTOR) throw new Error('The server rejected this request.')
}

export const createConversion = async (values: ConversionFormValues): Promise<Conversion> => {
  await wait()
  assertCanSaveConversion(values.factor)
  const conversion: StoredConversion = { ...values, id: `conversion-${crypto.randomUUID()}` }
  conversionDb.unshift(conversion)
  return toConversion(conversion)
}

export const updateConversion = async (id: string, values: ConversionFormValues): Promise<Conversion> => {
  await wait()
  assertCanSaveConversion(values.factor)
  const conversion = conversionDb.find((candidate) => candidate.id === id)
  if (!conversion) throw new Error('This conversion no longer exists.')
  Object.assign(conversion, values)
  return toConversion(conversion)
}

export const deleteConversion = async (id: string): Promise<void> => {
  await wait()
  const index = conversionDb.findIndex((candidate) => candidate.id === id)
  if (index === -1) throw new Error('This conversion no longer exists.')
  const conversion = conversionDb[index]
  if (conversion) assertCanSaveConversion(conversion.factor)
  conversionDb.splice(index, 1)
}

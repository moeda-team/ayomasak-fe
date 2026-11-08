/** Local calendar day as "YYYY-MM-DD", which is what the mock APIs compare against. */
export const toIsoDay = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`

export const fromIsoDay = (day: string) => {
  const [year, month, date] = day.split('-').map(Number)
  return new Date(year ?? 0, (month ?? 1) - 1, date ?? 1)
}

/**
 * Safe date formatter — appends T12:00:00 to date-only strings
 * to avoid UTC midnight timezone rollback (off-by-one-day bug).
 */
const safeParse = (dateString: string): Date => {
  const safe = dateString.includes('T') ? dateString : dateString + 'T12:00:00'
  return new Date(safe)
}

export const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return '-'
  return safeParse(dateString).toLocaleDateString('nl-NL', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export const formatDateLong = (dateString: string | null | undefined): string => {
  if (!dateString) return '-'
  return safeParse(dateString).toLocaleDateString('nl-NL', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export const formatDateWithWeekday = (dateString: string | null | undefined): string => {
  if (!dateString) return '-'
  return safeParse(dateString).toLocaleDateString('nl-NL', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export const formatDateShort = (dateString: string | null | undefined): string => {
  if (!dateString) return '-'
  return safeParse(dateString).toLocaleDateString('nl-NL', {
    month: 'short',
    day: 'numeric',
  })
}

export const formatDateTime = (dateString: string | null | undefined): string => {
  if (!dateString) return '-'
  return safeParse(dateString).toLocaleDateString('nl-NL', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

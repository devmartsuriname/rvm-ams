export const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('nl-NL', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

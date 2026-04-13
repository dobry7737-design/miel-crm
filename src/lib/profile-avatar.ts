/** Émis après mise à jour ou suppression de la photo profil (même onglet). */
export const PROFILE_AVATAR_CHANGED_EVENT = 'fab-profile-avatar-changed' as const

export const MAX_PROFILE_AVATAR_BYTES = 1.5 * 1024 * 1024

export function profileAvatarStorageKey(userId: string) {
  return `fab_profile_avatar_${userId}`
}

export function readStoredProfileAvatarUrl(userId: string): string | null {
  if (typeof window === 'undefined' || !userId) return null
  try {
    const raw = localStorage.getItem(profileAvatarStorageKey(userId))
    return raw && raw.startsWith('data:image/') ? raw : null
  } catch {
    return null
  }
}

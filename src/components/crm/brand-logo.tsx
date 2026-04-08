'use client'

import Image from 'next/image'
import { cn } from '@/lib/utils'

/** Fichier dans `public/logo-miel.png` */
export const BRAND_LOGO_PATH = '/logo-miel.png'

/** Dimensions intrinsèques pour un logo paysage (le rendu est contrôlé par `className`). */
const INTRINSIC_W = 720
const INTRINSIC_H = 320

type BrandLogoProps = {
  className?: string
  priority?: boolean
}

export function BrandLogo({ className, priority }: BrandLogoProps) {
  return (
    <Image
      src={BRAND_LOGO_PATH}
      alt="Ferme Agri Bio"
      width={INTRINSIC_W}
      height={INTRINSIC_H}
      sizes="(max-width: 640px) 85vw, 360px"
      className={cn('object-contain', className)}
      priority={priority}
    />
  )
}

'use client'

import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import {
  User,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  LogIn,
  AlertCircle,
  Sparkles,
} from 'lucide-react'
import { BrandLogo } from '@/components/crm/brand-logo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { Phone } from 'lucide-react'
import { DEMO_USERS, type DemoUser } from '@/lib/demo-users'

interface LoginFormProps {
  onLogin: (phone: string, password: string) => Promise<void>
}

const ease = [0.16, 1, 0.3, 1] as const

/** Libellés courts pour tenir sur une ligne sans défilement horizontal */
function demoButtonLabel(u: DemoUser): string {
  if (u.role === 'COMMERCIAL') return 'Commercial'
  return u.name
}

export function LoginForm({ onLogin }: LoginFormProps) {
  const [name, setName] = useState('')
  const [passwordKey, setPasswordKey] = useState(0)
  const [passwordPreset, setPasswordPreset] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const nameInputRef = useRef<HTMLInputElement>(null)
  const passwordInputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)
    try {
      const nameFromDom = nameInputRef.current?.value
      const passFromDom = passwordInputRef.current?.value
      const resolvedName = (nameFromDom ?? name).trim()
      const resolvedPass = (passFromDom ?? '').trim()
      await onLogin(resolvedName, resolvedPass)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur de connexion')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative isolate flex min-h-[100dvh] min-h-screen items-center justify-center overflow-hidden p-4 sm:p-6">
      <img
        src="/login_background.png"
        alt=""
        width={1920}
        height={1080}
        decoding="async"
        fetchPriority="high"
        className="pointer-events-none absolute inset-0 z-0 h-full w-full object-cover object-center"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-b from-black/25 via-black/5 to-black/45 dark:from-black/50 dark:via-black/20 dark:to-black/60"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 z-[1] bg-primary/15 dark:bg-primary/20"
        aria-hidden
      />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease }}
        className="relative z-10 w-full max-w-[440px]"
      >
        <div
          className="overflow-hidden rounded-2xl border border-white/30 bg-background/70 shadow-2xl shadow-black/25 ring-1 ring-white/20 backdrop-blur-2xl dark:border-white/12 dark:bg-background/50 dark:shadow-black/50 dark:ring-white/10"
          role="region"
          aria-label="Connexion"
        >
          <div className="relative px-6 py-8 sm:px-8 sm:py-10">
            <div className="absolute right-4 top-4 flex items-center gap-1 rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary dark:border-primary/30 dark:bg-primary/15">
              <Sparkles className="h-3 w-3 shrink-0" aria-hidden />
              v2
            </div>

            <div className="mx-auto flex max-w-[min(100%,300px)] justify-center pt-2">
              <BrandLogo
                priority
                className="h-[5.25rem] w-auto max-h-[8.5rem] object-contain sm:h-32 sm:max-h-36"
              />
            </div>

            <div className="mt-6 space-y-1 text-center">
              <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                Ferme Agri Bio
              </h1>
              <p className="text-sm text-muted-foreground">
                Gestion commerciale — agriculture biologique
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="mt-8 space-y-4"
              autoComplete="off"
            >


              <div className="space-y-3">
                <Label htmlFor="name" className="text-sm font-medium">
                  Numéro de téléphone (ou 'admin')
                </Label>
                <div className="relative">
                  <Phone
                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                    aria-hidden
                  />
                  <Input
                    ref={nameInputRef}
                    id="phone"
                    type="tel"
                    name="phone"
                    placeholder="Ex: 77 123 45 67"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    autoComplete="off"
                    className="h-12 border-border/80 bg-background/80 pl-10 shadow-sm transition-shadow focus-visible:border-primary/50 focus-visible:ring-primary/20 dark:bg-background/50"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  Mot de passe
                </Label>
                <div className="relative">
                  <Lock
                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                    aria-hidden
                  />
                  <Input
                    key={`crm-pass-${passwordKey}`}
                    ref={passwordInputRef}
                    id="password"
                    name="crm_password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    defaultValue={passwordPreset}
                    required
                    autoComplete="new-password"
                    className="h-12 border-border/80 bg-background/80 pl-10 pr-11 shadow-sm transition-shadow focus-visible:border-primary/50 focus-visible:ring-primary/20 dark:bg-background/50"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 h-9 w-9 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  role="alert"
                  className="flex gap-3 rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-3 text-sm text-destructive dark:bg-destructive/15"
                >
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                  <span>{error}</span>
                </motion.div>
              )}

              <Button
                type="submit"
                className="h-12 w-full gap-2 bg-gradient-to-r from-primary to-emerald-700 text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:from-primary/95 hover:to-emerald-800 hover:shadow-primary/30 dark:shadow-primary/20"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin shrink-0" aria-hidden />
                    Connexion…
                  </>
                ) : (
                  <>
                    <LogIn className="h-4 w-4 shrink-0" aria-hidden />
                    Se connecter
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 flex justify-center text-sm font-medium">
              <Link href="/register" className="text-primary hover:underline">
                Première connexion ? Créer mon mot de passe
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

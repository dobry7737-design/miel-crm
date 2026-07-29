'use client'

import { useState } from 'react'
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { ThemeToggle } from '@/components/dashboard/theme-toggle'

export function LoginPage() {
  const { login, error, clearError, isLoading } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(true)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await login(email, password)
  }

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-slate-950">
      {/* Atmosphere */}
      <div className="absolute inset-0">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: 'url(/login-bg.png)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950/92 via-blue-950/88 to-emerald-950/90" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(37,99,235,0.18),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_80%,rgba(16,185,129,0.12),transparent_45%)]" />
      </div>

      <div className="absolute right-4 top-4 z-20 sm:right-6 sm:top-6">
        <ThemeToggle />
      </div>

      <div className="relative z-10 w-full max-w-[420px] px-4">
        {/* Solid opaque card — maximum form readability */}
        <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-[0_24px_64px_-12px_rgba(0,0,0,0.45)] dark:border-slate-700 dark:bg-slate-900">
          <div className="h-1.5 bg-gradient-to-r from-blue-600 via-emerald-500 to-blue-600" />

          <div className="px-7 py-8 sm:px-9 sm:py-9">
            {/* Logo — hero brand */}
            <div className="flex flex-col items-center text-center">
              <img
                src="/logo-AAM.png"
                alt="AAM — Assistances Assurances Mali"
                className="h-28 w-auto select-none object-contain sm:h-32"
                style={{ filter: 'drop-shadow(0 6px 16px rgba(0,0,0,0.14))' }}
              />
              <h1 className="mt-4 text-lg font-semibold tracking-tight text-slate-900 dark:text-white">
                Connexion
              </h1>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Assistances Assurances Mali
              </p>
            </div>

            {/* Brand separator */}
            <div
              className="my-6 flex items-center gap-3"
              role="separator"
              aria-hidden="true"
            >
              <div className="h-[2px] flex-1 rounded-full bg-gradient-to-r from-transparent via-slate-300 to-blue-400 dark:via-slate-600 dark:to-blue-500" />
              <span className="relative flex h-2.5 w-2.5 items-center justify-center">
                <span className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500 to-emerald-500 opacity-40 blur-[2px]" />
                <span className="relative h-2 w-2 rotate-45 rounded-[2px] bg-gradient-to-br from-blue-600 to-emerald-500 ring-2 ring-white dark:ring-slate-900" />
              </span>
              <div className="h-[2px] flex-1 rounded-full bg-gradient-to-l from-transparent via-slate-300 to-emerald-400 dark:via-slate-600 dark:to-emerald-500" />
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-5"
              onChange={() => {
                if (error) clearError()
              }}
            >
              {/* Email */}
              <div className="space-y-1.5">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-slate-700 dark:text-slate-200"
                >
                  Adresse email
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                  <input
                    id="email"
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ex. nom@aam.ml"
                    className="h-12 w-full rounded-xl border-2 border-slate-200 bg-slate-50 pl-11 pr-4 text-[15px] text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/15 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-50 dark:placeholder:text-slate-500 dark:focus:border-blue-400 dark:focus:bg-slate-800 dark:focus:ring-blue-400/20"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-slate-700 dark:text-slate-200"
                >
                  Mot de passe
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="h-12 w-full rounded-xl border-2 border-slate-200 bg-slate-50 pl-11 pr-12 text-[15px] text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/15 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-50 dark:placeholder:text-slate-500 dark:focus:border-blue-400 dark:focus:bg-slate-800 dark:focus:ring-blue-400/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-700 dark:hover:text-slate-200"
                    aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                  >
                    {showPassword ? (
                      <EyeOff className="h-[18px] w-[18px]" strokeWidth={2} />
                    ) : (
                      <Eye className="h-[18px] w-[18px]" strokeWidth={2} />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-0.5">
                <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="h-4 w-4 cursor-pointer rounded border-slate-300 text-blue-600 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800"
                  />
                  Rester connecté
                </label>
                <button
                  type="button"
                  className="cursor-pointer text-sm font-medium text-blue-600 transition hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  Mot de passe oublié ?
                </button>
              </div>

              {error && (
                <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/50 dark:text-red-300">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2} />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-[15px] font-semibold text-white shadow-lg shadow-blue-600/35 transition hover:from-blue-700 hover:to-blue-800 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isLoading ? 'Connexion…' : 'Se connecter'}
                {!isLoading && <ArrowRight className="h-5 w-5" strokeWidth={2.5} />}
              </button>
            </form>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-center gap-3 text-xs text-white/65">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="h-3 w-3 text-emerald-400" />
            Connexion sécurisée TLS
          </span>
          <span className="h-3 w-px bg-white/25" />
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="h-3 w-3 text-emerald-400" />
            Conforme CIMA
          </span>
        </div>
        <p className="mt-2 text-center text-[11px] text-white/45">© 2026 AAM</p>
      </div>
    </div>
  )
}

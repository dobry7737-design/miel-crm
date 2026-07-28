'use client'

import { useState } from 'react'
import {
  ShieldCheck,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  Users,
  Building2,
  UserCircle2,
  Briefcase,
  Headphones,
  CheckCircle2,
} from 'lucide-react'
import { useAuth, ROLE_LABELS, ROLE_DESCRIPTIONS, type Role } from '@/lib/auth'
import { cn } from '@/lib/utils'
import { ThemeToggle } from '@/components/dashboard/theme-toggle'

const ROLE_DEMOS: { role: Role; icon: typeof Users; email: string; password: string }[] = [
  { role: 'admin', icon: ShieldCheck, email: 'admin@aam.ml', password: 'admin' },
  { role: 'agent', icon: Briefcase, email: 'agent@aam.ml', password: 'agent' },
  { role: 'client', icon: UserCircle2, email: 'client@aam.ml', password: 'client' },
  { role: 'gestionnaire', icon: Headphones, email: 'sinistres@aam.ml', password: 'gest' },
  { role: 'correspondant', icon: Building2, email: 'partenaire@nsia.ml', password: 'part' },
]

export function LoginPage() {
  const { login, error, clearError } = useAuth()
  const [email, setEmail] = useState('admin@aam.ml')
  const [password, setPassword] = useState('admin')
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(true)
  const [selectedRole, setSelectedRole] = useState<Role>('admin')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    login(email, password)
  }

  const selectRole = (role: Role) => {
    const demo = ROLE_DEMOS.find((d) => d.role === role)
    if (demo) {
      setSelectedRole(role)
      setEmail(demo.email)
      setPassword(demo.password)
      clearError()
    }
  }

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-slate-100 dark:bg-slate-950">
      {/* Full-screen background image */}
      <div className="absolute inset-0">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: 'url(/login-bg.png)' }}
        />
        {/* Dark gradient overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950/90 via-blue-950/85 to-emerald-950/90" />
        {/* Subtle texture overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)]" />
      </div>

      {/* Large faded AAM logo watermark in background */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.06]">
        <img
          src="/logo-AAM.png"
          alt=""
          aria-hidden
          className="h-[60vh] max-h-[600px] w-auto select-none object-contain"
        />
      </div>

      {/* Theme toggle - top-right corner */}
      <div className="absolute right-4 top-4 z-20 sm:right-6 sm:top-6">
        <ThemeToggle />
      </div>

      {/* Centered login card */}
      <div className="relative z-10 w-full max-w-md px-4">
        <div className="overflow-hidden rounded-3xl border border-white/20 bg-white/80 shadow-2xl shadow-slate-950/30 backdrop-blur-2xl dark:border-slate-700/50 dark:bg-slate-900/85 dark:shadow-black/40">
          {/* Top accent bar with AAM brand colors */}
          <div className="h-1.5 bg-gradient-to-r from-blue-500 via-emerald-500 to-blue-500" />

          <div className="px-6 py-8 sm:px-8 sm:py-10">
            {/* Logo */}
            <div className="mb-6 flex flex-col items-center text-center">
              <img
                src="/logo-AAM.png"
                alt="AAM — Assistances Assurances Mali"
                className="h-16 w-auto select-none sm:h-20"
                style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.1))' }}
              />
              <p className="mt-3 text-xs font-medium tracking-wide text-slate-500 dark:text-slate-400">
                Assistances Assurances Mali
              </p>
              <div className="mt-4 flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                <CheckCircle2 className="h-3 w-3" />
                Courtier agréé CIMA
              </div>
            </div>

            {/* Heading */}
            <div className="mb-5">
              <h2 className="text-center text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                Connexion à votre espace
              </h2>
              <p className="mt-1.5 text-center text-sm text-slate-500 dark:text-slate-400">
                Sélectionnez votre profil et connectez-vous
              </p>
            </div>

            {/* Role selector (RBAC) — compact pills */}
            <div className="mb-5">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Profil RBAC
              </p>
              <div className="flex flex-wrap gap-1.5">
                {ROLE_DEMOS.map((demo) => {
                  const Icon = demo.icon
                  const isActive = selectedRole === demo.role
                  return (
                    <button
                      key={demo.role}
                      type="button"
                      onClick={() => selectRole(demo.role)}
                      className={cn(
                        'flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all',
                        isActive
                          ? 'border-blue-300 bg-blue-50 text-blue-700 ring-1 ring-blue-200 dark:border-blue-700 dark:bg-blue-900/40 dark:text-blue-300 dark:ring-blue-800'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:bg-slate-700'
                      )}
                    >
                      <Icon className="h-3.5 w-3.5" strokeWidth={2} />
                      {ROLE_LABELS[demo.role]}
                      {isActive && (
                        <CheckCircle2 className="ml-0.5 h-3 w-3 text-blue-500 dark:text-blue-400" strokeWidth={2.5} />
                      )}
                    </button>
                  )
                })}
              </div>
              {/* Selected role description */}
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                {ROLE_DESCRIPTIONS[selectedRole]}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300"
                >
                  Adresse email
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="vous@exemple.com"
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-blue-500 dark:focus:ring-blue-900/40"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="text-sm font-medium text-slate-700 dark:text-slate-300"
                  >
                    Mot de passe
                  </label>
                  <button
                    type="button"
                    className="text-xs font-medium text-blue-600 transition hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    Mot de passe oublié ?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-10 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-blue-500 dark:focus:ring-blue-900/40"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" strokeWidth={2} />
                    ) : (
                      <Eye className="h-4 w-4" strokeWidth={2} />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember */}
              <div className="flex items-center justify-between">
                <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800"
                  />
                  Rester connecté
                </label>
                <span className="text-[11px] text-slate-400 dark:text-slate-500">
                  2FA pour Admin/Agent
                </span>
              </div>

              {/* Error message */}
              {error && (
                <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-300">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2} />
                  <span>{error}</span>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-sm font-semibold text-white shadow-lg shadow-blue-600/30 transition hover:from-blue-700 hover:to-blue-800 active:scale-[0.99]"
              >
                Se connecter
                <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
              </button>
            </form>

            {/* Trust indicators */}
            <div className="mt-6 flex items-center justify-center gap-4 text-[11px] text-slate-400 dark:text-slate-500">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                TLS chiffré
              </span>
              <span className="h-3 w-px bg-slate-200 dark:bg-slate-700" />
              <span className="flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                Conforme CIMA
              </span>
              <span className="h-3 w-px bg-slate-200 dark:bg-slate-700" />
              <span className="flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                11 partenaires
              </span>
            </div>
          </div>
        </div>

        {/* Footer below card */}
        <p className="mt-6 text-center text-xs text-white/60 dark:text-slate-500">
          © 2026 AAM — Assistances Assurances Mali · Courtier agréé CIMA
          <br />
          <span className="text-white/40 dark:text-slate-600">
            En vous connectant, vous acceptez les CGU de la plateforme.
          </span>
        </p>
      </div>
    </div>
  )
}

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
        {/* Subtle vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.45)_100%)]" />
      </div>

      {/* Large faded AAM logo watermark in background */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.05]">
        <img
          src="/logo-AAM.png"
          alt=""
          aria-hidden
          className="h-[55vh] max-h-[520px] w-auto select-none object-contain"
        />
      </div>

      {/* Theme toggle - top-right corner */}
      <div className="absolute right-4 top-4 z-20 sm:right-6 sm:top-6">
        <ThemeToggle />
      </div>

      {/* Compact centered login card */}
      <div className="relative z-10 w-full max-w-sm px-4">
        <div className="overflow-hidden rounded-2xl border border-white/20 bg-white/85 shadow-2xl shadow-slate-950/30 backdrop-blur-2xl dark:border-slate-700/50 dark:bg-slate-900/85 dark:shadow-black/40">
          {/* Top accent bar with AAM brand colors */}
          <div className="h-1 bg-gradient-to-r from-blue-500 via-emerald-500 to-blue-500" />

          <div className="px-6 py-6 sm:px-7 sm:py-7">
            {/* Logo — prominent */}
            <div className="mb-5 flex flex-col items-center text-center">
              <img
                src="/logo-AAM.png"
                alt="AAM — Assistances Assurances Mali"
                className="h-14 w-auto select-none sm:h-16"
                style={{ filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.1))' }}
              />
              <p className="mt-2 text-[11px] font-medium tracking-wide text-slate-500 dark:text-slate-400">
                Assistances Assurances Mali
              </p>
            </div>

            {/* Role selector (RBAC) — compact pills */}
            <div className="mb-4">
              <div className="flex flex-wrap justify-center gap-1.5">
                {ROLE_DEMOS.map((demo) => {
                  const Icon = demo.icon
                  const isActive = selectedRole === demo.role
                  return (
                    <button
                      key={demo.role}
                      type="button"
                      onClick={() => selectRole(demo.role)}
                      title={ROLE_DESCRIPTIONS[demo.role]}
                      className={cn(
                        'flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-all',
                        isActive
                          ? 'border-blue-300 bg-blue-50 text-blue-700 ring-1 ring-blue-200 dark:border-blue-700 dark:bg-blue-900/40 dark:text-blue-300 dark:ring-blue-800'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:bg-slate-700'
                      )}
                    >
                      <Icon className="h-3 w-3" strokeWidth={2} />
                      {ROLE_LABELS[demo.role].split(' / ')[0]}
                      {isActive && (
                        <CheckCircle2 className="ml-0.5 h-2.5 w-2.5 text-blue-500 dark:text-blue-400" strokeWidth={2.5} />
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Email */}
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Adresse email"
                  className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-blue-500 dark:focus:ring-blue-900/40"
                />
              </div>

              {/* Password */}
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mot de passe"
                  className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-10 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-blue-500 dark:focus:ring-blue-900/40"
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

              {/* Remember + 2FA hint */}
              <div className="flex items-center justify-between">
                <label className="flex cursor-pointer items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="h-3.5 w-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800"
                  />
                  Rester connecté
                </label>
                <button
                  type="button"
                  className="text-[11px] font-medium text-blue-600 transition hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  Mot de passe oublié ?
                </button>
              </div>

              {/* Error message */}
              {error && (
                <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-2.5 text-xs text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-300">
                  <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" strokeWidth={2} />
                  <span>{error}</span>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-sm font-semibold text-white shadow-lg shadow-blue-600/30 transition hover:from-blue-700 hover:to-blue-800 active:scale-[0.99]"
              >
                Se connecter
                <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
              </button>
            </form>
          </div>
        </div>

        {/* Compact footer below card */}
        <div className="mt-4 flex items-center justify-center gap-3 text-[10px] text-white/60 dark:text-slate-500">
          <span className="flex items-center gap-1">
            <CheckCircle2 className="h-2.5 w-2.5 text-emerald-400" />
            TLS
          </span>
          <span className="h-2.5 w-px bg-white/20 dark:bg-slate-700" />
          <span className="flex items-center gap-1">
            <CheckCircle2 className="h-2.5 w-2.5 text-emerald-400" />
            Conforme CIMA
          </span>
          <span className="h-2.5 w-px bg-white/20 dark:bg-slate-700" />
          <span>© 2026 AAM</span>
        </div>
      </div>
    </div>
  )
}

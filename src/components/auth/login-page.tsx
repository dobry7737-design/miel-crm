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
    <div className="relative flex min-h-screen w-full overflow-hidden bg-slate-50">
      {/* Background image (left side) */}
      <div className="relative hidden w-1/2 lg:block">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: 'url(/login-bg.png)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/80 via-blue-900/70 to-emerald-900/80" />

        {/* Brand overlay */}
        <div className="absolute inset-0 flex flex-col justify-between p-12 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md ring-1 ring-white/20">
              <ShieldCheck className="h-6 w-6 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight">AAM</h2>
              <p className="text-xs text-blue-100/80">
                Assistances Assurances Mali
              </p>
            </div>
          </div>

          <div>
            <h1 className="mb-4 max-w-md text-4xl font-bold leading-tight tracking-tight">
              Assurance,{' '}
              <span className="text-emerald-300">simplifiée.</span>
            </h1>
            <p className="max-w-md text-base leading-relaxed text-blue-100/90">
              La plateforme de courtage en assurances qui compare les offres de
              11 compagnies agréées CIMA et permet la souscription en ligne.
            </p>

            <div className="mt-8 flex items-center gap-6 text-sm text-blue-100/80">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                15+ ans d&apos;expérience
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                10 000+ clients
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                98% satisfaits
              </div>
            </div>
          </div>

          <p className="text-xs text-blue-100/60">
            © 2026 AAM · Courtier en assurances agréé CIMA · Tous droits réservés
          </p>
        </div>
      </div>

      {/* Right side - login form */}
      <div className="flex w-full flex-col items-center justify-center px-6 py-10 sm:px-12 lg:w-1/2">
        <div className="w-full max-w-md">
          {/* Mobile brand */}
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-md shadow-blue-500/30">
              <ShieldCheck className="h-6 w-6 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight text-slate-900">
                AAM
              </h2>
              <p className="text-xs text-slate-500">Assistances Assurances Mali</p>
            </div>
          </div>

          {/* Heading */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              Connexion à votre espace
            </h2>
            <p className="mt-1.5 text-sm text-slate-500">
              Accédez à votre tableau de bord en fonction de votre profil
              utilisateur.
            </p>
          </div>

          {/* Role selector (RBAC) */}
          <div className="mb-6">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
              Sélectionnez votre profil (RBAC)
            </p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {ROLE_DEMOS.map((demo) => {
                const Icon = demo.icon
                const isActive = selectedRole === demo.role
                return (
                  <button
                    key={demo.role}
                    type="button"
                    onClick={() => selectRole(demo.role)}
                    className={cn(
                      'group flex items-start gap-3 rounded-xl border p-3 text-left transition-all',
                      isActive
                        ? 'border-blue-300 bg-blue-50 ring-2 ring-blue-100'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                    )}
                  >
                    <div
                      className={cn(
                        'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition',
                        isActive
                          ? 'bg-blue-500 text-white'
                          : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'
                      )}
                    >
                      <Icon className="h-4 w-4" strokeWidth={2} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p
                        className={cn(
                          'truncate text-sm font-semibold',
                          isActive ? 'text-blue-700' : 'text-slate-800'
                        )}
                      >
                        {ROLE_LABELS[demo.role]}
                      </p>
                      <p className="mt-0.5 line-clamp-2 text-xs text-slate-500">
                        {ROLE_DESCRIPTIONS[demo.role]}
                      </p>
                    </div>
                    {isActive && (
                      <CheckCircle2
                        className="h-4 w-4 shrink-0 text-blue-500"
                        strokeWidth={2.5}
                      />
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Adresse email
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="vous@exemple.com"
                  className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-slate-700"
                >
                  Mot de passe
                </label>
                <button
                  type="button"
                  className="text-xs font-medium text-blue-600 transition hover:text-blue-700"
                >
                  Mot de passe oublié ?
                </button>
              </div>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-10 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600"
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
              <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                Rester connecté
              </label>
              <span className="text-xs text-slate-400">
                2FA requise pour Admin/Agent
              </span>
            </div>

            {/* Error message */}
            {error && (
              <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2} />
                <span>{error}</span>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-blue-600 text-sm font-semibold text-white shadow-md shadow-blue-600/30 transition hover:bg-blue-700 active:scale-[0.99]"
            >
              Se connecter
              <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
            </button>
          </form>

          {/* Footer note */}
          <p className="mt-6 text-center text-xs text-slate-400">
            Connexion sécurisée · Données chiffrées TLS · Conforme CIMA
            <br />
            En vous connectant, vous acceptez les CGU de la plateforme AAM.
          </p>
        </div>
      </div>
    </div>
  )
}

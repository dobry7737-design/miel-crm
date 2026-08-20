'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { CheckCircle2, Eye, EyeOff, KeyRound, Loader2, ShieldAlert, XCircle } from 'lucide-react'

type Status = 'loading' | 'valid' | 'invalid' | 'expired' | 'success' | 'error'

function ActivationContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token') || ''

  const [status, setStatus] = useState<Status>('loading')
  const [userInfo, setUserInfo] = useState<{ name: string; email: string; role: string } | null>(null)
  const [message, setMessage] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!token) {
      setStatus('invalid')
      setMessage('Aucun token d\'activation fourni.')
      return
    }

    fetch(`/api/activation?token=${token}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.valid) {
          setStatus('valid')
          setUserInfo(data.user)
        } else if (data.error?.includes('expiré') || data.error?.includes('utilisé')) {
          setStatus('expired')
          setMessage(data.error)
        } else {
          setStatus('invalid')
          setMessage(data.error || 'Token invalide.')
        }
      })
      .catch(() => {
        setStatus('invalid')
        setMessage('Erreur de connexion au serveur.')
      })
  }, [token])

  async function handleActivate() {
    if (password.length < 8) return
    if (password !== confirm) return
    setSubmitting(true)

    try {
      const res = await fetch('/api/activation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })
      const data = await res.json()

      if (res.ok && data.success) {
        setStatus('success')
      } else {
        setStatus('error')
        setMessage(data.error || 'Erreur lors de l\'activation.')
      }
    } catch {
      setStatus('error')
      setMessage('Erreur de connexion au serveur.')
    } finally {
      setSubmitting(false)
    }
  }

  const ROLE_LABELS: Record<string, string> = {
    admin: 'Administrateur',
    agent: 'Agent / Courtier',
    client: 'Client / Assuré',
    gestionnaire: 'Gestionnaire Sinistres',
    correspondant: 'Correspondant Partenaire',
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-100 to-blue-50 px-4">
      <div className="w-full max-w-md">
        {/* Logo / Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 shadow-lg">
            <KeyRound className="h-7 w-7 text-white" strokeWidth={2} />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">AAM Assistances</h1>
          <p className="mt-1 text-sm text-slate-500">Activation de votre compte</p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
          {/* Loading */}
          {status === 'loading' && (
            <div className="flex flex-col items-center gap-3 px-8 py-12">
              <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
              <p className="text-sm text-slate-500">Vérification du lien d'activation…</p>
            </div>
          )}

          {/* Invalid / Error */}
          {(status === 'invalid' || status === 'expired' || status === 'error') && (
            <div className="flex flex-col items-center gap-4 px-8 py-12 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-rose-100">
                {status === 'expired' ? (
                  <ShieldAlert className="h-7 w-7 text-rose-600" />
                ) : (
                  <XCircle className="h-7 w-7 text-rose-600" />
                )}
              </div>
              <h2 className="text-lg font-bold text-slate-900">
                {status === 'expired' ? 'Lien expiré' : 'Lien invalide'}
              </h2>
              <p className="text-sm text-slate-500">{message}</p>
              <p className="text-xs text-slate-400">
                Contactez votre administrateur pour recevoir un nouveau lien d'invitation.
              </p>
              <a
                href="/"
                className="mt-2 inline-block rounded-full bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Retour à la connexion
              </a>
            </div>
          )}

          {/* Formulaire activation */}
          {status === 'valid' && userInfo && (
            <div className="px-8 py-8">
              <div className="mb-6 rounded-xl bg-blue-50 px-4 py-3 text-center">
                <p className="text-sm font-semibold text-blue-900">Bienvenue, {userInfo.name} !</p>
                <p className="mt-0.5 text-xs text-blue-600">{userInfo.email}</p>
                <span className="mt-2 inline-block rounded-full bg-blue-100 px-3 py-0.5 text-xs font-semibold text-blue-700">
                  {ROLE_LABELS[userInfo.role] || userInfo.role}
                </span>
              </div>

              <p className="mb-5 text-sm text-slate-600">
                Choisissez un mot de passe sécurisé pour activer votre compte. Il devra contenir au moins <strong>8 caractères</strong>.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600">Mot de passe</label>
                  <div className="relative">
                    <input
                      type={showPwd ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Minimum 8 caractères"
                      className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 pr-11 text-sm text-slate-800 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPwd((v) => !v)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                    >
                      {showPwd ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600">Confirmer le mot de passe</label>
                  <input
                    type={showPwd ? 'text' : 'password'}
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="Répétez votre mot de passe"
                    className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-800 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  />
                  {confirm && password !== confirm && (
                    <p className="mt-1 text-xs text-rose-500">Les mots de passe ne correspondent pas.</p>
                  )}
                </div>

                {/* Force password indicator */}
                {password.length > 0 && (
                  <div className="space-y-1">
                    <div className="flex gap-1">
                      {[...Array(4)].map((_, i) => {
                        const strength = Math.min(
                          Math.floor(password.length / 3) +
                          ((/[A-Z]/.test(password) ? 1 : 0) + (/[0-9]/.test(password) ? 1 : 0) + (/[^a-zA-Z0-9]/.test(password) ? 1 : 0)),
                          4
                        )
                        return (
                          <div
                            key={i}
                            className={`h-1.5 flex-1 rounded-full transition-colors ${
                              i < strength
                                ? strength <= 1 ? 'bg-rose-400' : strength <= 2 ? 'bg-amber-400' : strength <= 3 ? 'bg-blue-400' : 'bg-emerald-500'
                                : 'bg-slate-200'
                            }`}
                          />
                        )
                      })}
                    </div>
                    <p className="text-xs text-slate-400">
                      Force : {password.length < 8 ? 'trop court' : /[A-Z]/.test(password) && /[0-9]/.test(password) && /[^a-zA-Z0-9]/.test(password) ? 'Excellent ✓' : 'Acceptable'}
                    </p>
                  </div>
                )}

                <button
                  onClick={handleActivate}
                  disabled={!password || password.length < 8 || password !== confirm || submitting}
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submitting ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Activation en cours…</>
                  ) : (
                    'Activer mon compte'
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Succès */}
          {status === 'success' && (
            <div className="flex flex-col items-center gap-4 px-8 py-12 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                <CheckCircle2 className="h-9 w-9 text-emerald-600" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Compte activé !</h2>
              <p className="text-sm text-slate-500">
                Votre mot de passe a été défini avec succès. Vous pouvez maintenant vous connecter à la plateforme AAM.
              </p>
              <a
                href="/"
                className="mt-2 inline-block rounded-full bg-blue-600 px-8 py-3 text-sm font-bold text-white hover:bg-blue-700"
              >
                Se connecter →
              </a>
            </div>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          © {new Date().getFullYear()} Assistances Assurances Mali SARL
        </p>
      </div>
    </div>
  )
}

export default function ActivationPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      }
    >
      <ActivationContent />
    </Suspense>
  )
}

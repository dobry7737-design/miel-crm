'use client'

import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  ShieldCheck,
  Bell,
  Globe,
  Key,
  Building2,
  Save,
  Loader2,
  CheckCircle2,
  Sliders,
  Palette,
} from 'lucide-react'
import { PageHeader } from '@/components/dashboard/page-header'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { api } from '@/lib/api'

const TABS = [
  { id: 'general', label: 'Général', icon: Building2 },
  { id: 'scoring', label: 'Moteur de scoring', icon: Sliders },
  { id: 'securite', label: 'Sécurité', icon: ShieldCheck },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'apparence', label: 'Apparence', icon: Palette },
  { id: 'integrations', label: 'Intégrations', icon: Globe },
] as const

type TabId = typeof TABS[number]['id']

export function ParametresPage() {
  const [tab, setTab] = useState<TabId>('general')
  const [settings, setSettings] = useState<Record<string, string>>({})

  const { data, isLoading } = useQuery({
    queryKey: ['parametres'],
    queryFn: () => api.getParametres(),
  })

  useEffect(() => {
    if (data) setSettings(data)
  }, [data])

  const updateField = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  const handleSave = async () => {
    const saved = await api.updateParametres(settings)
    setSettings(saved)
  }

  return (
    <div>
      <PageHeader
        title="Paramètres"
        subtitle="Configuration de la plateforme AAM et des préférences"
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[220px_1fr]">
        <aside className="flex flex-col gap-1 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm shadow-slate-200/50 dark:border-slate-800 dark:bg-slate-900 dark:shadow-slate-950/30">
          {TABS.map((t) => {
            const Icon = t.icon
            const isActive = tab === t.id
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={cn(
                  'flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                  isActive
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100'
                )}
              >
                <Icon
                  className={cn('h-4 w-4', isActive ? 'text-blue-600 dark:text-blue-300' : 'text-slate-400 dark:text-slate-500')}
                  strokeWidth={2}
                />
                {t.label}
              </button>
            )
          })}
        </aside>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/50 dark:border-slate-800 dark:bg-slate-900 dark:shadow-slate-950/30">
          {isLoading && Object.keys(settings).length === 0 ? (
            <div className="flex items-center justify-center py-16 text-sm text-slate-400">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Chargement des paramètres…
            </div>
          ) : (
            <>
              {tab === 'general' && (
                <GeneralTab settings={settings} updateField={updateField} onSave={handleSave} />
              )}
              {tab === 'scoring' && (
                <ScoringTab settings={settings} updateField={updateField} onSave={handleSave} />
              )}
              {tab === 'securite' && (
                <SecurityTab settings={settings} updateField={updateField} onSave={handleSave} />
              )}
              {tab === 'notifications' && (
                <NotificationsTab settings={settings} updateField={updateField} onSave={handleSave} />
              )}
              {tab === 'apparence' && (
                <ApparenceTab settings={settings} updateField={updateField} onSave={handleSave} />
              )}
              {tab === 'integrations' && (
                <IntegrationsTab settings={settings} updateField={updateField} onSave={handleSave} />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function SectionTitle({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="mb-4">
      <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
      <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{desc}</p>
    </div>
  )
}

function SaveButton({ onSave }: { onSave?: () => Promise<void> | void }) {
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleClick = async () => {
    setSaving(true)
    toast.info('Enregistrement des modifications…')
    try {
      await onSave?.()
      setSaved(true)
      toast.success('Paramètres enregistrés', {
        description: 'Vos modifications ont été sauvegardées avec succès.',
      })
      setTimeout(() => setSaved(false), 2000)
    } catch (err) {
      toast.error('Erreur d\'enregistrement', {
        description: err instanceof Error ? err.message : 'Impossible de sauvegarder',
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mt-6 flex items-center justify-end gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
      {saved && (
        <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Enregistré
        </span>
      )}
      <button
        onClick={handleClick}
        disabled={saving}
        className="flex h-9 items-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white shadow-md shadow-blue-600/30 transition hover:bg-blue-700 active:scale-[0.98] disabled:opacity-50"
      >
        {saving ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Enregistrement...
          </>
        ) : (
          <>
            <Save className="h-4 w-4" />
            Enregistrer les modifications
          </>
        )}
      </button>
    </div>
  )
}

function Field({
  label,
  children,
  hint,
}: {
  label: string
  children: React.ReactNode
  hint?: string
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">{label}</label>
      {children}
      {hint && <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">{hint}</p>}
    </div>
  )
}

function Input({
  value = '',
  onChange,
  placeholder = '',
}: {
  value?: string
  onChange?: (v: string) => void
  placeholder?: string
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      placeholder={placeholder}
      className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 placeholder:text-slate-400 outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-blue-500 dark:focus:ring-blue-900/40"
    />
  )
}

function Select({
  value,
  onChange,
  options,
}: {
  value: string
  onChange?: (v: string) => void
  options: { value: string; label: string }[]
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-blue-500 dark:focus:ring-blue-900/40"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  )
}

function Toggle({
  checked,
  onChange,
  label,
  desc,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  label: string
  desc?: string
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <div>
        <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{label}</p>
        {desc && <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{desc}</p>}
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={cn(
          'relative h-6 w-11 shrink-0 rounded-full transition',
          checked ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-700'
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition dark:bg-slate-100',
            checked ? 'left-5' : 'left-0.5'
          )}
        />
      </button>
    </div>
  )
}

type SettingsProps = {
  settings: Record<string, string>
  updateField: (key: string, value: string) => void
  onSave: () => Promise<void>
}

function GeneralTab({ settings, updateField, onSave }: SettingsProps) {
  return (
    <div>
      <SectionTitle
        title="Informations générales"
        desc="Identité de la plateforme affichée publiquement"
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Nom de la plateforme">
          <Input value={settings.nom || ''} onChange={(v) => updateField('nom', v)} />
        </Field>
        <Field label="Slogan">
          <Input value={settings.slogan || ''} onChange={(v) => updateField('slogan', v)} />
        </Field>
        <Field label="Email contact">
          <Input value={settings.email || ''} onChange={(v) => updateField('email', v)} />
        </Field>
        <Field label="Téléphone">
          <Input value={settings.telephone || ''} onChange={(v) => updateField('telephone', v)} />
        </Field>
        <Field label="Adresse">
          <Input value={settings.adresse || ''} onChange={(v) => updateField('adresse', v)} />
        </Field>
        <Field label="Langue par défaut">
          <Select
            value={settings.langue || 'fr'}
            onChange={(v) => updateField('langue', v)}
            options={[
              { value: 'fr', label: 'Français' },
              { value: 'en', label: 'English' },
              { value: 'bm', label: 'Bambara' },
            ]}
          />
        </Field>
      </div>
      <div className="mt-5">
        <Field
          label="Chiffres clés affichés en page publique"
          hint="Valeurs alimentées en back-office"
        >
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Field label="Années d'expérience">
              <Input value={settings.anneesExperience || ''} onChange={(v) => updateField('anneesExperience', v)} />
            </Field>
            <Field label="Partenaires">
              <Input value={settings.partenaires || ''} onChange={(v) => updateField('partenaires', v)} />
            </Field>
            <Field label="Taux satisfaction (%)">
              <Input value={settings.tauxSatisfaction || ''} onChange={(v) => updateField('tauxSatisfaction', v)} />
            </Field>
            <Field label="Clients">
              <Input value={settings.clients || ''} onChange={(v) => updateField('clients', v)} />
            </Field>
          </div>
        </Field>
      </div>
      <SaveButton onSave={onSave} />
    </div>
  )
}

function ScoringTab({ settings, updateField, onSave }: SettingsProps) {
  const prix = Number(settings.scorePrix || 40)
  const garanties = Number(settings.scoreGaranties || 35)
  const note = Number(settings.scoreNote || 15)
  const delai = Number(settings.scoreDelai || 10)

  return (
    <div>
      <SectionTitle
        title="Moteur de scoring des offres"
        desc="Pondération utilisée pour les badges Meilleur rapport / Moins cher / Qualité premium"
      />
      <div className="space-y-4">
        <Field label="Pondération Prix" hint="0-100% (impact sur le badge Moins cher)">
          <input
            type="range"
            min={0}
            max={100}
            value={prix}
            onChange={(e) => updateField('scorePrix', e.target.value)}
            className="w-full"
          />
        </Field>
        <Field label="Pondération Garanties" hint="0-100% (impact sur le badge Qualité premium)">
          <input
            type="range"
            min={0}
            max={100}
            value={garanties}
            onChange={(e) => updateField('scoreGaranties', e.target.value)}
            className="w-full"
          />
        </Field>
        <Field label="Pondération Note compagnie" hint="0-100% (impact sur le badge Meilleur rapport)">
          <input
            type="range"
            min={0}
            max={100}
            value={note}
            onChange={(e) => updateField('scoreNote', e.target.value)}
            className="w-full"
          />
        </Field>
        <Field label="Pondération Délai sinistre" hint="0-100% (impact sur le classement)">
          <input
            type="range"
            min={0}
            max={100}
            value={delai}
            onChange={(e) => updateField('scoreDelai', e.target.value)}
            className="w-full"
          />
        </Field>
      </div>
      <div className="mt-5 rounded-xl bg-blue-50 p-4 text-sm text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
        <p>
          <strong>Formule actuelle :</strong>{' '}
          Score = {prix / 100} × Prix + {garanties / 100} × Garanties + {note / 100} × Note + {delai / 100} × Délai
        </p>
      </div>
      <SaveButton onSave={onSave} />
    </div>
  )
}

function SecurityTab({ settings, updateField, onSave }: SettingsProps) {
  const flag = (key: string, fallback = false) =>
    (settings[key] ?? (fallback ? '1' : '0')) === '1'

  return (
    <div>
      <SectionTitle
        title="Sécurité & Conformité"
        desc="Authentification, 2FA et politique de sécurité"
      />
      <div className="divide-y divide-slate-100 dark:divide-slate-800">
        <Toggle
          checked={flag('sec_2fa_admin', true)}
          onChange={(v) => updateField('sec_2fa_admin', v ? '1' : '0')}
          label="Activer l'authentification 2FA pour les administrateurs"
          desc="Obligation de saisir un code à 6 chiffres (SMS ou app)"
        />
        <Toggle
          checked={flag('sec_2fa_agent', true)}
          onChange={(v) => updateField('sec_2fa_agent', v ? '1' : '0')}
          label="Activer l'authentification 2FA pour les agents"
          desc="Sécurisation des comptes avec accès à des données clients"
        />
        <Toggle
          checked={flag('sec_2fa_correspondant')}
          onChange={(v) => updateField('sec_2fa_correspondant', v ? '1' : '0')}
          label="Activer l'authentification 2FA pour les correspondants partenaires"
          desc="Recommandé pour la confidentialité des tarifs"
        />
        <Toggle
          checked={flag('sec_tls', true)}
          onChange={(v) => updateField('sec_tls', v ? '1' : '0')}
          label="Chiffrement TLS pour toutes les communications"
          desc="HTTPS obligatoire · conformité réglementaire"
        />
        <Toggle
          checked={flag('sec_audit', true)}
          onChange={(v) => updateField('sec_audit', v ? '1' : '0')}
          label="Traçabilité des actions (journal d'audit)"
          desc="Conservation 12 mois des actions sensibles"
        />
        <Toggle
          checked={flag('sec_backup', true)}
          onChange={(v) => updateField('sec_backup', v ? '1' : '0')}
          label="Sauvegardes automatiques quotidiennes"
          desc="Plan de reprise d'activité (PRA) - rétention 30 jours"
        />
        <Toggle
          checked={flag('sec_ip_restrict')}
          onChange={(v) => updateField('sec_ip_restrict', v ? '1' : '0')}
          label="Restreindre l'accès par adresse IP"
          desc="Limiter les connexions à des plages IP autorisées"
        />
      </div>
      <div className="mt-5">
        <Field label="Durée de session (minutes)" hint="Durée d'inactivité avant déconnexion automatique">
          <Input
            value={settings.dureeSession || '60'}
            onChange={(v) => updateField('dureeSession', v)}
          />
        </Field>
      </div>
      <SaveButton onSave={onSave} />
    </div>
  )
}

function NotificationsTab({ settings, updateField, onSave }: SettingsProps) {
  const flag = (key: string, fallback = false) =>
    (settings[key] ?? (fallback ? '1' : '0')) === '1'

  return (
    <div>
      <SectionTitle
        title="Notifications automatiques"
        desc="Emails et SMS transactionnels envoyés aux utilisateurs"
      />
      <div className="divide-y divide-slate-100 dark:divide-slate-800">
        <Toggle
          checked={flag('notif_devis', true)}
          onChange={(v) => updateField('notif_devis', v ? '1' : '0')}
          label="Devis envoyé au client"
          desc="Email + SMS après émission d'un devis"
        />
        <Toggle
          checked={flag('notif_paiement', true)}
          onChange={(v) => updateField('notif_paiement', v ? '1' : '0')}
          label="Paiement reçu"
          desc="Email de confirmation + reçu PDF"
        />
        <Toggle
          checked={flag('notif_contrat', true)}
          onChange={(v) => updateField('notif_contrat', v ? '1' : '0')}
          label="Contrat actif"
          desc="Email + attestation provisoire PDF"
        />
        <Toggle
          checked={flag('notif_sinistre_declare', true)}
          onChange={(v) => updateField('notif_sinistre_declare', v ? '1' : '0')}
          label="Sinistre déclaré"
          desc="Confirmation au client + notification au gestionnaire"
        />
        <Toggle
          checked={flag('notif_sinistre_traite', true)}
          onChange={(v) => updateField('notif_sinistre_traite', v ? '1' : '0')}
          label="Sinistre traité"
          desc="Email de clôture au client"
        />
        <Toggle
          checked={flag('notif_echeance')}
          onChange={(v) => updateField('notif_echeance', v ? '1' : '0')}
          label="Échéance proche"
          desc="Rappel 14 et 7 jours avant échéance de contrat"
        />
        <Toggle
          checked={flag('notif_newsletter')}
          onChange={(v) => updateField('notif_newsletter', v ? '1' : '0')}
          label="Newsletter mensuelle"
          desc="Récap des nouvelles offres et nouveautés"
        />
        <Toggle
          checked={flag('notif_2fa_sms')}
          onChange={(v) => updateField('notif_2fa_sms', v ? '1' : '0')}
          label="Alerte 2FA par SMS"
          desc="Code d'authentification envoyé par SMS pour les comptes protégés"
        />
      </div>
      <SaveButton onSave={onSave} />
    </div>
  )
}

function ApparenceTab({ settings, updateField, onSave }: SettingsProps) {
  return (
    <div>
      <SectionTitle
        title="Apparence & Charte graphique"
        desc="Couleurs et identité visuelle de la plateforme"
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Couleur primaire">
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={settings.couleurPrimaire || '#2563eb'}
              onChange={(e) => updateField('couleurPrimaire', e.target.value)}
              className="h-9 w-12 rounded-lg border border-slate-200 bg-white p-0.5"
            />
            <Input
              value={settings.couleurPrimaire || '#2563eb'}
              onChange={(v) => updateField('couleurPrimaire', v)}
            />
          </div>
        </Field>
        <Field label="Couleur secondaire">
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={settings.couleurSecondaire || '#10b981'}
              onChange={(e) => updateField('couleurSecondaire', e.target.value)}
              className="h-9 w-12 rounded-lg border border-slate-200 bg-white p-0.5"
            />
            <Input
              value={settings.couleurSecondaire || '#10b981'}
              onChange={(v) => updateField('couleurSecondaire', v)}
            />
          </div>
        </Field>
      </div>
      <div className="mt-4">
        <Field label="Logo de la plateforme">
          <div className="flex items-center gap-4 rounded-lg border border-dashed border-slate-300 p-4 dark:border-slate-700">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600">
              <ShieldCheck className="h-6 w-6 text-white" />
            </div>
            <div>
              <button className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                Téléverser un nouveau logo
              </button>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">PNG, SVG · max 1 Mo · 256×256 px recommandé</p>
            </div>
          </div>
        </Field>
      </div>
      <div className="mt-4">
        <Field label="Thème">
          <Select
            value={settings.theme || 'light'}
            onChange={(v) => updateField('theme', v)}
            options={[
              { value: 'light', label: 'Clair (défaut)' },
              { value: 'dark', label: 'Sombre' },
              { value: 'auto', label: 'Système (auto)' },
            ]}
          />
        </Field>
      </div>
      <SaveButton onSave={onSave} />
    </div>
  )
}

function IntegrationsTab({ settings, updateField, onSave }: SettingsProps) {
  const INTEGRATIONS = [
    { key: 'int_orange', name: 'Orange Money', desc: 'Paiement Mobile Money - Mali' },
    { key: 'int_wave', name: 'Wave', desc: 'Wallet Wave - Mali' },
    { key: 'int_moov', name: 'Moov Money', desc: 'Moov Africa - Mali' },
    { key: 'int_cinetpay', name: 'CinetPay', desc: 'Passerelle de paiement carte bancaire' },
    { key: 'int_paydunya', name: 'PayDunya', desc: 'Passerelle alternative carte bancaire' },
    { key: 'int_twilio', name: 'Twilio SMS', desc: 'Envoi de SMS transactionnels' },
    { key: 'int_sendgrid', name: 'SendGrid Email', desc: "Envoi d'emails transactionnels" },
  ] as const

  const cycleStatus = (current: string) => {
    if (current === 'connecté') return 'en attente'
    if (current === 'en attente') return 'déconnecté'
    return 'connecté'
  }

  const styleFor = (status: string) => {
    if (status === 'connecté')
      return { color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/30' }
    if (status === 'en attente')
      return { color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/30' }
    return { color: 'text-slate-500', bg: 'bg-slate-100 dark:bg-slate-800' }
  }

  return (
    <div>
      <SectionTitle
        title="Intégrations externes"
        desc="Statuts persistés en base (Setting Prisma)"
      />
      <div className="space-y-3">
        {INTEGRATIONS.map((int) => {
          const status = settings[int.key] || 'déconnecté'
          const style = styleFor(status)
          return (
            <div
              key={int.key}
              className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800/60"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-50 dark:bg-slate-900">
                  <Globe className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {int.name}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{int.desc}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold',
                    style.bg,
                    style.color
                  )}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-current" />
                  {status}
                </span>
                <button
                  type="button"
                  onClick={() => updateField(int.key, cycleStatus(status))}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Changer statut
                </button>
              </div>
            </div>
          )
        })}
      </div>
      <div className="mt-5 rounded-xl bg-blue-50 p-4 text-sm text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
        <Key className="mr-1.5 inline h-4 w-4" />
        Clés d&apos;API et secrets gérés en environnement sécurisé (.env) — Non affichés.
      </div>
      <SaveButton onSave={onSave} />
    </div>
  )
}

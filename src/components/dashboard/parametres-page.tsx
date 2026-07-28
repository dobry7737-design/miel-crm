'use client'

import { useState } from 'react'
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

  return (
    <div>
      <PageHeader
        title="Paramètres"
        subtitle="Configuration de la plateforme AAM et des préférences"
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[220px_1fr]">
        {/* Tabs sidebar */}
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

        {/* Tab content */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/50 dark:border-slate-800 dark:bg-slate-900 dark:shadow-slate-950/30">
          {tab === 'general' && <GeneralTab />}
          {tab === 'scoring' && <ScoringTab />}
          {tab === 'securite' && <SecurityTab />}
          {tab === 'notifications' && <NotificationsTab />}
          {tab === 'apparence' && <ApparenceTab />}
          {tab === 'integrations' && <IntegrationsTab />}
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

function SaveButton({ onSave }: { onSave?: () => void }) {
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleClick = () => {
    setSaving(true)
    setTimeout(() => {
      setSaving(false)
      setSaved(true)
      onSave?.()
      setTimeout(() => setSaved(false), 2000)
    }, 600)
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

function Input({ defaultValue = '', placeholder = '' }: { defaultValue?: string; placeholder?: string }) {
  const [value, setValue] = useState(defaultValue)
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      placeholder={placeholder}
      className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 placeholder:text-slate-400 outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-blue-500 dark:focus:ring-blue-900/40"
    />
  )
}

function Select({ defaultValue, options }: { defaultValue: string; options: { value: string; label: string }[] }) {
  const [value, setValue] = useState(defaultValue)
  return (
    <select
      value={value}
      onChange={(e) => setValue(e.target.value)}
      className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-blue-500 dark:focus:ring-blue-900/40"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  )
}

function Toggle({ defaultChecked = false, label, desc }: { defaultChecked?: boolean; label: string; desc?: string }) {
  const [checked, setChecked] = useState(defaultChecked)
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <div>
        <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{label}</p>
        {desc && <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{desc}</p>}
      </div>
      <button
        type="button"
        onClick={() => setChecked((c) => !c)}
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

function GeneralTab() {
  return (
    <div>
      <SectionTitle
        title="Informations générales"
        desc="Identité de la plateforme affichée publiquement"
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Nom de la plateforme">
          <Input defaultValue="Assistances Assurances Mali" />
        </Field>
        <Field label="Slogan">
          <Input defaultValue="Assurance, simplifiée" />
        </Field>
        <Field label="Email contact">
          <Input defaultValue="contact@aam.ml" />
        </Field>
        <Field label="Téléphone">
          <Input defaultValue="+223 20 22 33 44" />
        </Field>
        <Field label="Adresse">
          <Input defaultValue="Bamako, Mali" />
        </Field>
        <Field label="Langue par défaut">
          <Select
            defaultValue="fr"
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
              <Input defaultValue="15" />
            </Field>
            <Field label="Partenaires">
              <Input defaultValue="11" />
            </Field>
            <Field label="Taux satisfaction (%)">
              <Input defaultValue="98" />
            </Field>
            <Field label="Clients">
              <Input defaultValue="10000" />
            </Field>
          </div>
        </Field>
      </div>
      <SaveButton />
    </div>
  )
}

function ScoringTab() {
  return (
    <div>
      <SectionTitle
        title="Moteur de scoring des offres"
        desc="Pondération utilisée pour les badges Meilleur rapport / Moins cher / Qualité premium"
      />
      <div className="space-y-4">
        <Field label="Pondération Prix" hint="0-100% (impact sur le badge Moins cher)">
          <input type="range" min={0} max={100} defaultValue={40} className="w-full" />
        </Field>
        <Field label="Pondération Garanties" hint="0-100% (impact sur le badge Qualité premium)">
          <input type="range" min={0} max={100} defaultValue={35} className="w-full" />
        </Field>
        <Field label="Pondération Note compagnie" hint="0-100% (impact sur le badge Meilleur rapport)">
          <input type="range" min={0} max={100} defaultValue={15} className="w-full" />
        </Field>
        <Field label="Pondération Délai sinistre" hint="0-100% (impact sur le classement)">
          <input type="range" min={0} max={100} defaultValue={10} className="w-full" />
        </Field>
      </div>
      <div className="mt-5 rounded-xl bg-blue-50 p-4 text-sm text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
        <p>
          <strong>Formule actuelle :</strong> Score = 0,4 × Prix + 0,35 × Garanties + 0,15 × Note + 0,1 × Délai
        </p>
      </div>
      <SaveButton />
    </div>
  )
}

function SecurityTab() {
  return (
    <div>
      <SectionTitle
        title="Sécurité & Conformité"
        desc="Authentification, 2FA et politique de sécurité"
      />
      <div className="divide-y divide-slate-100">
        <Toggle
          defaultChecked
          label="Activer l'authentification 2FA pour les administrateurs"
          desc="Obligation de saisir un code à 6 chiffres (SMS ou app)"
        />
        <Toggle
          defaultChecked
          label="Activer l'authentification 2FA pour les agents"
          desc="Sécurisation des comptes avec accès à des données clients"
        />
        <Toggle
          label="Activer l'authentification 2FA pour les correspondants partenaires"
          desc="Recommandé pour la confidentialité des tarifs"
        />
        <Toggle
          defaultChecked
          label="Chiffrement TLS pour toutes les communications"
          desc="HTTPS obligatoire · conformité réglementaire"
        />
        <Toggle
          defaultChecked
          label="Traçabilité des actions (journal d'audit)"
          desc="Conservation 12 mois des actions sensibles"
        />
        <Toggle
          defaultChecked
          label="Sauvegardes automatiques quotidiennes"
          desc="Plan de reprise d'activité (PRA) - rétention 30 jours"
        />
        <Toggle
          label="Restreindre l'accès par adresse IP"
          desc="Limiter les connexions à des plages IP autorisées"
        />
      </div>
      <div className="mt-5">
        <Field label="Durée de session (minutes)" hint="Durée d'inactivité avant déconnexion automatique">
          <Input defaultValue="60" />
        </Field>
      </div>
      <SaveButton />
    </div>
  )
}

function NotificationsTab() {
  return (
    <div>
      <SectionTitle
        title="Notifications automatiques"
        desc="Emails et SMS transactionnels envoyés aux utilisateurs"
      />
      <div className="divide-y divide-slate-100">
        <Toggle defaultChecked label="Devis envoyé au client" desc="Email + SMS après émission d'un devis" />
        <Toggle defaultChecked label="Paiement reçu" desc="Email de confirmation + reçu PDF" />
        <Toggle defaultChecked label="Contrat actif" desc="Email + attestation provisoire PDF" />
        <Toggle defaultChecked label="Sinistre déclaré" desc="Confirmation au client + notification au gestionnaire" />
        <Toggle defaultChecked label="Sinistre traité" desc="Email de clôture au client" />
        <Toggle label="Échéance proche" desc="Rappel 14 et 7 jours avant échéance de contrat" />
        <Toggle label="Newsletter mensuelle" desc="Récap des nouvelles offres et nouveautés" />
        <Toggle label="Alerte 2FA par SMS" desc="Code d'authentification envoyé par SMS pour les comptes protégés" />
      </div>
      <SaveButton />
    </div>
  )
}

function ApparenceTab() {
  return (
    <div>
      <SectionTitle
        title="Apparence & Charte graphique"
        desc="Couleurs et identité visuelle de la plateforme"
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Couleur primaire">
          <div className="flex items-center gap-2">
            <input type="color" defaultValue="#2563eb" className="h-9 w-12 rounded-lg border border-slate-200 bg-white p-0.5" />
            <Input defaultValue="#2563eb" />
          </div>
        </Field>
        <Field label="Couleur secondaire">
          <div className="flex items-center gap-2">
            <input type="color" defaultValue="#10b981" className="h-9 w-12 rounded-lg border border-slate-200 bg-white p-0.5" />
            <Input defaultValue="#10b981" />
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
            defaultValue="light"
            options={[
              { value: 'light', label: 'Clair (défaut)' },
              { value: 'dark', label: 'Sombre' },
              { value: 'auto', label: 'Système (auto)' },
            ]}
          />
        </Field>
      </div>
      <SaveButton />
    </div>
  )
}

function IntegrationsTab() {
  return (
    <div>
      <SectionTitle
        title="Intégrations externes"
        desc="Paiements Mobile Money, passerelles et services tiers"
      />
      <div className="space-y-3">
        {[
          { name: 'Orange Money', status: 'connecté', color: 'text-emerald-600', bg: 'bg-emerald-50', desc: 'Paiement Mobile Money - Mali' },
          { name: 'Wave', status: 'connecté', color: 'text-emerald-600', bg: 'bg-emerald-50', desc: 'Wallet Wave - Mali' },
          { name: 'Moov Money', status: 'connecté', color: 'text-emerald-600', bg: 'bg-emerald-50', desc: 'Moov Africa - Mali' },
          { name: 'CinetPay', status: 'en attente', color: 'text-amber-600', bg: 'bg-amber-50', desc: 'Passerelle de paiement carte bancaire' },
          { name: 'PayDunya', status: 'déconnecté', color: 'text-slate-500', bg: 'bg-slate-100 dark:bg-slate-800', desc: 'Passerelle alternative carte bancaire' },
          { name: 'Twilio SMS', status: 'connecté', color: 'text-emerald-600', bg: 'bg-emerald-50', desc: 'Envoi de SMS transactionnels' },
          { name: 'SendGrid Email', status: 'connecté', color: 'text-emerald-600', bg: 'bg-emerald-50', desc: 'Envoi d\'emails transactionnels' },
        ].map((int) => (
          <div key={int.name} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800/60">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-50 dark:bg-slate-900">
                <Globe className="h-5 w-5 text-slate-600 dark:text-slate-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{int.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{int.desc}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold', int.bg, int.color)}>
                <span className="h-1.5 w-1.5 rounded-full bg-current" />
                {int.status}
              </span>
              <button className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800">
                Configurer
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-5 rounded-xl bg-blue-50 p-4 text-sm text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
        <Key className="mr-1.5 inline h-4 w-4" />
        Clés d&apos;API et secrets gérés en environnement sécurisé (.env) — Non affichés.
      </div>
    </div>
  )
}

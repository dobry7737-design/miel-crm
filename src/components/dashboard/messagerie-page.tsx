'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import {
  Send,
  Search,
  MessageSquare,
  Circle,
  ArrowLeft,
  RefreshCw,
  PlusCircle,
  ShieldCheck,
  Briefcase,
  UserCircle2,
  Headphones,
  Building2,
} from 'lucide-react'
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import { useAuth, ROLE_LABELS, type Role } from '@/lib/auth'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

// ============ TYPES ============

interface Partner {
  id: string
  name: string
  avatar: string | null
  role: string
  statut?: string
  lastLoginAt?: string | null
}

interface Conversation {
  partnerId: string
  partnerName: string
  partnerAvatar: string | null
  partnerRole: string
  lastMessage: string
  lastMessageAt: string
  lastMessageFromMe: boolean
  unreadCount: number
}

interface Message {
  id: string
  fromId: string
  content: string
  read: boolean
  createdAt: string
  from: {
    id: string
    name: string
    avatar: string | null
    role: string
  }
}

// ============ UTILS ============

const ROLE_ICONS: Record<string, typeof ShieldCheck> = {
  admin: ShieldCheck,
  agent: Briefcase,
  client: UserCircle2,
  gestionnaire: Headphones,
  correspondant: Building2,
}

const ROLE_COLORS: Record<string, string> = {
  admin: 'bg-purple-100 text-purple-700',
  agent: 'bg-emerald-100 text-emerald-700',
  client: 'bg-blue-100 text-blue-700',
  gestionnaire: 'bg-amber-100 text-amber-700',
  correspondant: 'bg-rose-100 text-rose-700',
}

function formatTime(dateStr: string) {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'À l\'instant'
  if (diffMins < 60) return `Il y a ${diffMins} min`
  if (diffHours < 24) return `Il y a ${diffHours}h`
  if (diffDays === 1) return 'Hier'
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

function Avatar({ name, role, size = 'md' }: { name: string; role: string; size?: 'sm' | 'md' | 'lg' }) {
  const initials = name?.split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase() || '?'
  const sizes = { sm: 'h-8 w-8 text-[10px]', md: 'h-10 w-10 text-xs', lg: 'h-12 w-12 text-sm' }
  return (
    <span className={cn('flex shrink-0 items-center justify-center rounded-full font-semibold', sizes[size], ROLE_COLORS[role] || 'bg-slate-100 text-slate-600')}>
      {initials}
    </span>
  )
}

// ============ NEW CONVERSATION MODAL ============

function NewConversationModal({
  open,
  onClose,
  onSelect,
  currentUserId,
}: {
  open: boolean
  onClose: () => void
  onSelect: (partner: Partner) => void
  currentUserId: string
}) {
  const [search, setSearch] = useState('')
  const { data } = useQuery<{ data: Partner[] }>({
    queryKey: ['users-for-message'],
    queryFn: () => fetch('/api/utilisateurs', { credentials: 'include' }).then((r) => r.json()),
    enabled: open,
  })

  const users = (data?.data || []).filter(
    (u) => u.id !== currentUserId && u.statut === 'Actif'
  )
  const filtered = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.role?.toLowerCase().includes(search.toLowerCase())
  )

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-sm overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900">
        <div className="border-b border-slate-100 px-5 py-4 dark:border-slate-800">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Nouvelle conversation</h3>
          <div className="relative mt-3">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher un utilisateur…"
              className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>
        </div>
        <ul className="max-h-72 overflow-y-auto py-2">
          {filtered.length === 0 ? (
            <li className="px-5 py-6 text-center text-xs text-slate-400">Aucun utilisateur trouvé</li>
          ) : (
            filtered.map((u) => {
              const Icon = ROLE_ICONS[u.role] || UserCircle2
              return (
                <li key={u.id}>
                  <button
                    onClick={() => { onSelect(u); onClose() }}
                    className="flex w-full items-center gap-3 px-5 py-2.5 text-left transition hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    <Avatar name={u.name} role={u.role} size="sm" />
                    <div className="flex-1 overflow-hidden">
                      <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">{u.name}</p>
                      <p className="flex items-center gap-1 text-xs text-slate-400">
                        <Icon className="h-3 w-3" />
                        {ROLE_LABELS[u.role as Role] || u.role}
                      </p>
                    </div>
                  </button>
                </li>
              )
            })
          )}
        </ul>
        <div className="border-t border-slate-100 px-5 py-3 dark:border-slate-800">
          <button onClick={onClose} className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
            Annuler
          </button>
        </div>
      </div>
    </div>
  )
}

// ============ MAIN COMPONENT ============

export function MessageriePage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [activePartnerId, setActivePartnerId] = useState<string | null>(null)
  const [activePartner, setActivePartner] = useState<Partner | null>(null)
  const [newMessage, setNewMessage] = useState('')
  const [search, setSearch] = useState('')
  const [newConvOpen, setNewConvOpen] = useState(false)
  const [mobileView, setMobileView] = useState<'list' | 'chat'>('list')
  const bottomRef = useRef<HTMLDivElement>(null)

  // --- Conversations (polling 10s) ---
  const { data: convResp } = useQuery<{ data: Conversation[]; totalUnread: number }>({
    queryKey: ['conversations'],
    queryFn: () => fetch('/api/messages', { credentials: 'include' }).then((r) => r.json()),
    refetchInterval: 10000,
  })
  const conversations = convResp?.data || []
  const filtered = conversations.filter((c) =>
    c.partnerName?.toLowerCase().includes(search.toLowerCase())
  )

  // --- Messages d'une conversation (polling 10s si active) ---
  const { data: msgResp } = useQuery<{ data: Message[]; partner: Partner }>({
    queryKey: ['messages', activePartnerId],
    queryFn: () =>
      fetch(`/api/messages/${activePartnerId}`, { credentials: 'include' }).then((r) => r.json()),
    enabled: !!activePartnerId,
    refetchInterval: 10000,
  })
  const messages = msgResp?.data || []

  // Scroll to bottom when messages update
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  // Refresh conversations after viewing a convo (unread → read)
  useEffect(() => {
    if (activePartnerId) {
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
    }
  }, [activePartnerId, queryClient])

  // --- Envoyer un message ---
  const sendMutation = useMutation({
    mutationFn: async ({ toId, content }: { toId: string; content: string }) => {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ toId, content }),
      })
      if (!res.ok) throw new Error('Erreur lors de l\'envoi')
      return res.json()
    },
    onSuccess: () => {
      setNewMessage('')
      queryClient.invalidateQueries({ queryKey: ['messages', activePartnerId] })
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
    },
    onError: () => toast.error('Impossible d\'envoyer le message'),
  })

  function handleSend() {
    const content = newMessage.trim()
    if (!content || !activePartnerId || sendMutation.isPending) return
    sendMutation.mutate({ toId: activePartnerId, content })
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const openConversation = useCallback((partnerId: string, partner?: Partner) => {
    setActivePartnerId(partnerId)
    if (partner) setActivePartner(partner)
    setMobileView('chat')
  }, [])

  // ============ RENDER ============

  return (
    <div className="flex h-[calc(100vh-80px)] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">

      {/* ===== Sidebar conversations ===== */}
      <div className={cn(
        'flex w-full flex-col border-r border-slate-100 dark:border-slate-800 sm:w-80 lg:w-96',
        mobileView === 'chat' ? 'hidden sm:flex' : 'flex'
      )}>
        {/* Header */}
        <div className="border-b border-slate-100 p-4 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Messagerie</h2>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => queryClient.invalidateQueries({ queryKey: ['conversations'] })}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
                title="Actualiser"
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setNewConvOpen(true)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30"
                title="Nouvelle conversation"
              >
                <PlusCircle className="h-4 w-4" />
              </button>
            </div>
          </div>
          {/* Search */}
          <div className="relative mt-3">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher une conversation…"
              className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm outline-none transition focus:border-blue-300 focus:ring-1 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>
        </div>

        {/* Liste conversations */}
        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
              <MessageSquare className="h-10 w-10 text-slate-200 dark:text-slate-700" />
              <p className="text-sm text-slate-400">Aucune conversation</p>
              <button
                onClick={() => setNewConvOpen(true)}
                className="text-xs font-semibold text-blue-600 hover:underline"
              >
                Démarrer une conversation →
              </button>
            </div>
          ) : (
            filtered.map((conv) => {
              const isActive = conv.partnerId === activePartnerId
              const Icon = ROLE_ICONS[conv.partnerRole] || UserCircle2
              return (
                <button
                  key={conv.partnerId}
                  onClick={() => openConversation(conv.partnerId)}
                  className={cn(
                    'flex w-full items-center gap-3 border-b border-slate-50 px-4 py-3.5 text-left transition dark:border-slate-800/60',
                    isActive
                      ? 'bg-blue-50 dark:bg-blue-900/20'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  )}
                >
                  <div className="relative">
                    <Avatar name={conv.partnerName} role={conv.partnerRole} />
                    {conv.unreadCount > 0 && (
                      <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[9px] font-bold text-white">
                        {conv.unreadCount > 9 ? '9+' : conv.unreadCount}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className={cn('truncate text-sm', conv.unreadCount > 0 ? 'font-bold text-slate-900 dark:text-slate-100' : 'font-medium text-slate-700 dark:text-slate-300')}>
                        {conv.partnerName}
                      </p>
                      <span className="shrink-0 text-[10px] text-slate-400">
                        {formatTime(conv.lastMessageAt)}
                      </span>
                    </div>
                    <p className={cn('mt-0.5 truncate text-xs', conv.unreadCount > 0 ? 'font-semibold text-slate-700 dark:text-slate-200' : 'text-slate-400 dark:text-slate-500')}>
                      {conv.lastMessageFromMe ? '✓ Vous : ' : ''}{conv.lastMessage}
                    </p>
                    <span className={cn('mt-0.5 inline-flex items-center gap-1 rounded px-1.5 py-0 text-[10px] font-semibold', ROLE_COLORS[conv.partnerRole] || 'bg-slate-100 text-slate-500')}>
                      <Icon className="h-2.5 w-2.5" />
                      {ROLE_LABELS[conv.partnerRole as Role] || conv.partnerRole}
                    </span>
                  </div>
                </button>
              )
            })
          )}
        </div>
      </div>

      {/* ===== Zone de chat ===== */}
      <div className={cn(
        'flex flex-1 flex-col',
        mobileView === 'list' ? 'hidden sm:flex' : 'flex'
      )}>
        {!activePartnerId ? (
          /* Écran vide */
          <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-900/20">
              <MessageSquare className="h-8 w-8 text-blue-400" />
            </div>
            <div>
              <p className="font-semibold text-slate-700 dark:text-slate-300">Sélectionnez une conversation</p>
              <p className="mt-1 text-sm text-slate-400">ou démarrez-en une nouvelle</p>
            </div>
            <button
              onClick={() => setNewConvOpen(true)}
              className="flex items-center gap-2 rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
            >
              <PlusCircle className="h-4 w-4" />
              Nouvelle conversation
            </button>
          </div>
        ) : (
          <>
            {/* Header du chat */}
            <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-3.5 dark:border-slate-800">
              <button
                className="mr-1 flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 sm:hidden"
                onClick={() => { setMobileView('list'); setActivePartnerId(null) }}
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              {(() => {
                const conv = conversations.find((c) => c.partnerId === activePartnerId)
                const partner = activePartner || (conv ? { id: conv.partnerId, name: conv.partnerName, avatar: conv.partnerAvatar, role: conv.partnerRole } : null)
                if (!partner) return null
                const Icon = ROLE_ICONS[partner.role] || UserCircle2
                return (
                  <>
                    <Avatar name={partner.name} role={partner.role} />
                    <div className="flex-1">
                      <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{partner.name}</p>
                      <p className="flex items-center gap-1 text-xs text-slate-400">
                        <Icon className="h-3 w-3" />
                        {ROLE_LABELS[partner.role as Role] || partner.role}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-emerald-500">
                      <Circle className="h-2 w-2 fill-current" />
                      <span className="text-slate-400">En ligne</span>
                    </div>
                  </>
                )
              })()}
            </div>

            {/* Messages */}
            <div className="flex-1 space-y-3 overflow-y-auto p-5">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <p className="text-sm text-slate-400">Aucun message. Envoyez le premier !</p>
                </div>
              )}
              {messages.map((msg, i) => {
                const isMe = msg.fromId === user?.id
                const prevMsg = messages[i - 1]
                const showDate = !prevMsg || new Date(msg.createdAt).toDateString() !== new Date(prevMsg.createdAt).toDateString()

                return (
                  <div key={msg.id}>
                    {showDate && (
                      <div className="my-4 flex items-center gap-3">
                        <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800" />
                        <span className="text-xs text-slate-400">
                          {new Date(msg.createdAt).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                        </span>
                        <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800" />
                      </div>
                    )}
                    <div className={cn('flex items-end gap-2', isMe ? 'justify-end' : 'justify-start')}>
                      {!isMe && <Avatar name={msg.from.name} role={msg.from.role} size="sm" />}
                      <div className={cn(
                        'max-w-[70%] space-y-1',
                        isMe ? 'items-end' : 'items-start',
                        'flex flex-col'
                      )}>
                        <div className={cn(
                          'rounded-2xl px-4 py-2.5 text-sm leading-relaxed',
                          isMe
                            ? 'rounded-br-sm bg-blue-600 text-white'
                            : 'rounded-bl-sm bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-100'
                        )}>
                          {msg.content}
                        </div>
                        <span className="text-[10px] text-slate-400">
                          {new Date(msg.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                          {isMe && (
                            <span className="ml-1 text-blue-400">{msg.read ? '✓✓' : '✓'}</span>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="border-t border-slate-100 px-4 py-3 dark:border-slate-800">
              <div className="flex items-end gap-2">
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Écrivez votre message… (Entrée pour envoyer)"
                  rows={1}
                  className="flex-1 resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-blue-300 focus:ring-1 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  style={{ maxHeight: '120px' }}
                />
                <button
                  onClick={handleSend}
                  disabled={!newMessage.trim() || sendMutation.isPending}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
              <p className="mt-1.5 text-right text-[10px] text-slate-300 dark:text-slate-600">
                Actualisation automatique toutes les 10 secondes
              </p>
            </div>
          </>
        )}
      </div>

      {/* Modal nouvelle conversation */}
      <NewConversationModal
        open={newConvOpen}
        onClose={() => setNewConvOpen(false)}
        onSelect={(partner) => openConversation(partner.id, partner)}
        currentUserId={user?.id || ''}
      />
    </div>
  )
}

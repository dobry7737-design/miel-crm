'use client'

import { useState, useMemo, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Trophy, TrendingUp, Users, Medal, Star, ChevronDown, ChevronUp } from 'lucide-react'
import {
  CRM_DATA_CHANGED_EVENT,
  getClients,
  getCommandes,
  getSalesReps,
  portraitUrlForRep,
} from '@/lib/crm-data'
import { Button } from '@/components/ui/button'

export function TopCommerciauxView() {
  const [showAll, setShowAll] = useState(false)
  const [version, setVersion] = useState(0)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // eslint-disable-next-line
    setMounted(true)
    const bump = () => setVersion((v) => v + 1)
    window.addEventListener(CRM_DATA_CHANGED_EVENT, bump)
    return () => window.removeEventListener(CRM_DATA_CHANGED_EVENT, bump)
  }, [])

  // Calcul du classement
  const topCommerciaux = (() => {
    const salesReps = getSalesReps()
    const clients = getClients()
    const commandes = getCommandes()

    if (!salesReps || salesReps.length === 0) return []

    const stats = salesReps
      .filter((rep) => rep.role !== 'DG' && rep.role !== 'ADMIN') // On exclut le boss du classement
      .map((rep) => {
        const repClients = clients.filter((c) => c.commercial === rep.name)
        const clientsCount = repClients.length

        // Total chiffre d'affaires
        const repCommandes = commandes.filter((cmd) => cmd.commercial === rep.name)
        const totalVentes = repCommandes.reduce((acc, curr) => acc + curr.montant, 0)
        const ventesCount = repCommandes.length

        // Calcul d'un "score" simple: 1 client rapporté = 10pts, 1000 FCFA vendu = 1pt
        // (Juste à titre décoratif si on veut classer avec un score consolidé, sinon on trie par CA).
        const score = totalVentes + clientsCount * 50000

        return {
          ...rep,
          clientsCount,
          totalVentes,
          ventesCount,
          score,
        }
      })

    // Tri desc par score
    return stats.sort((a, b) => b.score - a.score)
  })()

  if (!mounted) {
    return (
      <div className="flex px-4 py-8 items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (topCommerciaux.length === 0) {
    return (
      <div className="px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
          <Trophy className="h-8 w-8 text-primary" />
          Top Commerciaux
        </h1>
        <p className="text-muted-foreground">Aucun commercial trouvé ou données non disponibles.</p>
      </div>
    )
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Trophy className="h-5 w-5 text-yellow-500" />
      case 1:
        return <Medal className="h-5 w-5 text-slate-400" />
      case 2:
        return <Medal className="h-5 w-5 text-amber-600" />
      default:
        return null
    }
  }

  return (
    <div className="px-4 py-8 sm:px-6 lg:px-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <Trophy className="h-8 w-8 text-yellow-500 animate-pulse" />
            Classement des Performances
          </h1>
          <p className="text-muted-foreground mt-1">
            Réservé au bureau exécutif — Suivez les meilleurs éléments de votre force de vente.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <Card className="overflow-hidden border border-border/50 shadow-sm">
          <div className="divide-y divide-border/50">
            {topCommerciaux.map((rep, idx) => {
              const rIcon = getRankIcon(idx)
              
              return (
                <div key={rep.id} className="flex items-center p-4 sm:p-5 gap-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-muted/50 text-muted-foreground font-bold text-sm shrink-0 relative">
                    {rIcon ? (
                      <div className="absolute -top-2 -right-2 bg-background rounded-full p-0.5 shadow-sm">
                        {rIcon}
                      </div>
                    ) : null}
                    #{idx + 1}
                  </div>
                  
                  <Avatar className="h-12 w-12 border-2 border-primary/10 shadow-sm">
                    {/* Utilisation des initiales (avatar) plutôt que d'une image photo */}
                    <AvatarFallback className="text-lg font-bold bg-primary/5 text-primary">
                      {rep.avatarInitials}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-base truncate flex items-center gap-2">
                      {rep.name}
                      {idx === 0 && <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />}
                    </p>
                    <p className="text-sm text-muted-foreground truncate">{rep.zone}</p>
                  </div>
                  
                  <div className="hidden sm:flex flex-col items-end px-4 border-r border-border/50 pr-6">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Prospects</p>
                    <p className="font-bold text-base flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      {rep.clientsCount}
                    </p>
                  </div>
                  
                  <div className="flex flex-col items-end pl-4 sm:pl-6 sm:min-w-[140px]">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">CA Généré</p>
                    <p className="font-extrabold text-base text-primary flex items-center gap-1.5">
                      <TrendingUp className="h-4 w-4" />
                      {formatCurrency(rep.totalVentes)}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      </div>
    </div>
  )
}

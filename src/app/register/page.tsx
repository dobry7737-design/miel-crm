'use client'

import { Suspense, useState } from 'react'
import { useRouter } from 'next/navigation'
import { BrandLogo } from '@/components/crm/brand-logo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { registerAuthUser } from '@/hooks/use-auth'
import { Activity, Phone, Lock, ChevronRight } from 'lucide-react'
import Link from 'next/link'

function RegisterInner() {
  const router = useRouter()
  const { toast } = useToast()
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!phone.trim() || !password.trim()) return
    setIsLoading(true)

    try {
      await registerAuthUser(phone, password)
      toast({ title: 'Compte créé avec succès', description: 'Redirection vers l\'application...' })
      router.replace('/crm/dashboard')
    } catch (err: any) {
      toast({ title: 'Erreur', description: err.message, variant: 'destructive' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gradient-to-br from-primary/[0.07] via-emerald-50/40 to-background dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <BrandLogo priority className="mx-auto h-20 w-auto" />
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="border-primary/10 shadow-xl shadow-primary/5 dark:border-primary/20">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-semibold tracking-tight text-center">
              Créer mon mot de passe
            </CardTitle>
            <CardDescription className="text-center">
              Entrez votre numéro de téléphone (ajouté par votre admin) pour paramétrer votre mot de passe personnel.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Numéro de téléphone</Label>
                <div className="relative">
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Ex: 77 123 45 67"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className="pl-10"
                    disabled={isLoading}
                  />
                  <Phone className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Nouveau mot de passe</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pl-10"
                    disabled={isLoading}
                    minLength={6}
                  />
                  <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                </div>
              </div>
              <Button type="submit" className="w-full font-medium" disabled={isLoading}>
                {isLoading ? (
                  <Activity className="h-5 w-5 animate-spin" />
                ) : (
                  <>Valider mon compte <ChevronRight className="ml-1.5 h-4 w-4" /></>
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center border-t border-border/40 px-6 py-4">
            <p className="text-sm text-muted-foreground">
              Déjà un mot de passe ?{' '}
              <Link href="/login" className="font-semibold text-primary hover:underline">
                Se connecter
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <RegisterInner />
    </Suspense>
  )
}

'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ChartContainer, ChartTooltip, ChartTooltipContent,
} from '@/components/ui/chart'
import { Bar, BarChart, XAxis, YAxis, Cell, PieChart, Pie, CartesianGrid } from 'recharts'
import { BRAND_GREEN, BRAND_GREEN_SOFT } from '@/lib/chart-colors'

export interface DashboardMonthlyDatum {
  month: string
  montant: number
}

export interface DashboardPieDatum {
  name: string
  value: number
  montant: number
  fill: string
}

export default function DashboardCharts({
  monthlyData,
  pieData,
}: {
  monthlyData: DashboardMonthlyDatum[]
  pieData: DashboardPieDatum[]
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Card className="lg:col-span-2 border-primary/15 dark:border-primary/25">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Ventes mensuelles</CardTitle>
          <CardDescription>Évolution sur les 6 derniers mois</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={{ montant: { label: 'Ventes', color: BRAND_GREEN } }} className="h-[280px] w-full">
            <BarChart data={monthlyData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="oklch(0.88 0.02 150)" />
              <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} tickMargin={8} />
              <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12 }} tickMargin={8} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="montant" radius={[6, 6, 0, 0]} maxBarSize={50}>
                {monthlyData.map((_, i) => (
                  <Cell
                    key={i}
                    fill={i === monthlyData.length - 1 ? BRAND_GREEN : BRAND_GREEN_SOFT}
                    fillOpacity={i === monthlyData.length - 1 ? 1 : 0.65}
                  />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="border-primary/15 dark:border-primary/25">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Répartition commandes</CardTitle>
          <CardDescription>En attente, Validée et Livrée (hors annulées)</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={{}} className="h-[280px] w-full">
            <PieChart>
              <ChartTooltip content={<ChartTooltipContent />} />
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={85} paddingAngle={3} dataKey="value">
                {pieData.map((e, i) => <Cell key={i} fill={e.fill} />)}
              </Pie>
            </PieChart>
          </ChartContainer>
          <div className="flex flex-wrap gap-x-3 gap-y-1.5 mt-2 justify-center">
            {pieData.map((e, i) => (
              <div key={i} className="flex items-center gap-1.5 text-xs">
                <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: e.fill }} />
                <span className="text-muted-foreground">{e.name} ({e.value})</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

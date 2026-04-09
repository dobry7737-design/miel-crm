import { TopCommerciauxView } from '@/components/crm/top-commerciaux-view'

// Server Component (can use metadata)
export const metadata = {
  title: 'Top Commerciaux | MielCRM',
  description: 'Classement des performances commerciales',
}

export default function TopCommerciauxPage() {
  return <TopCommerciauxView />
}

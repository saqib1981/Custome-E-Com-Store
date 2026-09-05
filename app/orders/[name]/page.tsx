'use client'

import { useParams } from 'next/navigation'
import OrderDetailView from '@/components/orders/OrderDetailView'

export default function OrderDetailPage() {
  const params = useParams()
  const name = String(params?.name ?? '')
  return <OrderDetailView orderNameParam={name} />
}

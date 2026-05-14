import { OrderConfirmationContent } from './OrderConfirmationContent';

interface ConfirmationPageProps {
  params: Promise<{ orderNumber: string }>;
}

export default async function OrderConfirmationPage({ params }: ConfirmationPageProps) {
  const { orderNumber } = await params;
  return <OrderConfirmationContent orderNumber={orderNumber} />;
}

import { IcareProductRoutePage } from '../../components/IcareProductRoutePage';

interface IcareProductPageProps {
  params: Promise<{ slug: string }>;
}

export default async function IcareProductPage({ params }: IcareProductPageProps) {
  const { slug } = await params;
  return <IcareProductRoutePage slug={decodeURIComponent(slug)} />;
}

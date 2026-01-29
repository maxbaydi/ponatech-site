import { RequestDetailsClient } from './request-details-client';

interface RequestDetailsPageProps {
  params: Promise<{ requestNumber: string }>;
}

export default async function RequestDetailsPage({ params }: RequestDetailsPageProps) {
  const resolvedParams = await params;
  return <RequestDetailsClient requestNumber={resolvedParams.requestNumber} />;
}

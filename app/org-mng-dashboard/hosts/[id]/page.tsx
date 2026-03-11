import HostDetailsView from '@/components/org-mng-dashboard/hosts/HostDetailsView';

export default function HostDetailsPage({ params }: { params: { id: string } }) {
  return <HostDetailsView hostId={params.id} />;
}

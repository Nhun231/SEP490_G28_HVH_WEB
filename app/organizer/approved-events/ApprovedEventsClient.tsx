'use client';
import React from 'react';
import PendingEvents from '@/components/dashboard/pending-events';
import { useApprovalEventsList } from "@/hooks/features/uc082-view-organization's-approval-events/useApprovalEventsList";

export default function ApprovedEventsClient({
  user,
  userDetails,
  ...props
}: any) {
  // State for pagination and search
  const [pageNumber, setPageNumber] = React.useState(0);
  const [search, setSearch] = React.useState('');

  const { data, isLoading, error } = useApprovalEventsList({
    pageNumber,
    pageSize: 10,
    name: search,
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || ''
  });

  return (
    <PendingEvents
      user={user}
      userDetails={userDetails}
      externalData={data}
      externalIsLoading={isLoading}
      externalError={error}
      {...props}
    />
  );
}

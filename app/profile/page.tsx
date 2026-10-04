import React, { Suspense } from 'react'
import { ProfileSection } from '@/app/components/ProfileSection'

interface PageProps  {
  searchParams: Promise<{ page?: string }>;
};
function ProfilePage({ searchParams }: PageProps){
  return (
    <div>
        <Suspense>
        <ProfileSection searchParams={searchParams}/>
        </Suspense>
      
        </div>
  )
}

export default ProfilePage
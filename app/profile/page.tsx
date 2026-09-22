import React, { Suspense } from 'react'
import { ProfileSection } from '@/app/components/ProfileSection'


function ProfilePage() {
  return (
    <div>
        <Suspense>
        <ProfileSection/>
        </Suspense>
      
        </div>
  )
}

export default ProfilePage
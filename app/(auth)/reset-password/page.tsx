import { Suspense } from 'react'
import ResetPasswordPage from './ResetPasswordClient'

export default function ResetPasswordWrapper() {
  return (
    <Suspense fallback={<div className="text-center py-20">Loading reset form...</div>}>
      <ResetPasswordPage />
    </Suspense>
  )
}

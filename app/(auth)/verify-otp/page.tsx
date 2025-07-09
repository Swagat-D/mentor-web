import { Suspense } from 'react'
import VerifyOTPPage from './otpClient'

export default function ResetPasswordWrapper() {
  return (
    <Suspense fallback={<div className="text-center py-20">Loading reset form...</div>}>
      <VerifyOTPPage />
    </Suspense>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { CheckCircle, XCircle, Loader } from 'lucide-react'

export default function VerifyEmailPage() {
  const [status, setStatus] = useState('verifying')
  const [message, setMessage] = useState('')
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  useEffect(() => {
    if (token) {
      verifyEmail(token)
    } else {
      setStatus('error')
      setMessage('Invalid verification link')
    }
  }, [token])

  const verifyEmail = async (token: string) => {
    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      })

      const data = await response.json()

      if (response.ok) {
        setStatus('success')
        setMessage(data.message)
        setTimeout(() => {
          window.location.href = data.data.redirectTo
        }, 3000)
      } else {
        setStatus('error')
        setMessage(data.message)
      }
    } catch (error) {
      console.log(error)
      setStatus('error')
      setMessage('An error occurred during verification')
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      {status === 'verifying' && (
        <>
          <Loader className="w-16 h-16 text-blue-500 animate-spin mb-4" />
          <h2 className="text-2xl font-bold mb-2">Verifying Email</h2>
          <p>Please wait while we verify your email address...</p>
        </>
      )}

      {status === 'success' && (
        <>
          <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Email Verified!</h2>
          <p>{message}</p>
          <p>Redirecting you to continue...</p>
        </>
      )}

      {status === 'error' && (
        <>
          <XCircle className="w-16 h-16 text-red-500 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Verification Failed</h2>
          <p>{message}</p>
          <button
            onClick={() => (window.location.href = '/login')}
            className="bg-gradient-to-r from-accent-700 to-accent-600 text-white font-semibold py-2 px-6 rounded-xl mt-4"
          >
            Go to Login
          </button>
        </>
      )}
    </div>
  )
}
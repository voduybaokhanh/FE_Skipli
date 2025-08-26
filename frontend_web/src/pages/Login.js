import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { loading, error, requestAccessCode, verifyAccessCode } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [step, setStep] = useState(1);

  async function handleRequestCode(e) {
    e.preventDefault();
    const ok = await requestAccessCode(phoneNumber);
    if (ok) setStep(2);
  }

  async function handleVerifyCode(e) {
    e.preventDefault();
    await verifyAccessCode(phoneNumber, accessCode);
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-semibold mb-4 text-center">Login</h1>

        {step === 1 && (
          <form onSubmit={handleRequestCode} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Phone Number</label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-500"
                placeholder="e.g. +11234567890"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-60"
            >
              {loading ? 'Sending...' : 'Send Access Code'}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyCode} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">6-digit Code</label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-500 tracking-widest"
                placeholder="______"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:opacity-60"
            >
              {loading ? 'Verifying...' : 'Verify Code'}
            </button>
            <button
              type="button"
              onClick={() => setStep(1)}
              className="w-full border py-2 rounded"
            >
              Back
            </button>
          </form>
        )}

        {error && <p className="text-red-600 text-sm mt-4">{error}</p>}
      </div>
    </div>
  );
}



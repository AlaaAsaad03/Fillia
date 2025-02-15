import React from 'react'
import { useNavigate } from 'react-router-dom'

const ItemDonationSuccess = () => {
    const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white p-6">
    <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
      <h1 className="text-3xl font-bold text-persian-blue mb-4">Donation Successful! 🎉</h1>
      <p className="text-tomato text-lg mb-6">Thank you for your generous donation.</p>

        <button 
          onClick={() => navigate('/')} 
          className="mt-4 px-6 py-3 bg-tomato text-white font-semibold rounded-lg shadow-md hover:bg-red-600 transition duration-300"
        >
          Go to Home
          </button>

    </div>
  </div>
  )
}

export default ItemDonationSuccess
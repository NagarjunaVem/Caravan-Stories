import React, { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../../context/AppContext'
import axios from 'axios'

const HeroSection = () => {
    const navigate = useNavigate()
    const { isLoggedIn, backendUrl } = useContext(AppContext)
    const [employeeCount, setEmployeeCount] = useState(0)
    const [resolvedTkts, setResolvedTkts] = useState(0)
    const [totalTkts, setTotalTkts] = useState(0)
    const [loading, setLoading] = useState(true)

    // Format numbers like 1200 -> 1.2k
    const formatNumber = (num) => {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
        if (num >= 1000) return (num / 1000).toFixed(1) + 'k'
        return num
    }

    useEffect(() => {
        fetchPublicStats()
    }, [backendUrl])

    const fetchPublicStats = async () => {
        setLoading(true)
        try {
            const response = await axios.get(`${backendUrl}/api/stats/public`)
            if (response.data.success) {
                setEmployeeCount(response.data.stats?.employeeCount || 0)
                setResolvedTkts(response.data.stats?.resolvedTickets || 0)
                setTotalTkts(response.data.stats?.totalTickets || 0)
            }
        } catch (error) {
            console.log('Could not fetch public stats')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="h-screen flex items-center justify-center py-4 sm:pb-2">
            <div className="text-center max-w-2xl mx-auto">
                <div>
                    <h1 className="text-slate-900 md:text-4xl text-3xl font-bold mb-4 !leading-tight">
                        Caravan Chronicles — <span className="text-indigo-600">Caravan Stories</span> Grievance Tracker
                    </h1>
                    <p className="text-slate-600 mt-6 text-base leading-relaxed">
                        The Circus of Wonders is a mobile city where infrastructure often fails—roads crack, water leaks, and garbage piles up.
                        Citizen's complaints get lost, lowering morale. This is a grievance tracker so issues can be reported, tracked, and resolved,
                        keeping the circus running smoothly.
                    </p>

                    {!isLoggedIn && (
                        <div className="mt-12 flex flex-wrap gap-x-6 gap-y-4 justify-center">
                            <button
                                type='button'
                                className="bg-indigo-600 hover:bg-transparent hover:text-indigo-600 border border-indigo-600 transition-all text-white font-semibold text-base rounded-full cursor-pointer px-6 py-3"
                                onClick={() => navigate('/login')}
                            >
                                Sign In
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default HeroSection

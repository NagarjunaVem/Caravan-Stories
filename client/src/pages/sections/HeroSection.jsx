import React, { useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../../context/AppContext'

const HeroSection = () => {
    const navigate = useNavigate()
    const {isLoggedIn,ticketSummary} = useContext(AppContext)

    return (
        <>
            <div className="h-screen flex items-center justify-center py-4">
                <div className="text-center max-w-2xl mx-auto">
                    <div>
                        <h1 className="text-slate-900 md:text-4xl text-3xl font-bold mb-4 !leading-tight">Caravan Chronicles — <span className="text-indigo-600">Caravan Stories</span> Grievance Tracker</h1>
                        <p className="text-slate-600 mt-6 text-base leading-relaxed">The Circus of Wonders is a mobile city where infrastructure often fails—roads crack, water leaks, and garbage piles up. Citizen's complaints get lost, lowering morale. This is a grievance tracker so issues can be reported, tracked, and resolved, keeping the circus running smoothly.</p>

                        <div className="grid sm:grid-cols-2 gap-6 items-center mt-12">
                            <div className="flex flex-col items-center text-center">
                                <h5 className="font-bold text-2xl text-indigo-600 mb-2">{ticketSummary?.total || 0}</h5>
                                <p className="text-slate-600 text-base font-medium">Tickets Resolved</p>
                            </div>
                            <div className="flex flex-col items-center text-center">
                                <h5 className="font-bold text-2xl text-indigo-600 mb-2">50+</h5>
                                <p className="text-slate-600 text-base font-medium">Employees</p>
                            </div>
                        </div>

                        {!isLoggedIn && <div className="mt-12 flex flex-wrap gap-x-6 gap-y-4 justify-center">
                            <button type='button'
                                className="bg-indigo-600 hover:bg-transparent hover:text-indigo-600 border border-indigo-600 transition-all text-white font-semibold text-base rounded-full cursor-pointer px-6 py-3" onClick={()=>navigate('/login')}>Sign In</button>
                        </div>}
                    </div>
                </div>
            </div>
        </>
    )
}

export default HeroSection
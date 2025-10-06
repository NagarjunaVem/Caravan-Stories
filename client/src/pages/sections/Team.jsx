import React from 'react'
import nagarjunaImg from '../../assets/Nagarjuna.jpg';
import shubhamImg from '../../assets/Shubham.jpg';

const Team = () => {
    return (
        <>
            <div className="max-w-5xl max-lg:max-w-4xl  max-sm:max-w-sm mx-auto py-20">
                <div className="max-w-2xl mx-auto text-center">
                    <h2 className="text-slate-900 text-4xl font-bold">Meet our team</h2>
                    <p className="text-slate-600 text-[15px] mt-4 leading-relaxed">Meet our team of friends to serve you.</p>
                </div>

                <div className="grid lg:grid-cols-3 md:grid-cols-3 sm:grid-cols-1 gap-x-6 gap-y-20 text-center mt-24">
                    <div className="bg-gray-200 relative rounded-sm">
                        <div className="w-32 h-32 rounded-full inline-block border border-gray-200 bg-gray-100 overflow-hidden -mt-14">
                            <img src={nagarjunaImg} className="w-full h-full" />
                        </div>

                        <div className="py-4">
                            <h4 className="text-slate-900 text-base font-semibold">Vem Nagarjuna Reddy</h4>
                            <p className="text-slate-600 text-[13px] mt-1">MNNIT'28</p>

                            <div className="space-x-4 mt-4">
                                <button type="button"
                                    className="w-7 h-7 inline-flex items-center justify-center rounded-full border-0 outline-0 cursor-pointer bg-gray-100 hover:bg-gray-200">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="12px" className="fill-gray-800" viewBox="0 0 24 24">
                                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                                    </svg>
                                </button>

                                <button type="button"
                                    className="w-7 h-7 inline-flex items-center justify-center rounded-full border-0 outline-0 cursor-pointer  bg-gray-100 hover:bg-gray-200">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="12px" className="fill-gray-800" viewBox="0 0 24 24">
                                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                                    </svg>
                                </button>
                                <button type="button"
                                    className="w-7 h-7 inline-flex items-center justify-center rounded-full border-0 outline-0 cursor-pointer  bg-gray-100 hover:bg-gray-200">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14px" className="fill-gray-800" viewBox="0 0 24 24">
                                        <path
                                            d="M23.994 24v-.001H24v-8.802c0-4.306-.927-7.623-5.961-7.623-2.42 0-4.044 1.328-4.707 2.587h-.07V7.976H8.489v16.023h4.97v-7.934c0-2.089.396-4.109 2.983-4.109 2.549 0 2.587 2.384 2.587 4.243V24zM.396 7.977h4.976V24H.396zM2.882 0C1.291 0 0 1.291 0 2.882s1.291 2.909 2.882 2.909 2.882-1.318 2.882-2.909A2.884 2.884 0 0 0 2.882 0z"
                                            data-original="#0077b5" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-200 relative rounded-sm">
                        <div className="w-32 h-32 rounded-full inline-block border border-gray-200 bg-gray-100 overflow-hidden -mt-14">
                            <img src={shubhamImg} className="w-full h-full" />
                        </div>

                        <div className="py-4">
                            <h4 className="text-slate-900 text-base font-semibold">Mettu Shubham</h4>
                            <p className="text-slate-600 text-[13px] mt-1">MNNIT'28</p>

                            <div className="space-x-4 mt-4">
                                <button type="button"
                                    className="w-7 h-7 inline-flex items-center justify-center rounded-full border-0 outline-0 cursor-pointer bg-gray-100 hover:bg-gray-200">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="12px" className="fill-gray-800" viewBox="0 0 24 24">
                                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                                    </svg>
                                </button>
                                <button type="button"
                                    className="w-7 h-7 inline-flex items-center justify-center rounded-full border-0 outline-0 cursor-pointer  bg-gray-100 hover:bg-gray-200">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="12px" className="fill-gray-800" viewBox="0 0 24 24">
                                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                                    </svg>
                                </button>
                                <button type="button"
                                    className="w-7 h-7 inline-flex items-center justify-center rounded-full border-0 outline-0 cursor-pointer  bg-gray-100 hover:bg-gray-200">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14px" className="fill-gray-800" viewBox="0 0 24 24">
                                        <path
                                            d="M23.994 24v-.001H24v-8.802c0-4.306-.927-7.623-5.961-7.623-2.42 0-4.044 1.328-4.707 2.587h-.07V7.976H8.489v16.023h4.97v-7.934c0-2.089.396-4.109 2.983-4.109 2.549 0 2.587 2.384 2.587 4.243V24zM.396 7.977h4.976V24H.396zM2.882 0C1.291 0 0 1.291 0 2.882s1.291 2.909 2.882 2.909 2.882-1.318 2.882-2.909A2.884 2.884 0 0 0 2.882 0z"
                                            data-original="#0077b5" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-200 relative rounded-sm">
                        <div className="w-32 h-32 rounded-full inline-block border border-gray-200 bg-gray-100 overflow-hidden -mt-14">
                            <img src="https://readymadeui.com/team-1.webp" className="w-full h-full" />
                        </div>

                        <div className="py-4">
                            <h4 className="text-slate-900 text-base font-semibold">Teja Pentakota</h4>
                            <p className="text-slate-600 text-[13px] mt-1">MNNIT'28</p>

                            <div className="space-x-4 mt-4">
                                <button type="button"
                                    className="w-7 h-7 inline-flex items-center justify-center rounded-full border-0 outline-0 cursor-pointer bg-gray-100 hover:bg-gray-200">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="12px" className="fill-gray-800" viewBox="0 0 24 24">
                                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                                    </svg>
                                </button>
                                <button type="button"
                                    className="w-7 h-7 inline-flex items-center justify-center rounded-full border-0 outline-0 cursor-pointer  bg-gray-100 hover:bg-gray-200">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="12px" className="fill-gray-800" viewBox="0 0 24 24">
                                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                                    </svg>
                                </button>
                                <button type="button"
                                    className="w-7 h-7 inline-flex items-center justify-center rounded-full border-0 outline-0 cursor-pointer  bg-gray-100 hover:bg-gray-200">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14px" className="fill-gray-800" viewBox="0 0 24 24">
                                        <path
                                            d="M23.994 24v-.001H24v-8.802c0-4.306-.927-7.623-5.961-7.623-2.42 0-4.044 1.328-4.707 2.587h-.07V7.976H8.489v16.023h4.97v-7.934c0-2.089.396-4.109 2.983-4.109 2.549 0 2.587 2.384 2.587 4.243V24zM.396 7.977h4.976V24H.396zM2.882 0C1.291 0 0 1.291 0 2.882s1.291 2.909 2.882 2.909 2.882-1.318 2.882-2.909A2.884 2.884 0 0 0 2.882 0z"
                                            data-original="#0077b5" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Team
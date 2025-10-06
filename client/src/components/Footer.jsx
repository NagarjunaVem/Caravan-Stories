import React from 'react'

const Footer = () => {
    return (
        <>
            <footer className="flex flex-col md:flex-row gap-3 items-center justify-around w-full py-7 text-sm bg-slate-800 text-white/70">
                <p>Caravan Chronicles — Webster 2025</p>
                <div className='flex gap-x-3 gap-y-1'>
                    <p>Team HalfStack</p>
                    <p>Team Id: 638</p>
                </div>
            </footer>
        </>
    );
};



export default Footer



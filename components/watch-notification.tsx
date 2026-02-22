import React from "react"
import { Watch } from "lucide-react"

interface WatchNotificationProps {
    message: string
}

export function WatchNotification({ message }: WatchNotificationProps) {
    return (
        <div className="flex justify-center my-6">
            <div className="relative w-48 h-60 bg-[#1c1c1e] rounded-[40px] border-[6px] border-[#3a3a3c] shadow-2xl flex flex-col items-center overflow-hidden p-3 pt-6 font-sans">
                {/* Watch Face Content */}
                <div className="flex flex-col items-center w-full space-y-2">
                    {/* App Icon / Notification Header */}
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center mb-1">
                        <Watch className="w-5 h-5 text-primary" />
                    </div>

                    <div className="text-[10px] text-primary font-semibold tracking-wider uppercase">
                        MindGrove
                    </div>

                    <div className="w-full text-center px-2 pt-2">
                        <p className="text-white text-xs leading-relaxed font-medium">
                            {message}
                        </p>
                    </div>

                    <div className="flex-grow" />

                    {/* Action Buttons */}
                    <div className="w-full space-y-2 mt-4">
                        <div className="w-full bg-[#3a3a3c] rounded-xl py-2 text-center text-[10px] text-white font-medium hover:bg-primary/80 transition-colors">
                            Start Now
                        </div>
                        <div className="w-full bg-transparent border border-[#3a3a3c] rounded-xl py-2 text-center text-[10px] text-white/60 font-medium">
                            Later
                        </div>
                    </div>
                </div>

                {/* Digital Crown Detail */}
                <div className="absolute top-12 -right-[6px] w-2 h-8 bg-[#3a3a3c] rounded-l-md" />
                <div className="absolute top-24 -right-[6px] w-1.5 h-12 bg-[#3a3a3c] rounded-l-md" />
            </div>
        </div>
    )
}

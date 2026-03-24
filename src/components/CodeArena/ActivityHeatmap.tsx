import React from 'react';
import { motion } from 'framer-motion';

const ActivityHeatmap = () => {
    // Generate mock data for the last 150 days
    const generateMockData = () => {
        const data = [];
        for (let i = 0; i < 150; i++) {
            // Randomly assign activity level 0-4
            // Bias towards 0 for realism
            let rand = Math.random();
            let level = 0;
            if (rand > 0.6) level = 1;
            if (rand > 0.8) level = 2;
            if (rand > 0.9) level = 3;
            if (rand > 0.95) level = 4;
            data.push(level);
        }
        return data;
    };

    const days = generateMockData();

    // Group into weeks (7 days)
    const weeks = [];
    for (let i = 0; i < days.length; i += 7) {
        weeks.push(days.slice(i, i + 7));
    }

    const getColor = (level: number) => {
        switch (level) {
            case 0: return 'bg-[#1a1a1a] border-[#222]'; // Empty
            case 1: return 'bg-accent-500/20 border-accent-500/30';
            case 2: return 'bg-accent-500/40 border-accent-500/50';
            case 3: return 'bg-accent-500/70 border-accent-500/80';
            case 4: return 'bg-accent-500 border-accent-400';
            default: return 'bg-[#1a1a1a] border-[#222]';
        }
    };

    return (
        <div className="bg-[#0A0A0A] border border-[#333] p-6 rounded-sm w-full flex flex-col gap-4 shadow-xl">
            <div className="flex items-center justify-between">
                <h3 className="text-white font-sans font-bold text-lg">Activity</h3>
                <div className="text-[#888] font-mono text-xs uppercase tracking-widest">
                    <span className="text-white font-bold mr-1">345</span> Submissions in the past year
                </div>
            </div>

            <div className="overflow-x-auto custom-scrollbar pb-2">
                <div className="flex gap-1.5 min-w-max">
                    {weeks.map((week, weekIdx) => (
                        <div key={weekIdx} className="flex flex-col gap-1.5">
                            {week.map((level, dayIdx) => (
                                <motion.div
                                    key={dayIdx}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.2, delay: (weekIdx * 0.01) + (dayIdx * 0.01) }}
                                    className={`w-3.5 h-3.5 rounded-[2px] border ${getColor(level)} hover:border-white transition-colors cursor-pointer relative group`}
                                >
                                    {/* Tooltip */}
                                    <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity bottom-full left-1/2 -translate-x-1/2 mb-2 bg-[#111] text-white text-[10px] font-mono px-2 py-1 rounded-sm whitespace-nowrap border border-[#333] z-10 pointer-events-none">
                                        {level === 0 ? 'No submissions' : `${level * 3} submissions`}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex items-center justify-end gap-2 text-[#666] font-mono text-[9px] uppercase tracking-widest mt-2">
                <span>Less</span>
                <div className="flex gap-1">
                    <div className="w-3 h-3 rounded-[1px] bg-[#1a1a1a] border border-[#222]"></div>
                    <div className="w-3 h-3 rounded-[1px] bg-accent-500/20 border border-accent-500/30"></div>
                    <div className="w-3 h-3 rounded-[1px] bg-accent-500/40 border border-accent-500/50"></div>
                    <div className="w-3 h-3 rounded-[1px] bg-accent-500/70 border border-accent-500/80"></div>
                    <div className="w-3 h-3 rounded-[1px] bg-accent-500 border border-accent-400"></div>
                </div>
                <span>More</span>
            </div>
        </div>
    );
};

export default ActivityHeatmap;

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { codeArenaApi } from '../../lib/api';

interface SubmissionData {
    id: string;
    submitted_at: string;
    status: string;
}

const ActivityHeatmap = () => {
    const [submissionCounts, setSubmissionCounts] = useState<Record<string, number>>({});
    const [totalSubmissions, setTotalSubmissions] = useState(0);

    useEffect(() => {
        const fetchSubmissions = async () => {
            try {
                const counts: Record<string, number> = {};
                let page = 1;
                let hasMore = true;

                while (hasMore) {
                    const res = await codeArenaApi.getSubmissions(undefined, page, 500);
                    const data = res.data as any;
                    const submissions: SubmissionData[] = data.submissions || [];

                    if (submissions.length === 0) {
                        hasMore = false;
                        break;
                    }

                    for (const sub of submissions) {
                        const date = new Date(sub.submitted_at).toISOString().split('T')[0];
                        counts[date] = (counts[date] || 0) + 1;
                    }

                    if (page >= data.pagination?.totalPages) {
                        hasMore = false;
                    } else {
                        page++;
                    }
                }

                setSubmissionCounts(counts);
                const total = Object.values(counts).reduce((sum, c) => sum + c, 0);
                setTotalSubmissions(total);
            } catch (error) {
                console.error("Failed to fetch submissions for heatmap", error);
            }
        };

        fetchSubmissions();
    }, []);

    const generateWeeks = () => {
        const weeks: { date: Date; count: number }[][] = [];
        const today = new Date();
        const startDate = new Date(today);
        startDate.setDate(startDate.getDate() - 364);

        let currentWeek: { date: Date; count: number }[] = [];
        const firstDayOfWeek = startDate.getDay();
        for (let i = 0; i < firstDayOfWeek; i++) {
            currentWeek.push({ date: new Date(startDate.getTime() - (firstDayOfWeek - i) * 24 * 60 * 60 * 1000), count: 0 });
        }

        for (let d = new Date(startDate); d <= today; d.setDate(d.getDate() + 1)) {
            const dateStr = d.toISOString().split('T')[0];
            const count = submissionCounts[dateStr] || 0;
            currentWeek.push({ date: new Date(d), count });

            if (currentWeek.length === 7) {
                weeks.push(currentWeek);
                currentWeek = [];
            }
        }

        if (currentWeek.length > 0) {
            while (currentWeek.length < 7) {
                const nextDate = new Date(currentWeek[currentWeek.length - 1].date);
                nextDate.setDate(nextDate.getDate() + 1);
                currentWeek.push({ date: nextDate, count: 0 });
            }
            weeks.push(currentWeek);
        }

        return weeks;
    };

    const getColor = (count: number) => {
        if (count === 0) return 'bg-[#1a1a1a] border-[#222]';
        if (count <= 2) return 'bg-accent-500/20 border-accent-500/30';
        if (count <= 5) return 'bg-accent-500/40 border-accent-500/50';
        if (count <= 10) return 'bg-accent-500/70 border-accent-500/80';
        return 'bg-accent-500 border-accent-400';
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const weeks = generateWeeks();

    return (
        <div className="bg-[#0A0A0A] border border-[#333] p-6 rounded-sm w-full flex flex-col gap-4 shadow-xl">
            <div className="flex items-center justify-between">
                <h3 className="text-white font-sans font-bold text-lg">Activity</h3>
                <div className="text-[#888] font-mono text-xs uppercase tracking-widest">
                    <span className="text-white font-bold mr-1">{totalSubmissions}</span> Submissions in the past year
                </div>
            </div>

            <div className="overflow-x-auto custom-scrollbar pb-2">
                <div className="flex gap-1.5 min-w-max">
                    {weeks.map((week, weekIdx) => (
                        <div key={weekIdx} className="flex flex-col gap-1.5">
                            {week.map((day, dayIdx) => (
                                <motion.div
                                    key={dayIdx}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.2, delay: (weekIdx * 0.005) + (dayIdx * 0.005) }}
                                    className={`w-3.5 h-3.5 rounded-[2px] border ${getColor(day.count)} hover:border-white transition-colors cursor-pointer relative group`}
                                >
                                    <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity bottom-full left-1/2 -translate-x-1/2 mb-2 bg-[#111] text-white text-[10px] font-mono px-2 py-1 rounded-sm whitespace-nowrap border border-[#333] z-10 pointer-events-none">
                                        {formatDate(day.date)}: {day.count === 0 ? 'No submissions' : `${day.count} submission${day.count !== 1 ? 's' : ''}`}
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
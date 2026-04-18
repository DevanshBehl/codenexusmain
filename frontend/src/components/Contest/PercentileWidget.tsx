import { useState, useEffect, useRef, useCallback } from 'react';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { TrendingUp, TrendingDown, Minus, Users } from 'lucide-react';
import { useSocket } from '../../lib/useSocket';
import { contestApi } from '../../lib/api';

interface PercentileDataPoint {
    time: string;
    percentile: number;
    timestamp: number;
}

interface PercentileWidgetProps {
    contestId: string;
    contestStatus: string;
}

export default function PercentileWidget({ contestId, contestStatus }: PercentileWidgetProps) {
    const { socket, isConnected } = useSocket();
    const [percentile, setPercentile] = useState<number | null>(null);
    const [totalParticipants, setTotalParticipants] = useState(0);
    const [history, setHistory] = useState<PercentileDataPoint[]>([]);
    const [trend, setTrend] = useState<'up' | 'down' | 'stable'>('stable');
    const joinedRef = useRef(false);

    const addDataPoint = useCallback((pct: number) => {
        const now = new Date();
        const timeLabel = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
        setHistory(prev => {
            const next = [...prev, { time: timeLabel, percentile: pct, timestamp: now.getTime() }];
            if (next.length > 60) next.shift();
            return next;
        });
    }, []);

    useEffect(() => {
        if (!contestId || contestStatus !== 'ACTIVE') return;
        contestApi.getMyPercentile(contestId)
            .then(res => {
                const { percentile: pct, totalParticipants: total } = res.data;
                setPercentile(pct);
                setTotalParticipants(total);
                addDataPoint(pct);
            })
            .catch(() => {});
    }, [contestId, contestStatus, addDataPoint]);

    useEffect(() => {
        if (!socket || !isConnected || !contestId || contestStatus !== 'ACTIVE') return;
        if (joinedRef.current) return;

        socket.emit('join-contest-live', { contestId });
        joinedRef.current = true;

        const handler = (data: { percentile: number; totalParticipants: number }) => {
            setPercentile(prev => {
                if (prev !== null) {
                    if (data.percentile > prev) setTrend('up');
                    else if (data.percentile < prev) setTrend('down');
                    else setTrend('stable');
                }
                return data.percentile;
            });
            setTotalParticipants(data.totalParticipants);
            addDataPoint(data.percentile);
        };

        socket.on('percentile-update', handler);

        return () => {
            socket.off('percentile-update', handler);
            joinedRef.current = false;
        };
    }, [socket, isConnected, contestId, contestStatus, addDataPoint]);

    if (contestStatus !== 'ACTIVE' || percentile === null) return null;

    const trendIcon = trend === 'up'
        ? <TrendingUp size={14} className="text-green-400" />
        : trend === 'down'
            ? <TrendingDown size={14} className="text-red-400" />
            : <Minus size={14} className="text-[#888]" />;

    const percentileColor = percentile >= 75 ? '#22c55e' : percentile >= 50 ? '#eab308' : percentile >= 25 ? '#f97316' : '#ef4444';

    return (
        <div className="border border-[#222] bg-[#0A0A0A] rounded-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-[#222] bg-[#111] flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#888]">Live Percentile</span>
                <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 text-[10px] font-mono text-[#666]">
                        <Users size={10} /> {totalParticipants}
                    </span>
                    <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                </div>
            </div>

            <div className="px-4 pt-3 pb-1 flex items-end gap-3">
                <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl font-bold font-mono" style={{ color: percentileColor }}>
                        {percentile.toFixed(1)}
                    </span>
                    <span className="text-xs text-[#888] font-mono">%ile</span>
                </div>
                <div className="flex items-center gap-1 mb-1">
                    {trendIcon}
                </div>
            </div>

            <div className="px-4 pb-1">
                <p className="text-[11px] text-[#888] font-sans">
                    You are ahead of <span className="text-white font-bold">{percentile.toFixed(1)}%</span> of participants
                </p>
            </div>

            {history.length >= 2 && (
                <div className="h-28 px-2 pb-2">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={history} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="percentileGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={percentileColor} stopOpacity={0.3} />
                                    <stop offset="95%" stopColor={percentileColor} stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis
                                dataKey="time"
                                tick={{ fontSize: 9, fill: '#555' }}
                                axisLine={false}
                                tickLine={false}
                                interval="preserveStartEnd"
                            />
                            <YAxis
                                domain={[0, 100]}
                                tick={{ fontSize: 9, fill: '#555' }}
                                axisLine={false}
                                tickLine={false}
                                tickCount={3}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#111',
                                    border: '1px solid #333',
                                    borderRadius: '2px',
                                    fontSize: '11px',
                                    fontFamily: 'monospace',
                                }}
                                labelStyle={{ color: '#888' }}
                                itemStyle={{ color: percentileColor }}
                                formatter={(value: number) => [`${value.toFixed(1)}%`, 'Percentile']}
                            />
                            <Area
                                type="monotone"
                                dataKey="percentile"
                                stroke={percentileColor}
                                strokeWidth={2}
                                fill="url(#percentileGrad)"
                                dot={false}
                                activeDot={{ r: 3, fill: percentileColor, stroke: '#0A0A0A', strokeWidth: 2 }}
                                isAnimationActive={false}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            )}
        </div>
    );
}

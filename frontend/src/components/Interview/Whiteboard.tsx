import { useState, useRef, useCallback, useEffect } from 'react';
import {
    Pencil,
    Square,
    Circle,
    Minus,
    MoveRight,
    Eraser,
    Type,
    Undo2,
    Redo2,
    Trash2,
    Palette
} from 'lucide-react';
import { Socket } from 'socket.io-client';

/* ────────── Types ────────── */
type Tool = 'pencil' | 'rectangle' | 'circle' | 'line' | 'arrow' | 'eraser' | 'text';

interface Point {
    x: number;
    y: number;
}

interface DrawElement {
    id: string;
    tool: Tool;
    points: Point[];
    color: string;
    strokeWidth: number;
    text?: string;
}

interface WhiteboardProps {
    socket: Socket | null;
    interviewId: string;
    role: 'student' | 'recruiter';
}

const TOOLS: { key: Tool; icon: typeof Pencil; label: string }[] = [
    { key: 'pencil', icon: Pencil, label: 'Pencil' },
    { key: 'rectangle', icon: Square, label: 'Rectangle' },
    { key: 'circle', icon: Circle, label: 'Circle' },
    { key: 'line', icon: Minus, label: 'Line' },
    { key: 'arrow', icon: MoveRight, label: 'Arrow' },
    { key: 'eraser', icon: Eraser, label: 'Eraser' },
    { key: 'text', icon: Type, label: 'Text' },
];

const COLORS = ['#ffffff', '#00e5c8', '#f87171', '#facc15', '#60a5fa', '#a78bfa', '#f472b6', '#34d399'];
const STROKE_WIDTHS = [2, 4, 6, 8];

/* ────────── Component ────────── */
export default function Whiteboard({ socket, interviewId }: WhiteboardProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const [activeTool, setActiveTool] = useState<Tool>('pencil');
    const [color, setColor] = useState('#ffffff');
    const [strokeWidth, setStrokeWidth] = useState(2);
    const [showColorPicker, setShowColorPicker] = useState(false);

    const [elements, setElements] = useState<DrawElement[]>([]);
    const [undoStack, setUndoStack] = useState<DrawElement[][]>([]);
    const [redoStack, setRedoStack] = useState<DrawElement[][]>([]);

    const [isDrawing, setIsDrawing] = useState(false);
    const [currentElement, setCurrentElement] = useState<DrawElement | null>(null);

    const [textInput, setTextInput] = useState<{ x: number; y: number; visible: boolean }>({
        x: 0,
        y: 0,
        visible: false,
    });
    const [textValue, setTextValue] = useState('');
    const textInputRef = useRef<HTMLInputElement>(null);

    const isRemoteUpdate = useRef(false);
    const syncTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

    /* ── Sync helper: broadcast elements to the other side ── */
    const broadcastElements = useCallback((els: DrawElement[]) => {
        if (!socket || isRemoteUpdate.current) return;
        if (syncTimeout.current) clearTimeout(syncTimeout.current);
        syncTimeout.current = setTimeout(() => {
            socket.emit('whiteboard-sync', {
                interviewId,
                elements: els,
            });
        }, 100);
    }, [socket, interviewId]);

    /* ── Canvas sizing ── */
    useEffect(() => {
        const resize = () => {
            const canvas = canvasRef.current;
            const container = containerRef.current;
            if (!canvas || !container) return;
            canvas.width = container.clientWidth;
            canvas.height = container.clientHeight;
        };
        resize();
        window.addEventListener('resize', resize);
        return () => window.removeEventListener('resize', resize);
    }, []);

    /* ── Redraw on element changes ── */
    useEffect(() => {
        redraw([...elements, ...(currentElement ? [currentElement] : [])]);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [elements, currentElement]);

    /* ── Listen for remote whiteboard changes ── */
    useEffect(() => {
        if (!socket) return;

        const handleWhiteboardSync = (data: { elements: DrawElement[] }) => {
            isRemoteUpdate.current = true;
            setElements(data.elements);
            isRemoteUpdate.current = false;
        };

        socket.on('whiteboard-sync', handleWhiteboardSync);
        return () => {
            socket.off('whiteboard-sync', handleWhiteboardSync);
        };
    }, [socket]);

    /* ── Drawing engine ── */
    const redraw = useCallback(
        (els: DrawElement[]) => {
            const canvas = canvasRef.current;
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // subtle grid
            ctx.strokeStyle = '#1a1a1a';
            ctx.lineWidth = 0.5;
            const gridSize = 24;
            for (let x = 0; x < canvas.width; x += gridSize) {
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, canvas.height);
                ctx.stroke();
            }
            for (let y = 0; y < canvas.height; y += gridSize) {
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(canvas.width, y);
                ctx.stroke();
            }

            els.forEach(el => {
                ctx.strokeStyle = el.tool === 'eraser' ? '#050505' : el.color;
                ctx.fillStyle = el.color;
                ctx.lineWidth = el.tool === 'eraser' ? el.strokeWidth * 4 : el.strokeWidth;
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';

                if (el.tool === 'pencil' || el.tool === 'eraser') {
                    if (el.points.length < 2) return;
                    ctx.beginPath();
                    ctx.moveTo(el.points[0].x, el.points[0].y);
                    for (let i = 1; i < el.points.length; i++) {
                        ctx.lineTo(el.points[i].x, el.points[i].y);
                    }
                    ctx.stroke();
                } else if (el.tool === 'rectangle') {
                    if (el.points.length < 2) return;
                    const [p1, p2] = [el.points[0], el.points[el.points.length - 1]];
                    ctx.beginPath();
                    ctx.rect(p1.x, p1.y, p2.x - p1.x, p2.y - p1.y);
                    ctx.stroke();
                } else if (el.tool === 'circle') {
                    if (el.points.length < 2) return;
                    const [p1, p2] = [el.points[0], el.points[el.points.length - 1]];
                    const rx = Math.abs(p2.x - p1.x) / 2;
                    const ry = Math.abs(p2.y - p1.y) / 2;
                    const cx = (p1.x + p2.x) / 2;
                    const cy = (p1.y + p2.y) / 2;
                    ctx.beginPath();
                    ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
                    ctx.stroke();
                } else if (el.tool === 'line') {
                    if (el.points.length < 2) return;
                    const [p1, p2] = [el.points[0], el.points[el.points.length - 1]];
                    ctx.beginPath();
                    ctx.moveTo(p1.x, p1.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.stroke();
                } else if (el.tool === 'arrow') {
                    if (el.points.length < 2) return;
                    const [p1, p2] = [el.points[0], el.points[el.points.length - 1]];
                    ctx.beginPath();
                    ctx.moveTo(p1.x, p1.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.stroke();
                    // arrowhead
                    const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
                    const headLen = 12;
                    ctx.beginPath();
                    ctx.moveTo(p2.x, p2.y);
                    ctx.lineTo(p2.x - headLen * Math.cos(angle - Math.PI / 6), p2.y - headLen * Math.sin(angle - Math.PI / 6));
                    ctx.moveTo(p2.x, p2.y);
                    ctx.lineTo(p2.x - headLen * Math.cos(angle + Math.PI / 6), p2.y - headLen * Math.sin(angle + Math.PI / 6));
                    ctx.stroke();
                } else if (el.tool === 'text' && el.text) {
                    ctx.font = `${el.strokeWidth * 6}px "JetBrains Mono", monospace`;
                    ctx.fillText(el.text, el.points[0].x, el.points[0].y);
                }
            });
        },
        [],
    );

    /* ── Mouse handlers ── */
    const getPos = (e: React.MouseEvent): Point => {
        const canvas = canvasRef.current!;
        const rect = canvas.getBoundingClientRect();
        return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        const pos = getPos(e);

        if (activeTool === 'text') {
            setTextInput({ x: pos.x, y: pos.y, visible: true });
            setTextValue('');
            setTimeout(() => textInputRef.current?.focus(), 50);
            return;
        }

        setIsDrawing(true);
        setUndoStack(prev => [...prev, elements]);
        setRedoStack([]);

        const newEl: DrawElement = {
            id: Math.random().toString(36).slice(2),
            tool: activeTool,
            points: [pos],
            color,
            strokeWidth,
        };
        setCurrentElement(newEl);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDrawing || !currentElement) return;
        const pos = getPos(e);

        if (currentElement.tool === 'pencil' || currentElement.tool === 'eraser') {
            setCurrentElement(prev => prev ? { ...prev, points: [...prev.points, pos] } : null);
        } else {
            // shapes: only keep start + current end
            setCurrentElement(prev =>
                prev ? { ...prev, points: [prev.points[0], pos] } : null,
            );
        }
    };

    const handleMouseUp = () => {
        if (!isDrawing || !currentElement) return;
        setIsDrawing(false);
        const newElements = [...elements, currentElement];
        setElements(newElements);
        setCurrentElement(null);
        // Broadcast the completed stroke
        broadcastElements(newElements);
    };

    const commitText = () => {
        if (!textValue.trim()) {
            setTextInput({ x: 0, y: 0, visible: false });
            return;
        }
        setUndoStack(prev => [...prev, elements]);
        setRedoStack([]);
        const newElements = [
            ...elements,
            {
                id: Math.random().toString(36).slice(2),
                tool: 'text' as Tool,
                points: [{ x: textInput.x, y: textInput.y }],
                color,
                strokeWidth,
                text: textValue,
            },
        ];
        setElements(newElements);
        setTextInput({ x: 0, y: 0, visible: false });
        setTextValue('');
        broadcastElements(newElements);
    };

    /* ── Undo / Redo ── */
    const undo = () => {
        if (undoStack.length === 0) return;
        const prev = undoStack[undoStack.length - 1];
        setRedoStack(r => [...r, elements]);
        setElements(prev);
        setUndoStack(u => u.slice(0, -1));
        broadcastElements(prev);
    };

    const redo = () => {
        if (redoStack.length === 0) return;
        const next = redoStack[redoStack.length - 1];
        setUndoStack(u => [...u, elements]);
        setElements(next);
        setRedoStack(r => r.slice(0, -1));
        broadcastElements(next);
    };

    const clearCanvas = () => {
        setUndoStack(prev => [...prev, elements]);
        setRedoStack([]);
        setElements([]);
        broadcastElements([]);
    };

    /* ── Keyboard shortcuts ── */
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
                e.preventDefault();
                if (e.shiftKey) redo();
                else undo();
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [undoStack, redoStack, elements]);

    return (
        <div className="flex-1 flex flex-col bg-[#050505] relative overflow-hidden" ref={containerRef}>
            {/* Toolbar */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1 bg-[#0A0A0A]/90 backdrop-blur-md border border-[#333] rounded-sm px-2 py-1.5">
                {TOOLS.map(t => (
                    <button
                        key={t.key}
                        onClick={() => setActiveTool(t.key)}
                        title={t.label}
                        className={`p-2 rounded-sm transition-colors ${
                            activeTool === t.key
                                ? 'bg-accent-500/20 text-accent-400 border border-accent-500/30'
                                : 'text-[#888] hover:text-white hover:bg-[#222] border border-transparent'
                        }`}
                    >
                        <t.icon size={16} />
                    </button>
                ))}

                <div className="w-px h-6 bg-[#333] mx-1" />

                {/* Stroke width */}
                <div className="flex items-center gap-0.5">
                    {STROKE_WIDTHS.map(w => (
                        <button
                            key={w}
                            onClick={() => setStrokeWidth(w)}
                            title={`${w}px`}
                            className={`w-7 h-7 flex items-center justify-center rounded-sm transition-colors ${
                                strokeWidth === w
                                    ? 'bg-[#222] border border-[#444]'
                                    : 'hover:bg-[#1a1a1a] border border-transparent'
                            }`}
                        >
                            <div
                                className="rounded-full bg-white"
                                style={{ width: w + 2, height: w + 2 }}
                            />
                        </button>
                    ))}
                </div>

                <div className="w-px h-6 bg-[#333] mx-1" />

                {/* Color */}
                <div className="relative">
                    <button
                        onClick={() => setShowColorPicker(!showColorPicker)}
                        className="p-2 rounded-sm hover:bg-[#222] text-[#888] hover:text-white transition-colors border border-transparent flex items-center gap-1"
                    >
                        <Palette size={16} />
                        <div className="w-3 h-3 rounded-full border border-[#555]" style={{ background: color }} />
                    </button>
                    {showColorPicker && (
                        <div className="absolute top-full mt-2 left-0 bg-[#0A0A0A] border border-[#333] rounded-sm p-2 grid grid-cols-4 gap-1 z-40">
                            {COLORS.map(c => (
                                <button
                                    key={c}
                                    onClick={() => {
                                        setColor(c);
                                        setShowColorPicker(false);
                                    }}
                                    className={`w-7 h-7 rounded-sm border-2 transition-transform hover:scale-110 ${
                                        color === c ? 'border-accent-400' : 'border-[#333]'
                                    }`}
                                    style={{ background: c }}
                                />
                            ))}
                        </div>
                    )}
                </div>

                <div className="w-px h-6 bg-[#333] mx-1" />

                {/* Undo / Redo / Clear */}
                <button
                    onClick={undo}
                    disabled={undoStack.length === 0}
                    className="p-2 rounded-sm text-[#888] hover:text-white hover:bg-[#222] transition-colors disabled:opacity-30 disabled:cursor-not-allowed border border-transparent"
                    title="Undo (⌘Z)"
                >
                    <Undo2 size={16} />
                </button>
                <button
                    onClick={redo}
                    disabled={redoStack.length === 0}
                    className="p-2 rounded-sm text-[#888] hover:text-white hover:bg-[#222] transition-colors disabled:opacity-30 disabled:cursor-not-allowed border border-transparent"
                    title="Redo (⌘⇧Z)"
                >
                    <Redo2 size={16} />
                </button>
                <button
                    onClick={clearCanvas}
                    className="p-2 rounded-sm text-[#888] hover:text-red-400 hover:bg-red-500/10 transition-colors border border-transparent"
                    title="Clear Canvas"
                >
                    <Trash2 size={16} />
                </button>
            </div>

            {/* Canvas */}
            <canvas
                ref={canvasRef}
                className={`flex-1 ${activeTool === 'eraser' ? 'cursor-cell' : activeTool === 'text' ? 'cursor-text' : 'cursor-crosshair'}`}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
            />

            {/* Text input overlay */}
            {textInput.visible && (
                <input
                    ref={textInputRef}
                    type="text"
                    value={textValue}
                    onChange={e => setTextValue(e.target.value)}
                    onKeyDown={e => {
                        if (e.key === 'Enter') commitText();
                        if (e.key === 'Escape') setTextInput({ x: 0, y: 0, visible: false });
                    }}
                    onBlur={commitText}
                    className="absolute bg-transparent border border-accent-500/50 text-white font-mono text-sm px-1 py-0.5 outline-none"
                    style={{ left: textInput.x, top: textInput.y - 10, minWidth: 120 }}
                    autoFocus
                />
            )}
        </div>
    );
}

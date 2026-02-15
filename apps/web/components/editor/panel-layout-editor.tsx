"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { X, Check, RotateCcw, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LayoutColumn, DEFAULT_LAYOUT } from "./layout-types";
import { useLocalStorage } from "@/hooks/use-local-storage";

interface PanelLayoutEditorProps {
    open: boolean;
    onClose: (apply?: boolean) => void;
}

export function PanelLayoutEditor({ open, onClose }: PanelLayoutEditorProps) {
    const [mounted, setMounted] = useState(false);
    const [layout, setLayout] = useLocalStorage<LayoutColumn[]>("caplay_editor_layout", DEFAULT_LAYOUT);

    const [tempLayout, setTempLayout] = useState<LayoutColumn[]>(layout);
    const [activeDragId, setActiveDragId] = useState<string | null>(null);
    const [dragOverId, setDragOverId] = useState<string | null>(null);
    const [scale, setScale] = useState(1);
    const [viewportSize, setViewportSize] = useState({ width: 1200, height: 800 });
    const containerRef = useRef<HTMLDivElement>(null);
    const areaRef = useRef<HTMLDivElement>(null);

    useEffect(() => setMounted(true), []);

    useEffect(() => {
        if (open) {
            setTempLayout(layout);
        }
    }, [open, layout]);

    useEffect(() => {
        if (!open) return;

        const updateDimensions = () => {
            const actualWidth = typeof window !== 'undefined' ? window.innerWidth - 32 : 1200;
            const actualHeight = typeof window !== 'undefined' ? window.innerHeight - 64 - 32 : 800;

            setViewportSize({ width: actualWidth, height: actualHeight });

            if (areaRef.current) {
                const areaWidth = areaRef.current.clientWidth - 64;
                const areaHeight = areaRef.current.clientHeight - 64;

                const scaleX = areaWidth / actualWidth;
                const scaleY = areaHeight / actualHeight;

                setScale(Math.min(scaleX, scaleY));
            }
        };

        const observer = new ResizeObserver(updateDimensions);
        if (areaRef.current) observer.observe(areaRef.current);
        window.addEventListener('resize', updateDimensions);

        updateDimensions();

        return () => {
            observer.disconnect();
            window.removeEventListener('resize', updateDimensions);
        };
    }, [open]);

    const hasChanges = JSON.stringify(tempLayout) !== JSON.stringify(layout);

    const handleCloseAttempt = () => {
        if (hasChanges) {
            if (window.confirm("You have unsaved layout changes. Are you sure you want to close?")) {
                onClose();
            }
        } else {
            onClose();
        }
    };

    const handleSave = () => {
        setLayout(tempLayout);
        onClose(true);
    };

    const handleReset = () => {
        setTempLayout(DEFAULT_LAYOUT);
    };

    const handleDragStart = (e: React.DragEvent, id: string) => {
        setActiveDragId(id);
        e.dataTransfer.effectAllowed = "move";
    };

    const handleDragOver = (e: React.DragEvent, id: string) => {
        e.preventDefault();
        if (activeDragId === id) return;
        setDragOverId(id);
    };

    const handleDrop = (e: React.DragEvent, targetId: string) => {
        e.preventDefault();
        if (!activeDragId || activeDragId === targetId) {
            setActiveDragId(null);
            setDragOverId(null);
            return;
        }

        const newLayout = [...tempLayout];
        const oldIndex = newLayout.findIndex(c => c.id === activeDragId);
        const newIndex = newLayout.findIndex(c => c.id === targetId);

        if (oldIndex !== -1 && newIndex !== -1) {
            const [moved] = newLayout.splice(oldIndex, 1);
            newLayout.splice(newIndex, 0, moved);
            setTempLayout(newLayout);
        }

        setActiveDragId(null);
        setDragOverId(null);
    };

    const handleResize = (e: React.MouseEvent<HTMLDivElement>, index: number) => {
        e.preventDefault();
        e.stopPropagation();

        const startX = e.clientX;

        const col = tempLayout[index];
        const targetIndex = col.flex ? index + 1 : index;
        const isNext = col.flex;
        const startWidth = tempLayout[targetIndex].width;

        const onMove = (ev: MouseEvent) => {
            const dx = (ev.clientX - startX) / scale;
            const delta = isNext ? -dx : dx;
            const newWidth = Math.max(100, Math.min(800, startWidth + delta));

            setTempLayout((prev: LayoutColumn[]) => {
                const next = [...prev];
                if (next[targetIndex]) {
                    next[targetIndex] = { ...next[targetIndex], width: newWidth };
                }
                return next;
            });
        };

        const onUp = () => {
            window.removeEventListener('mousemove', onMove);
            window.removeEventListener('mouseup', onUp);
        };

        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onUp);
    };


    if (!mounted || !open) return null;

    return createPortal(
        <div className="fixed inset-0 z-[1002] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 md:p-8">
            <div className="bg-background border rounded-2xl shadow-2xl w-full max-w-6xl h-[85vh] flex flex-col overflow-hidden">
                <div className="flex items-center justify-between p-6 border-b">
                    <div>
                        <h2 className="text-2xl font-bold">Layout Editor</h2>
                        <p className="text-muted-foreground">Proportional preview of your workspace layout.</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" onClick={handleReset}>
                            <RotateCcw className="mr-2 h-4 w-4" /> Reset
                        </Button>
                        <Button variant="default" onClick={handleSave}>
                            <Check className="mr-2 h-4 w-4" /> Apply & Close
                        </Button>
                        <Button variant="ghost" size="icon" onClick={handleCloseAttempt}>
                            <X className="h-5 w-5" />
                        </Button>
                    </div>
                </div>

                <div ref={areaRef} className="flex-1 bg-muted/20 p-8 flex items-center justify-center overflow-hidden">
                    <div
                        ref={containerRef}
                        className="layout-preview-container relative flex bg-background border shadow-2xl rounded-xl overflow-hidden shadow-primary/5"
                        style={{
                            width: viewportSize.width * scale,
                            height: viewportSize.height * scale,
                            gap: 16 * scale,
                            padding: 16 * scale
                        }}
                    >
                        {tempLayout.map((col: LayoutColumn, index: number) => {
                            const isDragging = activeDragId === col.id;
                            const isOver = dragOverId === col.id;
                            const isLast = index === tempLayout.length - 1;

                            return (
                                <React.Fragment key={col.id}>
                                    <div
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, col.id)}
                                        onDragOver={(e) => handleDragOver(e, col.id)}
                                        onDrop={(e) => handleDrop(e, col.id)}
                                        onDragEnd={() => { setActiveDragId(null); setDragOverId(null); }}
                                        className={cn(
                                            "relative flex flex-col transition-all duration-200 overflow-hidden",
                                            isDragging ? "opacity-40" : "opacity-100",
                                            isOver ? "bg-accent/10 rounded-xl" : "transparent",
                                            col.flex ? "flex-1 min-w-0" : "flex-none"
                                        )}
                                        style={{
                                            width: col.flex ? undefined : col.width * scale,
                                            minWidth: col.flex ? 100 * scale : undefined
                                        }}
                                    >
                                        <div className="flex-1 rounded-xl border-2 border-dashed border-muted-foreground/20 bg-muted/5 flex flex-col relative group overflow-hidden">

                                            <div className="absolute top-0 left-0 right-0 h-10 flex items-center justify-center cursor-grab active:cursor-grabbing bg-muted/20 border-b border-dashed border-muted-foreground/10 group-hover:bg-muted/40 transition-colors">
                                                <GripVertical className="h-4 w-4 text-muted-foreground" />
                                            </div>

                                            <div className="flex-1 flex flex-col items-center justify-center p-4 pt-12 select-none pointer-events-none">
                                                <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-2">
                                                    {col.id.toUpperCase()}
                                                </div>

                                                <div className="flex flex-wrap gap-1 justify-center">
                                                    {col.items.map((p: string) => (
                                                        <div key={p} className="px-2 py-0.5 rounded-full bg-primary/10 text-[8px] text-primary font-medium">
                                                            {p}
                                                        </div>
                                                    ))}
                                                </div>

                                                <div className="mt-4 flex flex-col items-center gap-1">
                                                    {!col.flex ? (
                                                        <span className="text-[9px] font-mono bg-background border px-1.5 py-0.5 rounded shadow-sm text-foreground/70">
                                                            {Math.round(col.width)}px
                                                        </span>
                                                    ) : (
                                                        <span className="text-[9px] font-mono bg-primary/20 border border-primary/30 px-1.5 py-0.5 rounded shadow-sm text-primary font-bold">
                                                            Scale Auto
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {!isLast && (
                                        <div
                                            className="relative h-full cursor-col-resize hover:bg-primary/10 active:bg-primary/20 flex items-center justify-center z-20 group transition-all"
                                            style={{
                                                width: 16 * scale,
                                                marginLeft: -16 * scale,
                                                marginRight: -16 * scale
                                            }}
                                            onMouseDown={(e) => handleResize(e, index)}
                                        >
                                            <div
                                                className="w-[2px] bg-primary/10 group-hover:bg-primary/40 rounded-full transition-colors"
                                                style={{ height: 32 * scale }}
                                            />
                                        </div>
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </div>
                </div>

                <div className="p-4 border-t bg-muted/10 text-xs text-muted-foreground text-center">
                    The preview above is scaled to your current window size for accuracy. Drag bars to reorder, dividers to resize.
                </div>
            </div>
        </div>,
        document.body
    );
}

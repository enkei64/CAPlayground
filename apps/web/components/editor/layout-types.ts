export type PanelId = 'layers' | 'inspector' | 'canvas';

export type LayoutColumn = {
    id: string;
    items: PanelId[];
    width: number;
    flex?: number;
};

export const DEFAULT_LAYOUT: LayoutColumn[] = [
    { id: 'left', items: ['layers'], width: 320 },
    { id: 'center', items: ['canvas'], width: 0, flex: 1 },
    { id: 'right', items: ['inspector'], width: 400 }
];

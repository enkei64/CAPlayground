
import { readText, writeText, IS_DESKTOP } from './fs';

const SETTINGS_FILE = 'caplayground/settings.json';

interface Settings {
    tosAccepted?: boolean;
    onboardingSeen?: boolean;
    [key: string]: any;
}

let cachedSettings: Settings | null = null;
let settingsPromise: Promise<Settings> | null = null;

async function loadSettingsInternal(): Promise<Settings> {
    if (IS_DESKTOP) {
        try {
            const text = await readText(SETTINGS_FILE);
            if (text) {
                return JSON.parse(text);
            }
        } catch (e) {
            console.error('[Persistence] Failed to load settings from file', e);
        }
    }

    try {
        const local = typeof window !== 'undefined' ? localStorage.getItem('caplayground-settings') : null;
        if (local) {
            return JSON.parse(local);
        }
    } catch (e) {
        console.error('[Persistence] Failed to read from localStorage', e);
    }

    return {};
}

async function loadSettings(): Promise<Settings> {
    if (cachedSettings) return cachedSettings;
    if (!settingsPromise) {
        settingsPromise = loadSettingsInternal().then(s => {
            cachedSettings = s;
            return s;
        });
    }
    return settingsPromise;
}

if (typeof window !== 'undefined') {
    loadSettings();
}

async function saveSettings(settings: Settings) {
    cachedSettings = settings;
    const text = JSON.stringify(settings);

    if (IS_DESKTOP) {
        try {
            await writeText(SETTINGS_FILE, text);
        } catch (e) {
            console.error('[Persistence] Failed to save settings to file', e);
        }
    }

    if (typeof window !== 'undefined') {
        localStorage.setItem('caplayground-settings', text);
    }
}

export const persistence = {
    async get(key: keyof Settings): Promise<any> {
        const settings = await loadSettings();
        return settings[key];
    },

    getSync(key: keyof Settings): any {
        if (cachedSettings) return cachedSettings[key];
        if (typeof window !== 'undefined') {
            try {
                const local = localStorage.getItem('caplayground-settings');
                if (local) return JSON.parse(local)[key];
            } catch { }
        }
        return undefined;
    },

    async set(key: keyof Settings, value: any): Promise<void> {
        const settings = await loadSettings();
        settings[key] = value;
        await saveSettings(settings);
    },

    async migrateFromLocalStorage(keys: string[]) {
        if (typeof window === 'undefined') return;
        const settings = await loadSettings();
        let changed = false;

        for (const key of keys) {
            const val = localStorage.getItem(key);
            if (val !== null) {
                let mappedKey: keyof Settings = key as any;
                if (key === 'caplayground-tos-accepted') mappedKey = 'tosAccepted';
                if (key === 'caplayground-onboarding-seen' || key === 'caplay_onboarding_seen') mappedKey = 'onboardingSeen';
                if (key === 'caplayground-sync') mappedKey = 'syncData';

                if (settings[mappedKey] === undefined) {
                    settings[mappedKey] = val === 'true' ? true : val;
                    changed = true;
                }
            }
        }

        if (changed) await saveSettings(settings);
    }
};

/**
 * Utility to detect if the game is running in Electron
 */
export class PlatformDetector {
    /**
     * Check if running in Electron
     */
    static isElectron(): boolean {
        // Check for Electron-specific properties
        if (typeof navigator !== 'undefined') {
            const userAgent = navigator.userAgent.toLowerCase();
            if (userAgent.indexOf(' electron/') > -1) {
                return true;
            }
        }

        // Check for process (Node.js in Electron)
        if (typeof process !== 'undefined' && typeof process.versions === 'object') {
            return !!(process.versions as any).electron;
        }

        return false;
    }

    /**
     * Check if running in web browser (not Electron)
     */
    static isWeb(): boolean {
        return !this.isElectron();
    }
}

export class ScriptLoader {
    private static loadedScripts: Set<string> = new Set();

    static load(url: string, id: string): Promise<boolean> {
        if (typeof window === 'undefined') return Promise.resolve(false);
        if (this.loadedScripts.has(id)) return Promise.resolve(true);

        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = url;
            script.id = id;
            script.async = true;

            script.onload = () => {
                this.loadedScripts.add(id);
                resolve(true);
            };

            script.onerror = () => {
                reject(new Error(`Failed to load script: ${url}`));
            };

            document.head.appendChild(script);
        });
    }

    static isLoaded(id: string): boolean {
        return this.loadedScripts.has(id);
    }
}

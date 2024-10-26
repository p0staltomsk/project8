declare interface Window {
    monaco?: {
        editor: {
            getEditors(): Array<{
                getAction(id: string): { run(): void };
                getContribution(id: string): {
                    start(args: any): void;
                };
            }>;
        };
    };
}

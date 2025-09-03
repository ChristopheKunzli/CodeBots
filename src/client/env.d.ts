interface ImportMetaEnv {
    readonly VITE_CLERK_PUBLISHABLE_KEY: string;
    readonly VITE_DISABLE_SAVE: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}

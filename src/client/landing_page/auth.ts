/// <reference path="../env.d.ts" />
import {Clerk} from "@clerk/clerk-js";

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

export const initializeAuthentication = async () => {
    const clerk = new Clerk(clerkPubKey);
    await clerk.load({});

    const container = document.getElementById('auth');
    if (!container) {
        throw new Error("invalid html element");
    }

    if (clerk.isSignedIn) {
        const userButtonDiv = document.createElement('div');
        userButtonDiv.id = 'user-button';
        container.appendChild(userButtonDiv);

        clerk.mountUserButton(userButtonDiv);
    }
};

initializeAuthentication();

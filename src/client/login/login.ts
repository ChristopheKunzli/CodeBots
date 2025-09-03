/// <reference path="../env.d.ts" />
import {Clerk} from "@clerk/clerk-js";

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

export const initializeAuthentication = async () => {
    const clerk = new Clerk(clerkPubKey);
    await clerk.load({});

    const [container] = document.getElementsByTagName('body');
    if (!container) {
        throw new Error("invalid html element");
    }

    if (clerk.isSignedIn) {
        window.location.href = "/";
        return;
    }

    const signInDiv = document.createElement("div");
    signInDiv.id = "sign-in";
    container.appendChild(signInDiv);

    clerk.mountSignIn(signInDiv);
};

initializeAuthentication();

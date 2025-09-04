/// <reference path="../env.d.ts" />
import {Clerk} from "@clerk/clerk-js";

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
const disableSave = import.meta.env.VITE_DISABLE_SAVE;

export const initializeAuthentication = async () => {
    const clerk = new Clerk(clerkPubKey);
    await clerk.load({});

    const [container] = document.getElementsByTagName('body');
    if (!container) {
        throw new Error("invalid html element");
    }

    if (clerk.isSignedIn || disableSave === "true") {
        window.location.href = "/";
        return;
    }

    const signInDiv = document.createElement("div");
    signInDiv.id = "sign-in";
    container.appendChild(signInDiv);

    clerk.mountSignIn(signInDiv);
};

initializeAuthentication();

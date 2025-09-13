"use client"

import { ClerkProvider, RedirectToSignIn, SignedIn, SignedOut, useAuth } from "@clerk/nextjs";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import {
    AuthLoading,
    Authenticated,
    ConvexReactClient
} from "convex/react";
import { Loading } from "@/components/auth/loading";

interface ConvexClientProviderProps {
    children: React.ReactNode;
}

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL!;

const convex = new ConvexReactClient(convexUrl);

export const ConvexClientProvider = ({ children }: ConvexClientProviderProps) => {
    return (
        <ClerkProvider>
            <ConvexProviderWithClerk useAuth={useAuth} client={convex}>
                {/* While checking auth */}
                <AuthLoading>
                    <Loading />
                </AuthLoading>

                {/* When signed in */}
                <SignedIn>
                    {children}
                </SignedIn>

                {/* When signed out */}
                <SignedOut>
                    <RedirectToSignIn />
                </SignedOut>
                <AuthLoading>
                    <Loading />
                </AuthLoading>
            </ConvexProviderWithClerk>
        </ClerkProvider>
    );
};
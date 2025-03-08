"use client";

import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

import { Button } from "@/components/ui/button";
import { Layers } from "lucide-react";

export default function Header() {
  return (
    <header className="border-b bg-background sticky top-0 z-40">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-2">
          <Layers className="h-6 w-6" />
          <span className="text-lg font-bold">ImageVault</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-2">
            <div>
              <SignedOut>
                <Button variant={"default"}>
                  <SignInButton />
                </Button>
              </SignedOut>
              <SignedIn>
                <UserButton />
              </SignedIn>{" "}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

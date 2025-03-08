"use client";

import { usePathname } from "next/navigation";
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Layers } from "lucide-react";
import Link from "next/link";

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="border-b bg-background sticky top-0 z-40">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-2">
          <Layers className="h-6 w-6" />
          <span className="text-lg font-bold">ImageVault</span>
        </div>

        <div className="flex items-center gap-4">
          {pathname === "/store" ? (
            <Link href="/">
              <ChevronLeft className="h-6 w-6" />
            </Link>
          ) : (
            <Link href="/store">
              <Button variant="default">Start</Button>
            </Link>
          )}

          <div className="flex items-center gap-2">
            <SignedOut>
              <SignInButton>
                <Button variant="default">Sign In</Button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <UserButton />
            </SignedIn>
          </div>
        </div>
      </div>
    </header>
  );
}

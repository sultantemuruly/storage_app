import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function Hero() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 xl:grid-cols-2">
          <div className="flex flex-col justify-center space-y-4">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                Store, organize, and access your images with ease
              </h1>
              <p className="max-w-[600px] text-muted-foreground md:text-xl">
                ImageVault helps you keep your visual content organized in one
                secure place. Create groups, search instantly, and access your
                images from anywhere.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Link href="/store">
                <Button size="lg" className="gap-1.5">
                  Get Started
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <div className="relative h-[350px] w-full md:h-[450px] lg:h-[500px]">
              <Image
                src="/image.jpg"
                alt="image"
                fill
                className="object-contain"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background to-background/2 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

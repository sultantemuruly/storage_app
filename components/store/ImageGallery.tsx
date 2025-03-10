"use client";

import { useState } from "react";
import Image from "next/image";
import { ImagePlus, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import UploadDialog from "./UploadDialog";

interface ImageItem {
  id: string;
  url: string;
  name: string;
  group?: string;
  date: string;
}

export default function ImageGallery() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [images, setImages] = useState<ImageItem[]>([
    {
      id: "1",
      url: "/placeholder.svg?height=500&width=500",
      name: "Image 1",
      group: "Vacation",
      date: "2023-05-15",
    },
    {
      id: "2",
      url: "/placeholder.svg?height=500&width=500",
      name: "Image 2",
      group: "Work",
      date: "2023-06-22",
    },
    {
      id: "3",
      url: "/placeholder.svg?height=500&width=500",
      name: "Image 3",
      group: "Family",
      date: "2023-07-10",
    },
    {
      id: "4",
      url: "/placeholder.svg?height=500&width=500",
      name: "Image 4",
      group: "Projects",
      date: "2023-08-05",
    },
    {
      id: "5",
      url: "/placeholder.svg?height=500&width=500",
      name: "Image 5",
      group: "Vacation",
      date: "2023-09-18",
    },
    {
      id: "6",
      url: "/placeholder.svg?height=500&width=500",
      name: "Image 6",
      group: "Work",
      date: "2023-10-30",
    },
    {
      id: "7",
      url: "/placeholder.svg?height=500&width=500",
      name: "Image 7",
      date: "2023-11-12",
    },
    {
      id: "8",
      url: "/placeholder.svg?height=500&width=500",
      name: "Image 8",
      group: "Family",
      date: "2023-12-25",
    },
  ]);

  const filteredImages = images.filter(
    (image) =>
      image.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (image.group &&
        image.group.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const addImage = (name: string, group?: string) => {
    const newImage = {
      id: Date.now().toString(),
      url: "/placeholder.svg?height=500&width=500",
      name,
      group,
      date: new Date().toISOString().split("T")[0],
    };
    setImages([newImage, ...images]);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search images..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-9 w-9"
              onClick={() => setSearchQuery("")}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Clear search</span>
            </Button>
          )}
        </div>
        <Button onClick={() => setIsUploadOpen(true)}>
          <ImagePlus className="mr-2 h-4 w-4" />
          Upload
        </Button>
      </div>

      <ScrollArea className="flex-1 p-4">
        {selectedImage ? (
          <div className="flex flex-col items-center">
            <div className="relative w-full max-w-3xl">
              <Button
                variant="outline"
                size="icon"
                className="absolute right-2 top-2 z-10"
                onClick={() => setSelectedImage(null)}
              >
                <X className="h-4 w-4" />
              </Button>
              <Image
                src={images.find((img) => img.id === selectedImage)?.url || ""}
                alt="Selected image"
                width={800}
                height={600}
                className="rounded-lg object-contain"
              />
            </div>
            <div className="mt-4 text-center">
              <h3 className="text-lg font-medium">
                {images.find((img) => img.id === selectedImage)?.name}
              </h3>
              {images.find((img) => img.id === selectedImage)?.group && (
                <p className="text-sm text-muted-foreground">
                  Group: {images.find((img) => img.id === selectedImage)?.group}
                </p>
              )}
              <p className="text-sm text-muted-foreground">
                Added: {images.find((img) => img.id === selectedImage)?.date}
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredImages.length > 0 ? (
              filteredImages.map((image) => (
                <div
                  key={image.id}
                  className="group relative aspect-square overflow-hidden rounded-lg border bg-background cursor-pointer"
                  onClick={() => setSelectedImage(image.id)}
                >
                  <Image
                    src={image.url || "/placeholder.svg"}
                    alt={image.name}
                    fill
                    className="object-cover transition-all group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100" />
                  <div className="absolute bottom-0 left-0 right-0 p-2 text-white opacity-0 transition-opacity group-hover:opacity-100">
                    <p className="text-sm font-medium truncate">{image.name}</p>
                    {image.group && (
                      <p className="text-xs truncate opacity-80">
                        {image.group}
                      </p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center h-[50vh] text-center">
                <p className="text-muted-foreground mb-4">No images found</p>
                <Button onClick={() => setIsUploadOpen(true)}>
                  <ImagePlus className="mr-2 h-4 w-4" />
                  Upload Images
                </Button>
              </div>
            )}
          </div>
        )}
      </ScrollArea>

      <UploadDialog
        open={isUploadOpen}
        onOpenChange={setIsUploadOpen}
        onUpload={addImage}
        groups={[
          { id: "1", name: "Vacation" },
          { id: "2", name: "Work" },
          { id: "3", name: "Family" },
          { id: "4", name: "Projects" },
        ]}
      />
    </div>
  );
}

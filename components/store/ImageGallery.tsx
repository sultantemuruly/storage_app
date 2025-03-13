"use client";

import { useEffect, useState } from "react";
import { ImagePlus, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import UploadDialog from "./UploadDialog";
import { toast } from "sonner";

interface ImageItem {
  url: string;
  name: string;
  date: string;
  key: string;
}

export default function ImageGallery({ groupId }: { groupId: string }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [images, setImages] = useState<ImageItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch images from S3 when component mounts
  useEffect(() => {
    async function fetchImages() {
      try {
        const response = await fetch(
          `/api/s3-retrieve?path=images/group/${groupId}`
        );
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to load images.");
        }

        setImages(data.images);
      } catch (error) {
        console.error("Error fetching images:", error);
        toast.error("Failed to retrieve images from server.");
      } finally {
        setLoading(false);
      }
    }

    fetchImages();
  }, [groupId, isUploadOpen]); // Refetch images after upload

  const filteredImages = images.filter((image) =>
    image.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedImgData = images.find((img) => img.url === selectedImage);

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
        {loading ? (
          <p className="text-center text-muted-foreground">Loading images...</p>
        ) : selectedImage && selectedImgData ? (
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
              <img
                src={selectedImgData.url}
                alt={selectedImgData.name}
                className="object-cover w-full h-full rounded-lg"
              />
            </div>
            <div className="mt-4 text-center">
              <h3 className="text-lg font-medium">{selectedImgData.name}</h3>
              <p className="text-sm text-muted-foreground">
                Added: {selectedImgData.date}
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredImages.length > 0 ? (
              filteredImages.map((image) => (
                <div
                  key={image.key}
                  className="group relative aspect-square overflow-hidden rounded-lg border bg-background cursor-pointer"
                  onClick={() => setSelectedImage(image.url)}
                >
                  <img
                    src={image.url}
                    alt={image.name}
                    className="object-cover w-full h-full rounded-lg transition-all group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100" />
                  <div className="absolute bottom-0 left-0 right-0 p-2 text-white opacity-0 transition-opacity group-hover:opacity-100">
                    <p className="text-sm font-medium truncate">{image.name}</p>
                    <p className="text-xs truncate opacity-80">
                      Added: {image.date}
                    </p>
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

      <UploadDialog open={isUploadOpen} onOpenChange={setIsUploadOpen} />
    </div>
  );
}

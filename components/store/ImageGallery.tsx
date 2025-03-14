"use client";

import { useEffect, useState } from "react";
import { ImagePlus, Search, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import UploadDialog from "./UploadDialog";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

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

  // Fetch images from S3 when component mounts
  useEffect(() => {
    fetchImages();
  }, [groupId, isUploadOpen]); // Refetch images after upload

  const filteredImages = images.filter((image) =>
    image.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedImgData = images.find((img) => img.url === selectedImage);

  const handleImageDelete = async ({ filePath }: { filePath: string }) => {
    try {
      const response = await fetch("/api/s3-delete", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ filePath }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete image");
      }

      toast.success("Image deleted successfully");

      await fetchImages();
    } catch (error) {
      console.error("Error deleting image:", error);
      toast.error("Failed to delete image. Please try again.");
    }
  };

  const handleGroupDelete = async () => {
    if (!groupId) {
      toast.error("Group ID is missing.");
      return;
    }

    try {
      // Delete the group from the database
      const groupDeleteResponse = await fetch(`/api/user-groups`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ groupId }),
      });

      if (!groupDeleteResponse.ok) {
        const errorData = await groupDeleteResponse.json();
        throw new Error(errorData.message || "Failed to delete group.");
      }

      // Delete associated image from S3
      if (images.length > 0) {
        const imageDeleteResponse = await fetch(`/api/s3-delete`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ filePath: `images/group/${groupId}` }),
        });

        if (!imageDeleteResponse.ok) {
          const errorData = await imageDeleteResponse.json();
          throw new Error(errorData.message || "Failed to delete group image.");
        }
      }

      toast.success("Group and associated image deleted successfully.");
      window.location.reload();
    } catch (error) {
      console.error("Error deleting group:", error);
      toast.error("An error occurred while deleting the group.");
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search images..."
            className="pl-8 [&::-webkit-search-cancel-button]:hidden"
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
        <div className="flex gap-1">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="mr-1 h-4 w-4" />
                Delete Group
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirm Group Deletion</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this group? This action cannot
                  be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleGroupDelete}>
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <Button onClick={() => {}}>
            <ImagePlus className="mr-1 h-4 w-4" />
            Upload
          </Button>
        </div>
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
                <div key={image.key} className="flex flex-col items-center">
                  {/* Wrapper for image and hover effects */}
                  <div className="group relative">
                    {/* Image Wrapper */}
                    <div
                      className="relative w-full aspect-square overflow-hidden rounded-lg cursor-pointer"
                      onClick={() => setSelectedImage(image.url)}
                    >
                      <img
                        src={image.url}
                        alt={image.name}
                        className="object-cover w-full h-full rounded-lg transition-all duration-300 ease-in-out group-hover:brightness-75"
                      />

                      {/* Dark overlay on hover */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity duration-300 ease-in-out group-hover:opacity-100" />

                      {/* White text appearing on hover */}
                      <div className="absolute bottom-0 left-0 right-0 p-2 text-white opacity-0 transition-opacity duration-300 ease-in-out group-hover:opacity-100">
                        <p className="text-sm font-medium truncate">
                          {image.name}
                        </p>
                        <p className="text-xs truncate opacity-80">
                          Added: {image.date}
                        </p>
                      </div>

                      {/* Delete button positioned in top-right corner, visible on hover */}
                      <div
                        className="absolute top-2 right-2 opacity-0 transition-opacity duration-300 ease-in-out group-hover:opacity-100"
                        onClick={(e) => e.stopPropagation()} // Add stopPropagation here to block ALL click events inside this div
                      >
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="destructive"
                              size="sm"
                              className="h-8 w-8 rounded-sm p-0"
                              onClick={(e) => {
                                e.stopPropagation(); // Prevent opening the image
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Image</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this image? This
                                action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() =>
                                  handleImageDelete({
                                    filePath: `images/group/${groupId}/filename/${image.name}`,
                                  })
                                }
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>

                    {/* Black text (visible initially, disappears on hover) */}
                    <div className="w-full text-center transition-opacity duration-300 ease-in-out group-hover:opacity-0">
                      <p className="mt-2 text-sm font-medium text-black">
                        {image.name}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center h-[50vh] text-center">
                <p className="text-muted-foreground mb-4">No images found</p>
                <Button onClick={() => setIsUploadOpen(true)}>
                  <ImagePlus className="mr-2 h-4 w-4" />
                  Upload Image
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

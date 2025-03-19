"use client";

import { useEffect, useState } from "react";
import { ImagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import UploadDialog from "./UploadDialog";
import { SearchBar } from "./gallery/SearchBar";
import { ImageGrid } from "./gallery/ImageGrid";
import { ImageDetail } from "./gallery/ImageDetail";
import { DeleteGroupDialog } from "./gallery/DeleteGroupDialog";
import WarningBanner from "./gallery/WarningBanner";

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

  const image_service_url = process.env.NEXT_PUBLIC_IMAGE_SERVICE_URL;

  async function fetchImages() {
    try {
      if (!groupId) {
        console.error("Group ID is missing");
        toast.error("Cannot load images: Group ID is missing");
        setLoading(false);
        return;
      }

      const response = await fetch(
        `${image_service_url}/api/s3-retrieve?path=images/group/${groupId}/filename`
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

  useEffect(() => {
    fetchImages();
  }, [groupId, isUploadOpen]);

  const filteredImages = images.filter((image) =>
    image.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedImgData = images.find((img) => img.url === selectedImage);

  const handleImageDelete = async (filePath: string) => {
    try {
      if (!groupId) {
        toast.error("Deletion failed: Group ID is missing.");
        return;
      }

      const response = await fetch(`${image_service_url}/api/s3-delete`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ filePath, groupId }), // Include groupId explicitly
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete image");
      }

      toast.success("Image deleted successfully");
      await fetchImages(); // Refresh images after deletion
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
      // Store the groupId before deleting it from the database
      const groupIdToDelete = groupId;

      // First delete the group from the database
      const groupDeleteResponse = await fetch(`/api/user-groups/delete-group`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ groupId: groupIdToDelete }),
      });

      if (!groupDeleteResponse.ok) {
        const errorData = await groupDeleteResponse.json();
        throw new Error(errorData.message || "Failed to delete group.");
      }

      // Only call S3 delete if images exist
      if (images.length > 0) {
        const imageDeleteResponse = await fetch(
          `${image_service_url}/api/s3-delete`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ groupId: groupIdToDelete }), // Pass correct parameter
          }
        );

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
        <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        <div className="flex gap-1">
          <DeleteGroupDialog onDelete={handleGroupDelete} />
          <Button onClick={() => setIsUploadOpen(true)}>
            <ImagePlus className="mr-1 h-4 w-4" />
            Upload
          </Button>
        </div>
      </div>

      <div>
        <WarningBanner />
      </div>

      <ScrollArea className="flex-1 p-4">
        {loading ? (
          <p className="text-center text-muted-foreground">Loading images...</p>
        ) : selectedImage && selectedImgData ? (
          <ImageDetail
            image={selectedImgData}
            onClose={() => setSelectedImage(null)}
          />
        ) : (
          <ImageGrid
            images={filteredImages}
            groupId={groupId}
            onSelectImage={setSelectedImage}
            onDeleteImage={handleImageDelete}
            onUpload={() => setIsUploadOpen(true)}
          />
        )}
      </ScrollArea>

      <UploadDialog
        open={isUploadOpen}
        onOpenChange={setIsUploadOpen}
        groupId={groupId}
      />
    </div>
  );
}

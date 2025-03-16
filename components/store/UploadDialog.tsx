"use client";

import { cn } from "@/lib/utils";
import type React from "react";
import { useState, useEffect, useRef } from "react";
import { ImagePlus, Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface UploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groupId?: string; // Added optional groupId prop
}

export default function UploadDialog({
  open,
  onOpenChange,
  groupId, // Add groupId to the destructured props
}: UploadDialogProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadedFiles, setUploadedFiles] = useState<Set<string>>(new Set());
  const [showDuplicateAlert, setShowDuplicateAlert] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const image_service_url = process.env.NEXT_PUBLIC_IMAGE_SERVICE_URL;

  // Load existing files from S3 on component mount - updated to use groupId if available
  useEffect(() => {
    if (open) {
      const fetchUploadedFiles = async () => {
        try {
          // Use groupId in the path if available
          const path = groupId ? `/images/group/${groupId}` : "images/";
          const response = await fetch(
            `${image_service_url}/api/s3-retrieve?path=${path}`
          );
          const data = await response.json();

          if (data.images && Array.isArray(data.images)) {
            const fileNames = new Set<string>(
              data.images.map((image: { key: string }) => {
                return image.key.split("/").pop() || "";
              })
            );

            setUploadedFiles(fileNames);
          }
        } catch (error) {
          console.error("Error fetching uploaded files:", error);
          toast.error("Failed to load existing files", {
            description: "There was a problem connecting to the server.",
          });
        }
      };

      fetchUploadedFiles();
    }
  }, [open, groupId]); // Added groupId to dependencies

  const checkDuplicate = (fileName: string): boolean =>
    uploadedFiles.has(fileName);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type.startsWith("image/")) {
        setFile(droppedFile);
      }
    }
  };

  const handleFileSelect = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const proceedWithUpload = async () => {
    if (!file) return;

    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    // Add groupId to formData if available
    if (groupId) {
      formData.append("groupId", groupId);
    }

    try {
      const response = await fetch(`${image_service_url}/api/s3-upload`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload file");
      }

      toast.success("File uploaded successfully!", {
        description: "Your file has been uploaded to the server.",
      });

      // Reset form
      setFile(null);

      // Close dialog
      onOpenChange(false);

      // Reload the page after successful upload
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      toast.error("Upload failed. Please try again.", {
        description: "There was an error uploading your file.",
      });
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      toast.error("Please select a file before uploading.", {
        description: "No file selected",
      });
      return;
    }

    // Check if file already exists
    if (checkDuplicate(file.name)) {
      setShowDuplicateAlert(true);
      return;
    }

    proceedWithUpload();
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Upload image</DialogTitle>
              <DialogDescription>
                Upload a new image{" "}
                {groupId ? "to this group" : "to your storage"}.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div
                className={cn(
                  "flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-12 transition-colors",
                  isDragging
                    ? "border-primary bg-primary/5"
                    : "border-muted-foreground/25"
                )}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                {file ? (
                  <div className="text-center">
                    <ImagePlus className="h-10 w-10 mx-auto text-primary mb-2" />
                    <p className="text-sm font-medium mb-1">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(file.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                ) : (
                  <>
                    <ImagePlus className="h-10 w-10 text-muted-foreground mb-4" />
                    <p className="text-sm text-muted-foreground text-center mb-2">
                      Drag and drop your image here, or click to browse
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleFileSelect}
                    >
                      Choose File
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={uploading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={!file || uploading}>
                {uploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Duplicate File Alert Dialog */}
      <AlertDialog
        open={showDuplicateAlert}
        onOpenChange={setShowDuplicateAlert}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Duplicate File</AlertDialogTitle>
            <AlertDialogDescription>
              A file with the same name has already been uploaded. You cannot
              upload the same file twice.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowDuplicateAlert(false)}>
              Ok
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

"use client";

import { cn } from "@/lib/utils";

import type React from "react";

import { useState } from "react";
import { ImagePlus, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Group {
  id: string;
  name: string;
}

interface UploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpload: (name: string, group?: string) => void;
  groups: Group[];
}

export default function UploadDialog({
  open,
  onOpenChange,
  onUpload,
  groups,
}: UploadDialogProps) {
  const [imageName, setImageName] = useState("");
  const [selectedGroup, setSelectedGroup] = useState<string | undefined>(
    undefined
  );
  const [isDragging, setIsDragging] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (imageName.trim()) {
      onUpload(imageName.trim(), selectedGroup);
      setImageName("");
      setSelectedGroup(undefined);
      onOpenChange(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    // In a real app, you would handle file upload here
    // For this demo, we'll just simulate it
    if (e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith("image/")) {
        setImageName(file.name.split(".")[0]);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Upload image</DialogTitle>
            <DialogDescription>
              Upload a new image to your storage.
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
              <ImagePlus className="h-10 w-10 text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground text-center mb-2">
                Drag and drop your image here, or click to browse
              </p>
              <Button type="button" variant="outline" size="sm">
                Choose File
              </Button>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="name">Image name</Label>
              <Input
                id="name"
                placeholder="Enter image name"
                value={imageName}
                onChange={(e) => setImageName(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="group">Group (optional)</Label>
              <Select value={selectedGroup} onValueChange={setSelectedGroup}>
                <SelectTrigger id="group">
                  <SelectValue placeholder="Select a group" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {groups.map((group) => (
                    <SelectItem key={group.id} value={group.name}>
                      {group.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!imageName.trim()}>
              <Upload className="mr-2 h-4 w-4" />
              Upload
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

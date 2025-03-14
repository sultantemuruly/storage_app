import { ImagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  onUpload: () => void;
}

export function EmptyState({ onUpload }: EmptyStateProps) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center h-[50vh] text-center">
      <p className="text-muted-foreground mb-4">No images found</p>
      <Button onClick={onUpload}>
        <ImagePlus className="mr-2 h-4 w-4" />
        Upload Image
      </Button>
    </div>
  );
}

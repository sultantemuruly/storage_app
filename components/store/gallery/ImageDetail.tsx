import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface ImageDetailProps {
  image: {
    url: string;
    name: string;
    date: string;
  };
  onClose: () => void;
}

export function ImageDetail({ image, onClose }: ImageDetailProps) {
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-full max-w-3xl">
        <Button
          variant="outline"
          size="icon"
          className="absolute right-2 top-2 z-10"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
        <img
          src={image.url}
          alt={image.name}
          className="object-cover w-full h-full rounded-lg"
        />
      </div>
      <div className="mt-4 text-center">
        <h3 className="text-lg font-medium">{image.name}</h3>
        <p className="text-sm text-muted-foreground">Added: {image.date}</p>
      </div>
    </div>
  );
}

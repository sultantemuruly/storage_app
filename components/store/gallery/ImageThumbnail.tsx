import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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

interface ImageThumbnailProps {
  image: ImageItem;
  groupId: string;
  onSelect: (url: string) => void;
  onDelete: (filePath: string) => void;
}

export function ImageThumbnail({
  image,
  groupId,
  onSelect,
  onDelete,
}: ImageThumbnailProps) {
  return (
    <div className="flex flex-col items-center">
      <div className="group relative">
        <div
          className="relative w-full aspect-square overflow-hidden rounded-lg cursor-pointer"
          onClick={() => onSelect(image.url)}
        >
          <img
            src={image.url}
            alt={image.name}
            className="object-cover w-full h-full rounded-lg transition-all duration-300 ease-in-out group-hover:brightness-75"
          />

          <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity duration-300 ease-in-out group-hover:opacity-100" />

          <div className="absolute bottom-0 left-0 right-0 p-2 text-white opacity-0 transition-opacity duration-300 ease-in-out group-hover:opacity-100">
            <p className="text-sm font-medium truncate">{image.name}</p>
            <p className="text-xs truncate opacity-80">Added: {image.date}</p>
          </div>

          <div
            className="absolute top-2 right-2 opacity-0 transition-opacity duration-300 ease-in-out group-hover:opacity-100"
            onClick={(e) => e.stopPropagation()}
          >
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  size="sm"
                  className="h-8 w-8 rounded-sm p-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Image</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this image? This action
                    cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() =>
                      onDelete(`images/group/${groupId}/filename/${image.name}`)
                    }
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        <div className="w-full text-center transition-opacity duration-300 ease-in-out group-hover:opacity-0">
          <p className="mt-2 text-sm font-medium text-black">{image.name}</p>
        </div>
      </div>
    </div>
  );
}

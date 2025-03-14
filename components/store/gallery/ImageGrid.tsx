import { ImageThumbnail } from "./ImageThumbnail";
import { EmptyState } from "./EmptyState";

interface ImageItem {
  url: string;
  name: string;
  date: string;
  key: string;
}

interface ImageGridProps {
  images: ImageItem[];
  groupId: string;
  onSelectImage: (url: string) => void;
  onDeleteImage: (filePath: string) => void;
  onUpload: () => void;
}

export function ImageGrid({
  images,
  groupId,
  onSelectImage,
  onDeleteImage,
  onUpload,
}: ImageGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {images.length > 0 ? (
        images.map((image) => (
          <ImageThumbnail
            key={image.key}
            image={image}
            groupId={groupId}
            onSelect={onSelectImage}
            onDelete={onDeleteImage}
          />
        ))
      ) : (
        <EmptyState onUpload={onUpload} />
      )}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";

type Image = {
  url: string;
  key: string;
};

export default function GroupImages({ path }: { path: string }) {
  const [images, setImages] = useState<Image[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!path) return;

    async function fetchImages() {
      try {
        const response = await fetch(`/api/s3-retrieve?path=${path}`);
        const data = await response.json();
        setImages(data.images);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    fetchImages();
  }, [path]);

  if (loading) return <p>Loading images...</p>;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4">
      {images.length > 0 ? (
        images.map((image) => (
          <div key={image.key} className="bg-gray-100 p-2 rounded-md shadow-md">
            <img
              src={image.url}
              alt="User uploaded"
              className="w-full h-auto rounded-md"
            />
          </div>
        ))
      ) : (
        <p>No images found in this group.</p>
      )}
    </div>
  );
}

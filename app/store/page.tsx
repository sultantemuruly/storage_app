"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import ImageGallery from "@/components/store/ImageGallery";
import Sidebar from "@/components/store/SideBar";
import InitialGroupCreate from "@/components/store/InitialGroupCreate";
import { Loader } from "lucide-react";

interface Group {
  id: string;
  name: string;
  imageCount: number;
}

export default function Store() {
  const { user, isLoaded } = useUser();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGroups = async () => {
      if (!isLoaded || !user) return;

      try {
        const res = await fetch("/api/user-groups");
        if (res.ok) {
          const data = await res.json();
          setGroups(data.groups);
        }
      } catch (error) {
        console.error("Failed to fetch user:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, [isLoaded, user?.id]);

  if (!isLoaded || loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <Loader className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex w-screen bg-background">
      {groups.length > 0 ? (
        <div className="flex w-full">
          <Sidebar />
          <main className="flex-1 overflow-auto">
            <ImageGallery />
          </main>
        </div>
      ) : (
        <InitialGroupCreate setGroups={setGroups} />
      )}
    </div>
  );
}

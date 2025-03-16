"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import CreateGroupDialog from "./CreateGroupDialog";
import { Loader } from "lucide-react";

interface Group {
  id: string;
  name: string;
}

interface InitialGroupCreateProps {
  setGroups: (groups: Group[] | ((prevGroups: Group[]) => Group[])) => void;
}

export default function InitialGroupCreate({
  setGroups,
}: InitialGroupCreateProps) {
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userLoading, setUserLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulating user load
      } catch (error) {
        console.error("Error loading user", error);
      } finally {
        setUserLoading(false);
      }
    };
    fetchUser();
  }, []);

  const addGroup = async (name: string) => {
    try {
      setLoading(true);
      const response = await fetch("/api/user-groups/create-group", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name }),
      });

      if (!response.ok) {
        throw new Error("Failed to create group");
      }

      const data = await response.json();
      console.log("API Response:", data); // Log API response for debugging

      if (!data || !data.group || typeof data.group !== "object") {
        throw new Error("Invalid API response structure");
      }

      // Ensure `data.group` has required fields with fallbacks
      const newGroup: Group = {
        id: data.group.id || "unknown-id",
        name: data.group.name || "Unnamed Group",
      };

      // Update groups correctly
      setGroups((prevGroups) => [...prevGroups, newGroup]);
    } catch (error) {
      console.error("Error adding group:", error);
    } finally {
      setLoading(false);
    }
  };

  if (userLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <Loader className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen items-center justify-center flex-col gap-4">
      <div className="text-lg font-semibold text-center">
        You must create a group in order to upload images
      </div>
      <div>
        <Button onClick={() => setIsCreateGroupOpen(true)} disabled={loading}>
          {loading ? <Loader className="animate-spin" /> : "Create Group"}
        </Button>
      </div>
      <CreateGroupDialog
        open={isCreateGroupOpen}
        onOpenChange={setIsCreateGroupOpen}
        onCreateGroup={addGroup}
      />
    </div>
  );
}

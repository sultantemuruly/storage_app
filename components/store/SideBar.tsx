"use client";

import { Grid, Image, Plus, Loader } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import CreateGroupDialog from "./CreateGroupDialog";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { useEffect, useState } from "react";
import { setCookie, getCookie } from "cookies-next";

interface Group {
  id: string;
  name: string;
}

interface SidebarProps {
  groups: Group[];
  selectedGroup: string | null;
  setSelectedGroup: (id: string | null) => void;
  setGroups: (groups: Group[] | ((prevGroups: Group[]) => Group[])) => void;
  loading?: boolean;
}

export default function Sidebar({
  groups,
  selectedGroup,
  setSelectedGroup,
  setGroups,
  loading = false,
}: SidebarProps) {
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const [duplicateGroupName, setDuplicateGroupName] = useState("");

  // Load selected group from cookies on mount
  useEffect(() => {
    const storedGroupId = getCookie("selectedGroup");

    if (storedGroupId && groups.some((group) => group.id === storedGroupId)) {
      setSelectedGroup(storedGroupId as string);
    }
  }, [groups]);

  const handleSelectGroup = (id: string | null) => {
    setSelectedGroup(id);

    if (id) {
      setCookie("selectedGroup", id, {
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      });
    } else {
      setCookie("selectedGroup", "", { path: "/", maxAge: 0 });
    }
  };

  const addGroup = async (name: string) => {
    // Check if group name already exists (case-insensitive)
    const exists = groups.some(
      (group) => group.name.toLowerCase() === name.toLowerCase()
    );

    if (exists) {
      setDuplicateGroupName(name);
      setAlertOpen(true);
      return;
    }

    try {
      setCreateLoading(true);
      const response = await fetch("/api/user-groups/create-group", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      if (!response.ok) {
        throw new Error("Failed to create group");
      }

      const data = await response.json();
      if (!data?.group || typeof data.group !== "object") {
        throw new Error("Invalid API response structure");
      }

      const newGroup: Group = {
        id: data.group.id || "unknown-id",
        name: data.group.name || "Unnamed Group",
      };

      setGroups((prevGroups) => [...prevGroups, newGroup]);
      handleSelectGroup(newGroup.id);
    } catch (error) {
      console.error("Error adding group:", error);
    } finally {
      setCreateLoading(false);
    }
  };

  return (
    <>
      {/* Mobile Sidebar */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <Grid className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0">
            <SidebarContent
              groups={groups}
              selectedGroup={selectedGroup}
              setSelectedGroup={handleSelectGroup}
              onCreateGroup={() => setIsCreateGroupOpen(true)}
              loading={loading || createLoading}
            />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-72 flex-col border-r bg-background">
        <SidebarContent
          groups={groups}
          selectedGroup={selectedGroup}
          setSelectedGroup={handleSelectGroup}
          onCreateGroup={() => setIsCreateGroupOpen(true)}
          loading={loading || createLoading}
        />
      </aside>

      <CreateGroupDialog
        open={isCreateGroupOpen}
        onOpenChange={setIsCreateGroupOpen}
        onCreateGroup={addGroup}
      />

      {/* Alert Dialog for Duplicate Group Name */}
      <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
        <AlertDialogContent>
          <AlertDialogTitle>Group Already Exists</AlertDialogTitle>
          <AlertDialogDescription>
            A group with the name <b>{duplicateGroupName}</b> already exists.
            Please choose a different name.
          </AlertDialogDescription>
          <div className="flex justify-end space-x-2">
            <AlertDialogCancel onClick={() => setAlertOpen(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={() => setAlertOpen(false)}>
              OK
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

interface SidebarContentProps {
  groups: Group[];
  selectedGroup: string | null;
  setSelectedGroup: (id: string | null) => void;
  onCreateGroup: () => void;
  loading: boolean;
}

function SidebarContent({
  groups,
  selectedGroup,
  setSelectedGroup,
  onCreateGroup,
  loading,
}: SidebarContentProps) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-14 items-center border-b px-4">
        <h2 className="text-lg font-semibold">Storage</h2>
      </div>
      <div className="flex-1 overflow-auto">
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium">Groups</h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={onCreateGroup}
              disabled={loading}
            >
              {loading ? (
                <Loader className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              <span className="sr-only">Add group</span>
            </Button>
          </div>
          <ScrollArea className="h-[calc(100vh-220px)]">
            <div className="flex flex-col gap-1">
              {groups.map((group) => (
                <Button
                  key={group.id}
                  variant="ghost"
                  className={cn(
                    "justify-start gap-2",
                    selectedGroup === group.id && "bg-accent"
                  )}
                  onClick={() => setSelectedGroup(group.id)}
                >
                  <Image className="h-4 w-4" />
                  <span className="flex-1 truncate text-left">
                    {group.name}
                  </span>
                </Button>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Grid, Image, Plus } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import CreateGroupDialog from "./CreateGroupDialog";

interface Group {
  id: string;
  name: string;
  imageCount: number;
}

export default function Sidebar() {
  const [groups, setGroups] = useState<Group[]>([
    { id: "1", name: "Vacation", imageCount: 24 },
    { id: "2", name: "Work", imageCount: 15 },
    { id: "3", name: "Family", imageCount: 32 },
    { id: "4", name: "Projects", imageCount: 8 },
  ]);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);

  const addGroup = (name: string) => {
    const newGroup = {
      id: Date.now().toString(),
      name,
      imageCount: 0,
    };
    setGroups([...groups, newGroup]);
  };

  return (
    <>
      {/* Mobile Sidebar */}
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="md:hidden absolute top-4 left-4 z-10"
          >
            <Grid className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 p-0">
          <SidebarContent
            groups={groups}
            selectedGroup={selectedGroup}
            setSelectedGroup={setSelectedGroup}
            onCreateGroup={() => setIsCreateGroupOpen(true)}
          />
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-72 flex-col border-r bg-background">
        <SidebarContent
          groups={groups}
          selectedGroup={selectedGroup}
          setSelectedGroup={setSelectedGroup}
          onCreateGroup={() => setIsCreateGroupOpen(true)}
        />
      </aside>

      <CreateGroupDialog
        open={isCreateGroupOpen}
        onOpenChange={setIsCreateGroupOpen}
        onCreateGroup={addGroup}
      />
    </>
  );
}

interface SidebarContentProps {
  groups: Group[];
  selectedGroup: string | null;
  setSelectedGroup: (id: string | null) => void;
  onCreateGroup: () => void;
}

function SidebarContent({
  groups,
  selectedGroup,
  setSelectedGroup,
  onCreateGroup,
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
            <Button variant="ghost" size="icon" onClick={onCreateGroup}>
              <Plus className="h-4 w-4" />
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
                  <span className="text-xs text-muted-foreground">
                    {group.imageCount}
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

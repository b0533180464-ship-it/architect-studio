/* eslint-disable max-lines-per-function */
'use client';

import { useState } from 'react';
import { Home } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ConfigBadge } from '@/components/ui/config-badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { RoomForm } from '@/components/rooms/room-form';
import type { RouterOutputs } from '@/lib/trpc';

type Room = RouterOutputs['rooms']['list'][number];

interface ProjectRoomsProps {
  projectId: string;
}

export function ProjectRooms({ projectId }: ProjectRoomsProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const utils = trpc.useUtils();

  const { data: rooms, isLoading } = trpc.rooms.list.useQuery({ projectId });

  const deleteMutation = trpc.rooms.delete.useMutation({
    onSuccess: () => utils.rooms.list.invalidate({ projectId }),
  });

  const handleDelete = (roomId: string, roomName: string) => {
    if (confirm(`האם למחוק את החדר "${roomName}"?`)) {
      deleteMutation.mutate({ id: roomId });
    }
  };

  return (
    <Card size="xl" className="flex h-full flex-col">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>חדרים</CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">+ חדר חדש</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl" dir="rtl">
            <DialogHeader>
              <DialogTitle>הוספת חדר</DialogTitle>
            </DialogHeader>
            <RoomForm projectId={projectId} onSuccess={() => setIsDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="flex-1 overflow-auto">
        {isLoading ? (
          <div className="flex h-full items-center justify-center text-muted-foreground">טוען...</div>
        ) : !rooms?.length ? (
          <div className="flex h-full flex-col items-center justify-center text-center text-muted-foreground">
            <Home className="mb-2 h-8 w-8 opacity-50" />
            <p>אין חדרים בפרויקט</p>
            <p className="text-sm mt-1">לחץ על &quot;+ חדר חדש&quot; להוספת חדר</p>
          </div>
        ) : (
          <div className="space-y-3">
            {rooms.map((room) => (
              <div key={room.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50">
                <div className="flex items-center gap-3">
                  <div>
                    <p className="font-medium">{room.name}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      {room.area && <span>{room.area} מ״ר</span>}
                      {room.budget && <span>₪{room.budget.toLocaleString()}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <ConfigBadge entity={room.roomType} size="sm" />
                  <ConfigBadge entity={room.roomStatus} size="sm" />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2"
                    onClick={() => setEditingRoom(room)}
                  >
                    עריכה
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-destructive hover:text-destructive"
                    onClick={() => handleDelete(room.id, room.name)}
                    disabled={deleteMutation.isPending}
                  >
                    ✕
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {/* Edit Room Dialog */}
      <Dialog open={!!editingRoom} onOpenChange={(open) => !open && setEditingRoom(null)}>
        <DialogContent className="max-w-2xl" dir="rtl">
          <DialogHeader>
            <DialogTitle>עריכת חדר</DialogTitle>
          </DialogHeader>
          {editingRoom && (
            <RoomForm projectId={projectId} room={editingRoom} onSuccess={() => setEditingRoom(null)} />
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}

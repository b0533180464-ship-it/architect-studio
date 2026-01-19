/* eslint-disable max-lines-per-function */
'use client';

import { trpc } from '@/lib/trpc';
import { Badge } from '@/components/ui/badge';
import { ExpandablePanel } from '@/components/projects/hub/expandable-panel';

interface RoomsPanelProps {
  projectId: string;
}

export function ProjectRoomsPanel({ projectId }: RoomsPanelProps) {
  const { data: rooms } = trpc.rooms.list.useQuery({ projectId });

  const roomsList = rooms || [];
  const total = roomsList.length;

  return (
    <ExpandablePanel id="rooms" title="חדרים" icon="🏠" count={total} projectId={projectId}>
      {roomsList.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">אין חדרים</p>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {roomsList.map((room) => (
            <div key={room.id} className="p-2 border rounded hover:bg-muted">
              <div className="font-medium truncate">{room.name}</div>
              <div className="flex items-center justify-between mt-1">
                {room.area && <span className="text-xs text-muted-foreground">{room.area} מ״ר</span>}
                {room.roomStatus && (
                  <Badge variant="outline" className="text-xs" style={{ borderColor: room.roomStatus.color || undefined }}>
                    {room.roomStatus.name}
                  </Badge>
                )}
              </div>
              {room.roomType && (
                <div className="text-xs text-muted-foreground mt-1">{room.roomType.name}</div>
              )}
            </div>
          ))}
        </div>
      )}
    </ExpandablePanel>
  );
}

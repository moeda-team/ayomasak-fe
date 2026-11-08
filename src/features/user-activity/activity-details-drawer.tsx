import { DetailCard, DetailList, DetailRow, DetailSection } from '@/components/shared/detail-card'
import { DetailDrawer } from '@/components/shared/detail-drawer'
import { ErrorState } from '@/components/shared/error-state'
import { toColorIndex } from '@/components/shared/initials-avatar'
import { PersonCell } from '@/components/shared/person-cell'
import { StatusBadge } from '@/components/shared/status-badge'
import { Skeleton } from '@/components/ui/skeleton'
import { RoleBadge } from '@/features/user-management/role-badge'
import type { ActivityDetail, UserSnapshot } from './activity-types'
import { useActivityDetail } from './use-activity'

type ActivityDetailsDrawerProps = {
  /** The activity to show; the drawer is open while this is set. */
  activityId: string | null
  onClose: () => void
}

const SnapshotCard = ({ snapshot }: { snapshot: UserSnapshot }) => (
  <DetailCard>
    <DetailList>
      <DetailRow label="Name">{snapshot.name}</DetailRow>
      <DetailRow label="Email">{snapshot.email}</DetailRow>
      <DetailRow label="Role">
        <RoleBadge roleId={snapshot.roleId} />
      </DetailRow>
      <DetailRow label="Status">
        <StatusBadge status={snapshot.status} />
      </DetailRow>
      <DetailRow label="Permissions">
        {snapshot.permissions.length === 1 ? (
          snapshot.permissions[0]
        ) : (
          <ul className="list-disc space-y-0.5 pl-4">
            {snapshot.permissions.map((permission) => (
              <li key={permission}>{permission}</li>
            ))}
          </ul>
        )}
      </DetailRow>
    </DetailList>
  </DetailCard>
)

const DrawerSkeleton = () => (
  <div className="flex flex-col gap-5" aria-busy>
    <Skeleton className="h-24 w-full rounded-lg" />
    <Skeleton className="h-24 w-full rounded-lg" />
    <Skeleton className="h-56 w-full rounded-lg" />
  </div>
)

const DrawerContent = ({ detail }: { detail: ActivityDetail }) => (
  <>
    <DetailSection title="Performed By">
      <DetailCard>
        <PersonCell
          name={detail.actor.name}
          email={detail.actor.email}
          colorIndex={toColorIndex(detail.actor.id)}
          trailing={<RoleBadge roleId={detail.actor.roleId} />}
        />
      </DetailCard>
    </DetailSection>

    <DetailSection title="Target User">
      <DetailCard>
        <PersonCell
          name={detail.target.name}
          email={detail.target.email}
          colorIndex={toColorIndex(detail.target.email)}
          trailing={<RoleBadge roleId={detail.target.roleId} />}
        />
      </DetailCard>
    </DetailSection>

    {detail.before && (
      <DetailSection title="Before Changes">
        <SnapshotCard snapshot={detail.before} />
      </DetailSection>
    )}
    {detail.after && (
      <DetailSection title="After Changes">
        <SnapshotCard snapshot={detail.after} />
      </DetailSection>
    )}
  </>
)

export const ActivityDetailsDrawer = ({ activityId, onClose }: ActivityDetailsDrawerProps) => {
  const { data, error, isLoading, refetch } = useActivityDetail(activityId)

  return (
    <DetailDrawer
      open={activityId !== null}
      onOpenChange={(open) => !open && onClose()}
      title="Activity Details"
      description="Who performed this action, who it affected, and what changed."
    >
      {error ? (
        <ErrorState title="Could not load details" description={error.message} onRetry={() => void refetch()} />
      ) : isLoading || !data ? (
        <DrawerSkeleton />
      ) : (
        <DrawerContent detail={data} />
      )}
    </DetailDrawer>
  )
}

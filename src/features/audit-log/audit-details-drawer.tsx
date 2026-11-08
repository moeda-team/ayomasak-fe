import { DetailCard, DetailList, DetailRow, DetailSection } from '@/components/shared/detail-card'
import { DetailDrawer } from '@/components/shared/detail-drawer'
import { ErrorState } from '@/components/shared/error-state'
import { toColorIndex } from '@/components/shared/initials-avatar'
import { PersonCell } from '@/components/shared/person-cell'
import { ToneBadge } from '@/components/shared/tone-badge'
import { Skeleton } from '@/components/ui/skeleton'
import { RoleBadge } from '@/features/user-management/role-badge'
import { DRAWER_EXIT_MS, useRetainedValue } from '@/hooks/use-retained-value'
import { formatDayWib, formatTimeWib } from '@/lib/format-date'
import { AuditActionBadge, AuditStatusBadge } from './audit-badges'
import { ENTITY_LABEL } from './audit-labels'
import type { AuditDetail, AuditField } from './audit-types'
import { useAuditDetail } from './use-audit-log'

type AuditDetailsDrawerProps = {
  /** The entry to show; the drawer is open while this is set. */
  logId: string | null
  onClose: () => void
}

const FieldList = ({ fields }: { fields: AuditField[] }) => (
  <DetailCard>
    <DetailList>
      {fields.map((field) => (
        <DetailRow key={field.label} label={field.label}>
          {field.tone ? <ToneBadge tone={field.tone}>{field.value}</ToneBadge> : field.value}
        </DetailRow>
      ))}
    </DetailList>
  </DetailCard>
)

const DrawerSkeleton = () => (
  <div className="flex flex-col gap-5" aria-busy>
    <Skeleton className="h-24 w-full rounded-lg" />
    <Skeleton className="h-52 w-full rounded-lg" />
    <Skeleton className="h-48 w-full rounded-lg" />
  </div>
)

const DrawerContent = ({ detail }: { detail: AuditDetail }) => (
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

    <DetailSection title="Event Details">
      <DetailCard>
        <DetailList>
          <DetailRow label="Action">
            <AuditActionBadge action={detail.action} />
          </DetailRow>
          <DetailRow label="Status">
            <AuditStatusBadge status={detail.status} />
          </DetailRow>
          <DetailRow label="Entity">
            {ENTITY_LABEL[detail.entityType]} · {detail.entityName}
          </DetailRow>
          <DetailRow label="Entity ID">{detail.entityId}</DetailRow>
          <DetailRow label="Timestamp">
            {formatDayWib(detail.occurredAt)}, {formatTimeWib(detail.occurredAt)}
          </DetailRow>
        </DetailList>
      </DetailCard>
    </DetailSection>

    <DetailSection title="Before Changes">
      <FieldList fields={detail.before} />
    </DetailSection>

    {detail.after && (
      <DetailSection title="After Changes">
        <FieldList fields={detail.after} />
      </DetailSection>
    )}

    {detail.failure && (
      <DetailSection title="Failure Details">
        <FieldList
          fields={[
            { label: 'Reason', value: detail.failure.reason },
            ...detail.failure.blockers.map((blocker) => ({ label: 'Blocker', value: blocker })),
          ]}
        />
      </DetailSection>
    )}
  </>
)

export const AuditDetailsDrawer = ({ logId, onClose }: AuditDetailsDrawerProps) => {
  // Keep showing the entry while the drawer slides out, instead of flashing the loading skeleton.
  const { data, error, isLoading, refetch } = useAuditDetail(useRetainedValue(logId, DRAWER_EXIT_MS))

  return (
    <DetailDrawer
      open={logId !== null}
      onOpenChange={(open) => !open && onClose()}
      title="Log Details"
      description="Who performed this action, what it affected, and what changed."
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

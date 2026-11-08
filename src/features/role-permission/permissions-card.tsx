import type { ReactNode } from 'react'
import { NoticeCard } from '@/components/shared/notice-card'
import { SegmentedControl, type SegmentedOption } from '@/components/shared/segmented-control'
import { ACCESS_LEVELS, MODULE_IDS, MODULE_LABEL, type AccessLevel, type ModuleId } from '@/features/user-management/role-permissions'
import type { RolePermissions } from './role-types'

const PUBLISH_OPTIONS: SegmentedOption<'allowed' | 'not-allowed'>[] = [
  { value: 'allowed', label: 'Allowed' },
  { value: 'not-allowed', label: 'Not allowed' },
]

type PermissionRowProps = {
  label: string
  children: ReactNode
  isDisabled: boolean
}

const PermissionRow = ({ label, children, isDisabled }: PermissionRowProps) => (
  <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border-default px-3 py-2.5">
    <span className={isDisabled ? 'text-body-sm text-text-secondary' : 'text-body-sm'}>{label}</span>
    {children}
  </div>
)

type PermissionsCardProps = {
  permissions: RolePermissions
  /** Locked roles show their permissions but cannot change them. */
  isLocked: boolean
  roleName: string
  onModuleChange: (moduleId: ModuleId, level: AccessLevel) => void
  onPublishChange: (canPublish: boolean) => void
}

export const PermissionsCard = ({ permissions, isLocked, roleName, onModuleChange, onPublishChange }: PermissionsCardProps) => (
  <section className="surface-card flex flex-col gap-6 p-6">
    <div className="flex flex-col gap-4">
      <header className="flex flex-col gap-1">
        <h2 className="text-heading-3">Module Permissions</h2>
        <p className="text-body-sm text-text-secondary">Set the level of access for each module.</p>
      </header>

      {isLocked && (
        <NoticeCard tone="info" title={`${roleName} permissions are locked`}>
          This role always has full access to every module and cannot be changed.
        </NoticeCard>
      )}

      <div className="flex flex-col gap-2">
        {MODULE_IDS.map((moduleId) => (
          <PermissionRow key={moduleId} label={MODULE_LABEL[moduleId]} isDisabled={isLocked}>
            <SegmentedControl
              label={`${MODULE_LABEL[moduleId]} access`}
              value={permissions.modules[moduleId]}
              options={ACCESS_LEVELS}
              disabled={isLocked}
              onChange={(level) => onModuleChange(moduleId, level)}
            />
          </PermissionRow>
        ))}
      </div>
    </div>

    <div className="flex flex-col gap-4">
      <header className="flex flex-col gap-1">
        <h2 className="text-heading-3">Special Permissions</h2>
        <p className="text-body-sm text-text-secondary">Actions that need explicit approval, separate from module access.</p>
      </header>
      <PermissionRow label="Publish recipes" isDisabled={isLocked}>
        <SegmentedControl
          label="Publish recipes"
          value={permissions.canPublishRecipes ? 'allowed' : 'not-allowed'}
          options={PUBLISH_OPTIONS}
          disabled={isLocked}
          onChange={(value) => onPublishChange(value === 'allowed')}
        />
      </PermissionRow>
    </div>
  </section>
)

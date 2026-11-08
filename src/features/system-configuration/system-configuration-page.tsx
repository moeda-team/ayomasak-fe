import { useState } from 'react'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { ErrorState } from '@/components/shared/error-state'
import { NoticeCard } from '@/components/shared/notice-card'
import { PageHeader } from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BackupSection } from './backup-section'
import {
  DEFAULT_CONFIG,
  FEATURE_COPY,
  NOTIFICATION_COPY,
  SECTION_LABEL,
  SECTION_NOUN,
  SECTION_RESET_COPY,
} from './config-options'
import { FEATURE_IDS, NOTIFICATION_IDS, SECTION_IDS, type SectionId, type SystemConfig } from './config-types'
import { GeneralSection } from './general-section'
import { MATCHING_FIELD_ORDER, validateMatching } from './matching-validation'
import { MatchingSection } from './matching-section'
import { ToggleListCard } from './toggle-list-card'
import { useSaveSection, useSystemConfig } from './use-system-config'

type DialogState = { kind: 'reset' } | { kind: 'discard'; nextTab: SectionId }

/** Settings are plain data, so structural equality is enough to tell whether a draft differs from what is saved. */
const isSame = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b)

const isSectionId = (value: string): value is SectionId => SECTION_IDS.some((id) => id === value)

const FIELD_IDS: Record<(typeof MATCHING_FIELD_ORDER)[number], string> = {
  exact: 'match-exact',
  near: 'match-near',
  weak: 'match-weak',
  ingredientWeight: 'weight-ingredient',
  equipmentWeight: 'weight-equipment',
  nutritionWeight: 'weight-nutrition',
}

const SectionSkeleton = () => (
  <div className="flex flex-col gap-6" aria-busy>
    {[0, 1].map((card) => (
      <div key={card} className="surface-card flex flex-col gap-5 p-6">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-80 max-w-full" />
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {[0, 1, 2].map((field) => (
            <Skeleton key={field} className="h-14 w-full" />
          ))}
        </div>
      </div>
    ))}
  </div>
)

type ConfigEditorProps = {
  config: SystemConfig | undefined
  error: Error | null
  onRetry: () => void
}

const ConfigEditor = ({ config, error, onRetry }: ConfigEditorProps) => {
  const [tab, setTab] = useState<SectionId>('matching')
  /** Unsaved edits per section. Leaving a section with edits asks first, so at most one is ever present. */
  const [drafts, setDrafts] = useState<Partial<SystemConfig>>({})
  const [dialog, setDialog] = useState<DialogState | null>(null)
  const save = useSaveSection()

  const edit = <TSection extends SectionId>(section: TSection, value: SystemConfig[TSection]) =>
    setDrafts((current) => {
      const next = { ...current }
      next[section] = value
      return next
    })

  const clearDraft = (section: SectionId) =>
    setDrafts((current) => {
      const next = { ...current }
      delete next[section]
      return next
    })

  const draft = drafts[tab]
  const saved = config?.[tab]
  const isDirty = draft !== undefined && !isSame(draft, saved)
  const canReset = config !== undefined && (isDirty || !isSame(saved, DEFAULT_CONFIG[tab]))

  const matchingErrors = config ? validateMatching(drafts.matching ?? config.matching) : {}
  const hasErrors = tab === 'matching' && Object.keys(matchingErrors).length > 0

  const requestTab = (next: string) => {
    if (!isSectionId(next) || next === tab) return
    if (isDirty) setDialog({ kind: 'discard', nextTab: next })
    else setTab(next)
  }

  const focusFirstInvalidField = () => {
    const field = MATCHING_FIELD_ORDER.find((name) => matchingErrors[name]) ?? 'ingredientWeight'
    document.getElementById(FIELD_IDS[field])?.focus()
  }

  const handleSave = () => {
    if (!draft) return
    if (hasErrors) return focusFirstInvalidField()
    save.mutate({ section: tab, value: draft }, { onSuccess: () => clearDraft(tab) })
  }

  const confirmDialog = () => {
    if (dialog?.kind === 'reset') edit(tab, DEFAULT_CONFIG[tab])
    if (dialog?.kind === 'discard') {
      clearDraft(tab)
      setTab(dialog.nextTab)
    }
    setDialog(null)
  }

  return (
    <>
      <PageHeader
        breadcrumb={['System Configuration']}
        title="System Configuration"
        description="Manage matching logic, app defaults, feature availability, notifications, and backups."
        action={
          <div className="flex flex-wrap items-center gap-3">
            {isDirty && <span className="text-body-sm text-status-warning">You have unsaved changes</span>}
            <Button variant="outline" disabled={!canReset || save.isPending} onClick={() => setDialog({ kind: 'reset' })}>
              Reset
            </Button>
            <Button disabled={!isDirty || save.isPending} onClick={handleSave}>
              {save.isPending ? 'Saving…' : 'Save Changes'}
            </Button>
          </div>
        }
      />

      <Tabs value={tab} onValueChange={requestTab}>
        <TabsList aria-label="Configuration sections">
          {SECTION_IDS.map((id) => (
            <TabsTrigger key={id} value={id}>
              {SECTION_LABEL[id]}
            </TabsTrigger>
          ))}
        </TabsList>

        {error ? (
          <ErrorState title="Couldn't load system configuration" description="Something went wrong while loading the settings. Check your connection and try again." onRetry={onRetry} />
        ) : !config ? (
          <SectionSkeleton />
        ) : (
          <>
            <TabsContent value="matching">
              <MatchingSection
                value={drafts.matching ?? config.matching}
                errors={matchingErrors}
                onChange={(value) => edit('matching', value)}
              />
            </TabsContent>
            <TabsContent value="general">
              <GeneralSection value={drafts.general ?? config.general} onChange={(value) => edit('general', value)} />
            </TabsContent>
            <TabsContent value="features">
              <ToggleListCard
                title="Feature toggles"
                description="Turn user-facing features on or off without a new release."
                ids={FEATURE_IDS}
                copy={FEATURE_COPY}
                values={drafts.features ?? config.features}
                onChange={(id, isOn) => edit('features', { ...(drafts.features ?? config.features), [id]: isOn })}
              />
            </TabsContent>
            <TabsContent value="notifications">
              <ToggleListCard
                title="Admin notifications"
                description="Choose which events notify admins and reviewers."
                ids={NOTIFICATION_IDS}
                copy={NOTIFICATION_COPY}
                values={drafts.notifications ?? config.notifications}
                onChange={(id, isOn) =>
                  edit('notifications', { ...(drafts.notifications ?? config.notifications), [id]: isOn })
                }
              />
            </TabsContent>
            <TabsContent value="backup">
              <BackupSection value={drafts.backup ?? config.backup} onChange={(value) => edit('backup', value)} />
            </TabsContent>
          </>
        )}
      </Tabs>

      {dialog?.kind === 'reset' && (
        <ConfirmDialog
          open
          onOpenChange={(open) => !open && setDialog(null)}
          title="Reset to default values?"
          description={SECTION_RESET_COPY[tab]}
          confirmLabel="Reset to defaults"
          pendingLabel="Resetting…"
          isPending={false}
          tone="primary"
          onConfirm={confirmDialog}
        >
          <NoticeCard tone="warning" title="Unsaved changes will be lost">
            Your current edits in this tab will be discarded. You can still change the values again afterwards.
          </NoticeCard>
        </ConfirmDialog>
      )}

      {dialog?.kind === 'discard' && (
        <ConfirmDialog
          open
          onOpenChange={(open) => !open && setDialog(null)}
          title="Discard unsaved changes?"
          description="You are leaving this tab with unsaved changes."
          confirmLabel="Discard changes"
          cancelLabel="Keep editing"
          pendingLabel="Discarding…"
          isPending={false}
          onConfirm={confirmDialog}
        >
          <NoticeCard tone="warning" title="Changes will not be saved">
            Your edits to the {SECTION_NOUN[tab]} will be lost if you switch tabs now.
          </NoticeCard>
        </ConfirmDialog>
      )}
    </>
  )
}

export const SystemConfigurationPage = () => {
  const { data, error, refetch } = useSystemConfig()

  return (
    <div className="flex flex-col gap-6">
      <ConfigEditor config={data} error={error} onRetry={() => void refetch()} />
    </div>
  )
}

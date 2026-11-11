import { ClockCounterClockwiseIcon, DotsThreeIcon } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import type { RecipeStatus } from './recipe-types'

type PublishButtonProps = {
  label: string
  canPublish: boolean
  blockerCount: number
  isBusy: boolean
  onClick: () => void
}

/** Explains with a tooltip why it is disabled; a disabled button cannot be hovered, so the tooltip sits on a wrapper. */
const PublishButton = ({ label, canPublish, blockerCount, isBusy, onClick }: PublishButtonProps) => {
  const reason = !canPublish
    ? 'Only reviewers can publish'
    : blockerCount > 0
      ? `Resolve ${blockerCount} ${blockerCount === 1 ? 'blocker' : 'blockers'} to publish`
      : null
  if (reason === null) {
    return (
      <Button type="button" disabled={isBusy} onClick={onClick}>
        {label}
      </Button>
    )
  }
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span tabIndex={0} className="rounded-md outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50">
          <Button type="button" disabled aria-label={`${label}. ${reason}`} className="pointer-events-none">
            {label}
          </Button>
        </span>
      </TooltipTrigger>
      <TooltipContent side="bottom">{reason}</TooltipContent>
    </Tooltip>
  )
}

type RecipeEditorActionsProps = {
  status: RecipeStatus
  /** False until the recipe has been saved once; version history and archive need a saved recipe. */
  isSaved: boolean
  canPublish: boolean
  blockerCount: number
  isSaving: boolean
  /** Something is saving, publishing or changing status, so the buttons wait. */
  isBusy: boolean
  onPreview: () => void
  onPublish: () => void
  onCreateRevision: () => void
  onUnpublish: () => void
  onRestore: () => void
  onOpenHistory: () => void
  onArchive: () => void
}

/** The buttons in the page header. Which ones show depends on where the recipe is in its lifecycle. */
export const RecipeEditorActions = ({
  status,
  isSaved,
  canPublish,
  blockerCount,
  isSaving,
  isBusy,
  onPreview,
  onPublish,
  onCreateRevision,
  onUnpublish,
  onRestore,
  onOpenHistory,
  onArchive,
}: RecipeEditorActionsProps) => (
  <div className="flex items-center gap-2">
    <Button type="button" variant="outline" onClick={onPreview}>
      Preview
    </Button>

    {(status === 'draft' || status === 'draft-revision') && (
      <>
        <Button type="submit" variant="outline" disabled={isBusy}>
          {isSaving ? 'Saving…' : 'Save draft'}
        </Button>
        <PublishButton
          label={status === 'draft-revision' ? 'Publish revision' : 'Publish'}
          canPublish={canPublish}
          blockerCount={blockerCount}
          isBusy={isBusy}
          onClick={onPublish}
        />
      </>
    )}

    {status === 'published' && (
      <>
        <Button type="button" variant="outline" disabled={isBusy} onClick={onCreateRevision}>
          Create draft revision
        </Button>
        <Button type="button" disabled={isBusy} onClick={onUnpublish}>
          Unpublish
        </Button>
      </>
    )}

    {status === 'archived' && (
      <Button type="button" variant="outline" disabled={isBusy} onClick={onRestore}>
        Restore
      </Button>
    )}

    {isSaved && (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button type="button" variant="outline" size="icon" aria-label="More actions">
            <DotsThreeIcon aria-hidden weight="bold" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-48 shadow-overlay">
          <DropdownMenuItem onSelect={onOpenHistory}>
            <ClockCounterClockwiseIcon aria-hidden />
            Version history
          </DropdownMenuItem>
          {status !== 'archived' && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onSelect={onArchive}>
                Archive recipe
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    )}
  </div>
)

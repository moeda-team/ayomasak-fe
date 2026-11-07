import { FlagIcon, ListChecksIcon, PlusIcon, SealCheckIcon } from '@phosphor-icons/react'
import { Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'

export const QuickActions = () => (
  <nav aria-label="Quick actions" className="flex flex-wrap gap-3">
    <Button asChild size="sm">
      <Link to="/recipes">
        <PlusIcon aria-hidden /> Create Recipe
      </Link>
    </Button>
    <Button asChild variant="outline" size="sm">
      <Link to="/review-queue">
        <ListChecksIcon aria-hidden /> Review Queue
      </Link>
    </Button>
    <Button asChild variant="outline" size="sm">
      <Link to="/data-quality">
        <SealCheckIcon aria-hidden /> Data Quality
      </Link>
    </Button>
    <Button asChild variant="outline" size="sm">
      <Link to="/moderation-queue">
        <FlagIcon aria-hidden /> Moderation Queue
      </Link>
    </Button>
  </nav>
)

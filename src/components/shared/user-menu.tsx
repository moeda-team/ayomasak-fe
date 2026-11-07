import { SignOutIcon } from '@phosphor-icons/react'
import { useNavigate } from '@tanstack/react-router'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { authStore, useSession } from '@/features/auth/auth-store'

const toInitials = (name: string) =>
  name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

export const UserMenu = () => {
  const session = useSession()
  const navigate = useNavigate()
  if (!session) return null

  const handleSignOut = () => {
    authStore.signOut()
    void navigate({ to: '/login', search: { redirect: undefined } })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-auto gap-3 px-2 py-1" aria-label={`Account menu for ${session.name}`}>
          <span className="hidden flex-col items-end text-right sm:flex">
            <span className="text-body-sm">{session.name}</span>
            <span className="text-caption text-text-secondary">{session.email}</span>
          </span>
          <Avatar>
            <AvatarFallback className="bg-action-primary text-text-inverse">{toInitials(session.name)}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-48 shadow-overlay">
        <DropdownMenuLabel className="text-body-sm">{session.email}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={handleSignOut}>
          <SignOutIcon aria-hidden /> Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

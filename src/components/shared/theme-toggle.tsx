import { MoonIcon, SunIcon } from '@phosphor-icons/react'
import { Switch } from '@/components/ui/switch'
import { useTheme } from '@/hooks/use-theme'

export const ThemeToggle = () => {
  const { theme, setTheme } = useTheme()
  const isDark = theme === 'dark'
  const ModeIcon = isDark ? MoonIcon : SunIcon

  return (
    <div className="flex items-center gap-2 text-text-primary">
      <Switch
        checked={isDark}
        onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
        aria-label="Dark mode"
      />
      <ModeIcon className="size-5" aria-hidden />
    </div>
  )
}

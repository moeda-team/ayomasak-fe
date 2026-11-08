import {
  CheckCircleIcon,
  InfoIcon,
  SpinnerIcon,
  WarningCircleIcon,
  WarningIcon,
} from "@phosphor-icons/react"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import { useTheme } from "@/hooks/use-theme"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme } = useTheme()

  return (
    <Sonner
      theme={theme}
      className="toaster group"
      icons={{
        success: <CheckCircleIcon className="size-5" />,
        info: <InfoIcon className="size-5" />,
        warning: <WarningIcon className="size-5" />,
        error: <WarningCircleIcon className="size-5" />,
        loading: <SpinnerIcon className="size-5 animate-spin" />,
      }}
      {...props}
    />
  )
}

export { Toaster }

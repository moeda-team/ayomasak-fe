import { toast } from 'sonner'
import { ToastCard, type ToastKind } from '@/components/shared/toast-card'

type NotifyOptions = {
  title: string
  description: string
}

const show = (kind: ToastKind, { title, description }: NotifyOptions) =>
  toast.custom((id) => <ToastCard kind={kind} title={title} description={description} onDismiss={() => toast.dismiss(id)} />)

/** App-wide toasts. Rendered by the `<Toaster />` mounted in `App`. */
export const notify = {
  success: (options: NotifyOptions) => show('success', options),
  error: (options: NotifyOptions) => show('error', options),
}

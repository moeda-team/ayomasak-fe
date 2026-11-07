type PagePlaceholderProps = {
  title: string
  description: string
}

export const PagePlaceholder = ({ title, description }: PagePlaceholderProps) => (
  <div className="flex flex-col gap-1">
    <h1 className="text-heading-1">{title}</h1>
    <p className="text-body text-text-secondary">{description}</p>
  </div>
)

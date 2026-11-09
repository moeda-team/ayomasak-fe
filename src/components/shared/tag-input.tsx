import { XIcon } from '@phosphor-icons/react'
import { useState, type KeyboardEvent } from 'react'
import { Input } from '@/components/ui/input'
import { RemovableChip } from './removable-chip'

type TagInputProps = {
  id?: string
  value: string[]
  onChange: (value: string[]) => void
  placeholder: string
  /** Accessible name of a tag's remove button. */
  removeLabel: (tag: string) => string
  'aria-describedby'?: string
}

const hasTag = (tags: string[], candidate: string) => tags.some((tag) => tag.toLowerCase() === candidate.toLowerCase())

/** A text box that turns what is typed into removable tags on Enter or comma. Duplicates are ignored. */
export const TagInput = ({ id, value, onChange, placeholder, removeLabel, 'aria-describedby': describedBy }: TagInputProps) => {
  const [draft, setDraft] = useState('')

  const commitDraft = () => {
    const tag = draft.trim()
    setDraft('')
    if (tag !== '' && !hasTag(value, tag)) onChange([...value, tag])
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' || event.key === ',') {
      // Enter must not submit the form around the field.
      event.preventDefault()
      commitDraft()
    } else if (event.key === 'Backspace' && draft === '' && value.length > 0) {
      onChange(value.slice(0, -1))
    }
  }

  return (
    <>
      <Input
        id={id}
        value={draft}
        placeholder={placeholder}
        autoComplete="off"
        aria-describedby={describedBy}
        className="text-body-sm md:text-body-sm"
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={commitDraft}
      />
      {value.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {value.map((tag) => (
            <li key={tag}>
              <RemovableChip
                label={tag}
                icon={XIcon}
                removeLabel={removeLabel(tag)}
                onRemove={() => onChange(value.filter((existing) => existing !== tag))}
              />
            </li>
          ))}
        </ul>
      )}
    </>
  )
}

import { type ReactNode, useId, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

interface ActionMenuProps {
  label: string
  children: ReactNode
}

export function ActionMenu({ label, children }: ActionMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const triggerRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const menuId = useId()

  useLayoutEffect(() => {
    if (!isOpen) return

    const trigger = triggerRef.current
    const menu = menuRef.current
    if (!trigger || !menu) return

    const updatePosition = () => {
      const triggerRect = trigger.getBoundingClientRect()
      const menuRect = menu.getBoundingClientRect()
      const gap = 6
      const viewportPadding = 8
      const fitsBelow = triggerRect.bottom + gap + menuRect.height <= window.innerHeight - viewportPadding
      const top = fitsBelow
        ? triggerRect.bottom + gap
        : Math.max(viewportPadding, triggerRect.top - menuRect.height - gap)
      const left = Math.min(
        window.innerWidth - menuRect.width - viewportPadding,
        Math.max(viewportPadding, triggerRect.right - menuRect.width),
      )
      setPosition({ top, left })
    }

    updatePosition()

    const closeMenu = (event: MouseEvent | FocusEvent) => {
      const target = event.target as Node
      if (!trigger.contains(target) && !menu.contains(target)) setIsOpen(false)
    }
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
        trigger.focus()
      }
    }
    const closeOnViewportChange = () => setIsOpen(false)

    document.addEventListener('mousedown', closeMenu)
    document.addEventListener('focusin', closeMenu)
    document.addEventListener('keydown', closeOnEscape)
    window.addEventListener('resize', closeOnViewportChange)
    window.addEventListener('scroll', closeOnViewportChange, true)

    return () => {
      document.removeEventListener('mousedown', closeMenu)
      document.removeEventListener('focusin', closeMenu)
      document.removeEventListener('keydown', closeOnEscape)
      window.removeEventListener('resize', closeOnViewportChange)
      window.removeEventListener('scroll', closeOnViewportChange, true)
    }
  }, [isOpen])

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className="action-menu-trigger"
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls={isOpen ? menuId : undefined}
        onClick={() => setIsOpen((current) => !current)}
      >
        <svg aria-hidden="true" viewBox="0 0 24 24">
          <circle cx="12" cy="5" r="1.8" />
          <circle cx="12" cy="12" r="1.8" />
          <circle cx="12" cy="19" r="1.8" />
        </svg>
      </button>
      {isOpen && createPortal(
        <div
          ref={menuRef}
          id={menuId}
          className="action-menu-popover"
          role="menu"
          style={{ top: position.top, left: position.left }}
          onClick={() => setIsOpen(false)}
        >
          {children}
        </div>,
        document.body,
      )}
    </>
  )
}

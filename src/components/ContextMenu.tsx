import { createPortal } from 'react-dom';
import { Menu, MenuItem } from 'react-aria-components';

export interface ContextMenuItem {
  id: string;
  label: string;
  onAction: () => void;
  danger?: boolean;
}

interface ContextMenuProps {
  x: number;
  y: number;
  items: ContextMenuItem[];
  onClose: () => void;
}

export function ContextMenu({ x, y, items, onClose }: ContextMenuProps) {
  const menuWidth = 160;
  const menuHeight = items.length * 30 + 16;
  const adjustedX = Math.min(x, window.innerWidth - menuWidth - 8);
  const adjustedY = Math.min(y, window.innerHeight - menuHeight - 8);

  return createPortal(
    <>
      {/* Backdrop: dismiss on click or right-click */}
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
        onContextMenu={(e) => {
          e.preventDefault();
          onClose();
        }}
      />
      {/* Menu panel */}
      <div
        className="fixed z-50 min-w-40 bg-bg-alt border border-border rounded-lg shadow-2xl overflow-hidden py-1"
        style={{ left: adjustedX, top: adjustedY }}
      >
        <Menu
          autoFocus="first"
          onClose={onClose}
          onAction={(key) => {
            const item = items.find((i) => i.id === String(key));
            item?.onAction();
            onClose();
          }}
          className="outline-none"
        >
          {items.map((item) => (
            <MenuItem
              key={item.id}
              id={item.id}
              className={({ isHovered, isFocused }) =>
                [
                  'flex items-center px-3 py-1.5 text-xs cursor-pointer outline-none select-none',
                  item.danger
                    ? isHovered || isFocused
                      ? 'bg-red/10 text-red'
                      : 'text-text-muted'
                    : isHovered || isFocused
                      ? 'bg-bg-hover text-text'
                      : 'text-text-muted',
                ].join(' ')
              }
            >
              {item.label}
            </MenuItem>
          ))}
        </Menu>
      </div>
    </>,
    document.body,
  );
}

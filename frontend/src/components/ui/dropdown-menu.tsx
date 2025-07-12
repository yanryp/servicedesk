import React, { useState, useRef, useEffect } from 'react';
import { cn } from '../../utils/cn';

interface DropdownMenuProps {
  children: React.ReactNode;
}

interface DropdownMenuTriggerProps {
  asChild?: boolean;
  children: React.ReactNode;
}

interface DropdownMenuContentProps {
  align?: 'start' | 'center' | 'end';
  children: React.ReactNode;
  className?: string;
}

interface DropdownMenuItemProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  disabled?: boolean;
}

const DropdownMenuContext = React.createContext<{
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
} | null>(null);

const DropdownMenu: React.FC<DropdownMenuProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <DropdownMenuContext.Provider value={{ isOpen, setIsOpen }}>
      <div className="relative inline-block text-left">
        {children}
      </div>
    </DropdownMenuContext.Provider>
  );
};

const DropdownMenuTrigger: React.FC<DropdownMenuTriggerProps> = ({ 
  asChild, 
  children 
}) => {
  const context = React.useContext(DropdownMenuContext);
  if (!context) {
    throw new Error('DropdownMenuTrigger must be used within DropdownMenu');
  }

  const { isOpen, setIsOpen } = context;

  if (asChild) {
    return React.cloneElement(children as React.ReactElement<any>, {
      onClick: () => setIsOpen(!isOpen),
    });
  }

  return (
    <button onClick={() => setIsOpen(!isOpen)}>
      {children}
    </button>
  );
};

const DropdownMenuContent: React.FC<DropdownMenuContentProps> = ({ 
  align = 'start', 
  children, 
  className 
}) => {
  const context = React.useContext(DropdownMenuContext);
  const ref = useRef<HTMLDivElement>(null);

  if (!context) {
    throw new Error('DropdownMenuContent must be used within DropdownMenu');
  }

  const { isOpen, setIsOpen } = context;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, setIsOpen]);

  if (!isOpen) return null;

  const alignmentClasses = {
    start: 'left-0',
    center: 'left-1/2 transform -translate-x-1/2',
    end: 'right-0',
  };

  return (
    <div
      ref={ref}
      className={cn(
        'absolute z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md',
        'top-full mt-1',
        alignmentClasses[align],
        className
      )}
    >
      {children}
    </div>
  );
};

const DropdownMenuItem: React.FC<DropdownMenuItemProps> = ({ 
  children, 
  disabled, 
  className,
  onClick,
  ...props 
}) => {
  const context = React.useContext(DropdownMenuContext);
  
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!disabled) {
      onClick?.(e);
      context?.setIsOpen(false);
    }
  };

  return (
    <div
      className={cn(
        'relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors',
        disabled 
          ? 'pointer-events-none opacity-50' 
          : 'focus:bg-accent focus:text-accent-foreground hover:bg-accent hover:text-accent-foreground cursor-pointer',
        className
      )}
      onClick={handleClick}
      {...props}
    >
      {children}
    </div>
  );
};

const DropdownMenuSeparator = () => (
  <div className="-mx-1 my-1 h-px bg-muted" />
);

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
};
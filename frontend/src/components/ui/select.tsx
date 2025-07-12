import * as React from "react";
import { cn } from "../../utils/cn";

interface SelectContextValue {
  value: string;
  onChange: (value: string) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
}

const SelectContext = React.createContext<SelectContextValue | undefined>(undefined);

interface SelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
}

export const Select: React.FC<SelectProps> = ({ value = "", onValueChange, children }) => {
  const [open, setOpen] = React.useState(false);
  const [internalValue, setInternalValue] = React.useState(value);

  const handleChange = (newValue: string) => {
    setInternalValue(newValue);
    onValueChange?.(newValue);
    setOpen(false);
  };

  return (
    <SelectContext.Provider value={{ value: internalValue, onChange: handleChange, open, setOpen }}>
      <div className="relative">
        {children}
      </div>
    </SelectContext.Provider>
  );
};

export const SelectTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, children, ...props }, ref) => {
  const context = React.useContext(SelectContext);
  if (!context) throw new Error("SelectTrigger must be used within Select");

  return (
    <button
      ref={ref}
      type="button"
      onClick={() => context.setOpen(!context.open)}
      className={cn(
        "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
});
SelectTrigger.displayName = "SelectTrigger";

export const SelectValue: React.FC<{ placeholder?: string }> = ({ placeholder }) => {
  const context = React.useContext(SelectContext);
  if (!context) throw new Error("SelectValue must be used within Select");

  return <span>{context.value || placeholder || "Select an option"}</span>;
};

export const SelectContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  children,
  ...props
}) => {
  const context = React.useContext(SelectContext);
  if (!context) throw new Error("SelectContent must be used within Select");

  if (!context.open) return null;

  return (
    <div
      className={cn(
        "absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md bg-popover py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

interface SelectItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
}

export const SelectItem: React.FC<SelectItemProps> = ({ value, className, children, ...props }) => {
  const context = React.useContext(SelectContext);
  if (!context) throw new Error("SelectItem must be used within Select");

  return (
    <div
      onClick={() => context.onChange(value)}
      className={cn(
        "relative cursor-pointer select-none py-2 px-3 hover:bg-accent hover:text-accent-foreground",
        context.value === value && "bg-accent text-accent-foreground",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
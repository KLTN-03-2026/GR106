import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../../utils/cn"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        "cta-yellow": "bg-[#E8C840] text-[#1A2E10] hover:bg-[#D4B539] font-semibold text-lg transition-transform hover:scale-[1.02] shadow-[0_4px_14px_rgba(232,200,64,0.4)]",
        "outline-dark": "border border-dark-olive text-dark-olive hover:bg-dark-olive hover:text-white",
        "outline-yellow": "border border-light-yellow-1 text-light-yellow-1 hover:bg-light-yellow-1 hover:text-dark-olive",
        "dark-olive": "bg-[#3D6B31] text-white hover:bg-[#2D4F24] shadow-md transition-all active:scale-95",
        "dark-nav": "bg-[#1E251C] text-white hover:bg-[#2A3428] transition-all active:scale-95",
        "light": "bg-[#F5F5EC] text-[#292D32] hover:bg-[#EAEAE0] transition-all active:scale-95",
      },

      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        md: "h-[54px] px-8 rounded-2xl",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  fullWidth?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, fullWidth, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }), fullWidth && "w-full")}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }

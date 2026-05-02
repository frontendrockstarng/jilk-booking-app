import * as React from "react"

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "outline" | "ghost"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className = "", variant = "primary", ...props }, ref) => {
        const baseStyles = "inline-flex items-center justify-center rounded-full font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none"
        const variants = {
            primary: "bg-primary text-primary-foreground hover:bg-blue-700 px-8 py-3 shadow-inner-blue",
            outline: "border border-slate-200 hover:bg-slate-100 px-8 py-3 text-slate-900",
            ghost: "hover:bg-slate-100 hover:text-slate-900 px-8 py-3"
        }

        return (
            <button
                className={`${baseStyles} ${variants[variant]} ${className}`}
                ref={ref}
                {...props}
            />
        )
    }
)
Button.displayName = "Button"

export { Button }

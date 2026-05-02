import * as React from "react"

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className = "", ...props }, ref) => (
        <div
            ref={ref}
            className={`rounded-xl border border-slate-200 bg-white text-slate-950 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ${className}`}
            {...props}
        />
    )
)
Card.displayName = "Card"

export { Card }

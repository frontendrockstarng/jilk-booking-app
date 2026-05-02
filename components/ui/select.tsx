import * as React from "react"

export interface SelectProps
    extends React.SelectHTMLAttributes<HTMLSelectElement> {
    options: { label: string; value: string }[]
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
    ({ className = "", options, ...props }, ref) => {
        return (
            <select
                className={`flex h-12 w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M5%207l5%205%205-5%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%222%22%20fill%3D%22none%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[position:right_1rem_center] pr-10 ${className}`}
                ref={ref}
                {...props}
            >
                <option value="" disabled>Select an option</option>
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>
        )
    }
)
Select.displayName = "Select"

export { Select }

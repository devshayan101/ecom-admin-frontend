interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export default function Select({ label, error, options, className = "", ...props }: SelectProps) {
  return (
    <div>
      {label && (
        <label htmlFor={props.id} className="block text-sm font-medium text-foreground mb-1">
          {label}
        </label>
      )}
      <select
        className={`block w-full rounded-md border border-border px-3 py-2 text-sm text-foreground bg-background focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary ${error ? "border-destructive" : ""} ${className} cursor-pointer`}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-sm text-destructive">{error}</p>}
    </div>
  );
}

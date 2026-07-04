export default function FormSelect({
  label,
  name,
  value,
  onChange,
  children,
  required = false,
}) {
  return (
    <div>
      {label && (
        <label className="mb-2 block text-sm font-semibold text-gray-700">
          {label}
        </label>
      )}

      <select
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="h-12 w-full rounded-xl border border-gray-200 px-4 outline-none focus:border-yellow-400"
      >
        {children}
      </select>
    </div>
  );
}
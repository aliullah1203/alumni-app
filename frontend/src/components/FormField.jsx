export default function FormField({ label, required, hint, children, className }) {
  return (
    <label className={`field${className ? ` ${className}` : ""}`}>
      <span className="field__label">{label}{required && <> <i>*</i></>}</span>
      {children}
      {hint && <span className="field__hint">{hint}</span>}
    </label>
  );
}

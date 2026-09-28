import { Link } from "react-router-dom";

const cx = (...c) => c.filter(Boolean).join(" ");

/** Renders <Link> when `to` is given, <a> when `href`, otherwise <button>. */
export default function Button({ variant, size, block, to, href, className, children, ...rest }) {
  const cls = cx("btn", variant && `btn--${variant}`, size && `btn--${size}`, block && "btn--block", className);
  if (to) return <Link to={to} className={cls} {...rest}>{children}</Link>;
  if (href) return <a href={href} className={cls} {...rest}>{children}</a>;
  return <button type="button" className={cls} {...rest}>{children}</button>;
}

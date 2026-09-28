import { createContext, useContext, useEffect, useState } from "react";
import heroImage from "../assets/hero.png";
import { SITE } from "../data/site.js";

export const DEFAULTS = {
  title: `Welcome to the ${SITE.shortName} Alumni Community`,
  description: "Reconnecting Friends | Building Networks | Shaping the Future",
  banner: heroImage,
};

// Bumped to v2 so old cached content does not override the new UITS defaults
const KEY = "alumni.content.v2";
const Ctx = createContext(null);

export function ContentProvider({ children }) {
  const [content, setContent] = useState(() => {
    try { return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(KEY) || "{}") }; }
    catch { return DEFAULTS; }
  });
  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(content)); } catch { /* storage full/unavailable */ }
  }, [content]);
  return <Ctx.Provider value={{ content, setContent, defaults: DEFAULTS }}>{children}</Ctx.Provider>;
}
export const useContent = () => useContext(Ctx);

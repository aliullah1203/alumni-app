import { createContext, useContext, useEffect, useState } from "react";
import { contentApi } from "../api/content";
import { SITE } from "../data/site.js";

const DEFAULTS = {
  title: `Welcome to the ${SITE.shortName} Alumni Community`,
  description: "Reconnecting Friends | Building Networks | Shaping the Future",
  banner: "",
};

const Ctx = createContext(null);

export function ContentProvider({ children }) {
  const [content, setContent] = useState(DEFAULTS);

  useEffect(() => {
    contentApi.get()
      .then((r) => {
        const hero = r.data?.hero ?? {};
        setContent({
          title: hero.title || DEFAULTS.title,
          description: hero.description || DEFAULTS.description,
          banner: hero.bannerUrl || DEFAULTS.banner,
        });
      })
      .catch(() => {});
  }, []);

  return <Ctx.Provider value={{ content, setContent, defaults: DEFAULTS }}>{children}</Ctx.Provider>;
}

export const useContent = () => useContext(Ctx);

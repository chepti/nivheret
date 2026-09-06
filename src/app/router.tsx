import { useEffect, useState } from "react";
import type { RouteName } from "../lib/types";

export type Route = { name: RouteName; id?: string };

function parse(): Route {
  const raw = location.hash.replace(/^#\/?/, "");
  const [name, id] = raw.split("/");
  const known: RouteName[] = [
    "welcome", "who", "checklist", "learn", "lesson", "profile", "meetings", "admin", "cms",
  ];
  if (known.includes(name as RouteName)) return { name: name as RouteName, id };
  return { name: "welcome" };
}

export function navigate(name: RouteName, id?: string) {
  location.hash = id ? `#/${name}/${id}` : `#/${name}`;
}

export function useRoute(): Route {
  const [route, setRoute] = useState<Route>(parse);
  useEffect(() => {
    const on = () => setRoute(parse());
    window.addEventListener("hashchange", on);
    return () => window.removeEventListener("hashchange", on);
  }, []);
  return route;
}

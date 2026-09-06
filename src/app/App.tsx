import { useEffect } from "react";
import { StoreProvider, useStore } from "./store";
import { useRoute } from "./router";
import { Shell } from "../components/Shell";
import { Welcome } from "../screens/Welcome";
import { Who } from "../screens/Who";
import { Checklist } from "../screens/Checklist";
import { Learn } from "../screens/Learn";
import { Profile } from "../screens/Profile";
import { Meetings } from "../screens/Meetings";
import { AdminDash } from "../screens/AdminDash";
import { Cms } from "../screens/Cms";

function Pages() {
  const route = useRoute();
  const { session } = useStore();
  const wide = route.name === "admin";

  useEffect(() => {
    if (!session && route.name !== "welcome" && route.name !== "who") {
      location.hash = "#/welcome";
    }
  }, [session, route.name]);

  let page: React.ReactNode = <Welcome />;
  if (route.name === "who") page = <Who />;
  if (route.name === "checklist") page = <Checklist />;
  if (route.name === "learn" || route.name === "lesson") page = <Learn route={route} />;
  if (route.name === "profile") page = <Profile />;
  if (route.name === "meetings") page = <Meetings />;
  if (route.name === "admin") page = <AdminDash />;
  if (route.name === "cms") page = <Cms />;

  return (
    <div className={`app-shell ${wide ? "wide" : ""}`}>
      <Shell route={route}>{page}</Shell>
    </div>
  );
}

export function App() {
  return (
    <StoreProvider>
      <Pages />
    </StoreProvider>
  );
}

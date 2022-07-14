import { Route } from "react-location";
import Dashboard from "./Dashboard";
import Interrogation from "./Interrogation";
import Statistics from "./Statistics";
import Totals from "./Totals";
import WhoDidWhat from "./WhoDidWhat";

export const Routes: Route[] = [
  // { path: "/", element: <Dashboard /> },
  {
    path: "/",
    element: <Statistics />,
  },
  {
    path: "/district-summaries",
    element: <Totals />,
  },
  {
    path: "/wdw",
    element: <WhoDidWhat />,
  },
  {
    path: "/interrogation",
    element: <Interrogation />,
  },
];

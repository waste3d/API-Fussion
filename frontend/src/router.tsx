import { createBrowserRouter } from "react-router-dom";
import { Shell } from "./components/Shell";
import SearchPage from "./pages/SearchPage";
import SourcePage from "./pages/SourcePage";
import LogsPage from "./pages/LogsPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Shell />,
    children: [
      { index: true, element: <SearchPage /> },
      { path: "sources", element: <SourcePage /> },
      { path: "logs", element: <LogsPage /> },
    ],
  },
]);
import { createBrowserRouter } from "react-router-dom";
import { AppLayout } from "./layouts/AppLayout";
import { AdrListPage } from "./pages/AdrListPage";
import { AdrDetailPage } from "./pages/AdrDetailPage";
import { GraphPage } from "./pages/GraphPage";
import { SearchPage } from "./pages/SearchPage";

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { index: true, element: <AdrListPage /> },
      { path: "adrs/:id", element: <AdrDetailPage /> },
      { path: "graph", element: <GraphPage /> },
      { path: "search", element: <SearchPage /> },
    ],
  },
]);

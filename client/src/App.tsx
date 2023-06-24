import "./App.css";
import { UploadForm } from "./components/UploadForm";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";
import { EditArticle } from "./components/EditArticle";
import { Layout } from "./components/Layout";
import { ArticleList } from "./components/ArticleList";

function App() {
  const router = createBrowserRouter(
    createRoutesFromElements(
      <>
        <Route element={<Layout />}>
          <Route path="/" element={<UploadForm />} />

          <Route path="/articles" element={<ArticleList />} />
          <Route path="/article/:id" element={<EditArticle />} />
        </Route>
      </>
    )
  );

  return (
    <>
      <RouterProvider router={router} />
    </>
  );
}

export default App;

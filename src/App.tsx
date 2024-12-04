import "./App.css";
import { HashRouter, Route, Routes } from "react-router-dom";
import Home from "./Home";
import About from "./About";
import Header from "./components/Header";
import Footer from "./components/Footer";
import PostDetail from "./PostDetail";
import EditPost from "./EditPost";

function App() {
  return (
    <>
      <HashRouter>
        <Header />
        <Routes>
          <Route path={"/"} element={<Home />} />
          <Route path={"/about/"} element={<About />} />
          <Route path={"/post/:postId"} element={<PostDetail />} />
          <Route path="/edit-post/:postId" element={<EditPost />} />
        </Routes>
        <Footer />
      </HashRouter>
    </>
  );
}

export default App;

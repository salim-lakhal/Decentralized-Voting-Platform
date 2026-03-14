import { Routes, Route } from "react-router-dom";
import { Web3Provider } from "./context/Web3Context";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Elections from "./pages/Elections";
import ElectionDetail from "./pages/ElectionDetail";
import Admin from "./pages/Admin";

function App() {
  return (
    <Web3Provider>
      <div className="flex flex-col min-h-screen bg-base-100">
        <Header />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/elections" element={<Elections />} />
            <Route path="/elections/:id" element={<ElectionDetail />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Web3Provider>
  );
}

export default App;

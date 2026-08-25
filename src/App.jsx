import "./App.css";
import Header from "./components/Header";
import MapView from "./components/MapView";

function App() {
  return (
    <div className="app">
      <Header />

      <main className="main-content">
        <MapView />
      </main>
    </div>
  );
}

export default App;
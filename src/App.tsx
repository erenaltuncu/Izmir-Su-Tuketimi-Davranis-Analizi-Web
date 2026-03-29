import { Navbar } from "./components/Navbar";
import { PageSections } from "./sections/PageSections";

function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Navbar />
      <main>
        <PageSections />
      </main>
    </div>
  );
}

export default App;

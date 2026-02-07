import { useState } from "react";
import reactLogo from "./assets/react.svg";
import { invoke } from "@tauri-apps/api/core";

function App() {
  const [greetMsg, setGreetMsg] = useState("");
  const [name, setName] = useState("");

  async function greet() {
    setGreetMsg(await invoke("greet", { name }));
  }

  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold mb-8">Welcome to Tauri + React</h1>

      <div className="flex gap-8 mb-6">
        <a href="https://vite.dev" target="_blank" className="hover:opacity-80 transition-opacity">
          <img src="/vite.svg" className="w-24 h-24" alt="Vite logo" />
        </a>
        <a href="https://tauri.app" target="_blank" className="hover:opacity-80 transition-opacity">
          <img src="/tauri.svg" className="w-24 h-24" alt="Tauri logo" />
        </a>
        <a href="https://react.dev" target="_blank" className="hover:opacity-80 transition-opacity">
          <img src={reactLogo} className="w-24 h-24 animate-spin" style={{ animationDuration: '20s' }} alt="React logo" />
        </a>
      </div>

      <p className="text-muted-foreground mb-8">Click on the Tauri, Vite, and React logos to learn more.</p>

      <form
        className="flex gap-4 mb-4"
        onSubmit={(e) => {
          e.preventDefault();
          greet();
        }}
      >
        <input
          id="greet-input"
          onChange={(e) => setName(e.currentTarget.value)}
          placeholder="Enter a name..."
          className="px-4 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <button
          type="submit"
          className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          Greet
        </button>
      </form>

      <p className="text-lg font-medium">{greetMsg}</p>
    </main>
  );
}

export default App;

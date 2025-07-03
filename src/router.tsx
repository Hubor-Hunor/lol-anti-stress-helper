import { HashRouter, Route, Routes } from "react-router-dom";
import { Background } from "./windows/Background.tsx";
import { InGame } from "./windows/InGame.tsx";

export function Router() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/background" element={<Background />} />
        <Route path="/in_game" element={<InGame />} />
      </Routes>
    </HashRouter>
  )
}
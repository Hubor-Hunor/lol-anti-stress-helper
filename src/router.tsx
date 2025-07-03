import { Background } from "./windows/Background";
import { InGame } from "./windows/InGame";

// This is a simpler router that doesn't use the URL hash.
// It checks the window's name to decide what to render.
function App() {
  if (window.name === 'background') {
    return <Background />;
  } else {
    return <InGame />;
  }
}

export function Router() {
  return <App />;
}
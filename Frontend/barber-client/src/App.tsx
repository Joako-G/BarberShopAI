import { Toaster } from "sileo";
import "sileo/styles.css";
import { AppRouter } from "./routes/AppRouter"

function App() {

  return (
    <>
      <Toaster
        offset={{ top: 20, right: 16 }}
        position="top-right"
        theme="light"
      />
      <AppRouter />
    </>
  )
}

export default App

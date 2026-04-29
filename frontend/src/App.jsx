import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ExamProvider } from "./context/ExamContext";
import AppRoutes from "./routes/AppRoutes";

export default function App() {
  return (
    <AuthProvider>
      <ExamProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </ExamProvider>
    </AuthProvider>
  );
}

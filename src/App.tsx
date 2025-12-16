import { Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "./components/AppLayout";
import { HomePage } from "./routes/HomePage";
import { NotesPage } from "./routes/NotesPage";
import { RecordPage } from "./routes/RecordPage";
import { ReviewPage } from "./routes/ReviewPage";
import { SearchPage } from "./routes/SearchPage";
import { SettingsPage } from "./routes/SettingsPage";
import { TasksPage } from "./routes/TasksPage";

export function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/record" element={<RecordPage />} />
        <Route path="/review" element={<ReviewPage />} />
        <Route path="/tasks" element={<TasksPage />} />
        <Route path="/notes" element={<NotesPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}



import { Route, Routes } from 'react-router';
import { FieldPreviewPage } from './pages/FieldPreviewPage';
import { TitlePage } from './pages/TitlePage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<TitlePage />} />
      <Route path="/field" element={<FieldPreviewPage />} />
      <Route path="*" element={<TitlePage />} />
    </Routes>
  );
}

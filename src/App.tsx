import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';

const Home = lazy(() => import('./pages/Home'));
const Nation = lazy(() => import('./pages/Nation'));
const Doctrines = lazy(() => import('./pages/Doctrines'));
const UnitPage = lazy(() => import('./pages/UnitPage'));
const NotFound = lazy(() => import('./pages/NotFound'));
const Compare = lazy(() => import('./pages/Compare'));

export default function App() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0e0f12]" />}>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="nations/:faction" element={<Nation />} />
          <Route path="nations/:faction/doctrines" element={<Doctrines />} />
          <Route path="units/:index" element={<UnitPage />} />
          <Route path="compare/:first/:second?" element={<Compare />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

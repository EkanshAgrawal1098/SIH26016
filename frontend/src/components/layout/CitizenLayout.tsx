import { Outlet } from 'react-router-dom';
import { Header } from './Header';

export function CitizenLayout() {
  return (
    <div className="flex h-screen flex-col">
      <Header />
      <main className="flex-1 overflow-y-auto bg-slate-50">
        <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

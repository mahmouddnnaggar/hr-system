import { Menu } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import Button from '../common/Button';
import { useAuth } from '../../context/AuthContext';

const pageNames = {
  '/hr/dashboard': 'dashboard',
  '/hr/employees': 'employees',
  '/hr/exams': 'exams library',
  '/hr/assignments': 'assigned exams',
  '/hr/assigned-exams': 'assigned exams',
  '/hr/assign-exam': 'assign exam',
  '/hr/results': 'recent results',
  '/employee/dashboard': 'my portal',
  '/employee/exams': 'evaluations',
  '/employee/results': 'audit history',
};

function getTitle(pathname) {
  const exact = pageNames[pathname];
  if (exact) return exact;
  if (pathname.includes('result')) return 'result details';
  if (pathname.includes('intro')) return 'exam start';
  if (pathname.includes('slides')) return 'exam session';
  return 'dashboard';
}

export default function Header({ onOpenSidebar }) {
  const { currentUser } = useAuth();
  const { pathname } = useLocation();

  return (
    <header className="flex min-h-16 shrink-0 items-center justify-between gap-4 border-b border-slate-200 bg-white px-4 sm:px-6 lg:px-10">
      <div className="flex min-w-0 items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onOpenSidebar}
          aria-label="Open navigation"
        >
          <Menu size={20} />
        </Button>
        <div className="hidden h-6 w-1.5 rounded-full bg-blue-600 sm:block" />
        <h1 className="truncate text-sm font-bold uppercase text-slate-900 sm:text-lg">
          {getTitle(pathname)}
        </h1>
      </div>
      <div className="flex shrink-0 items-center gap-3 text-xs font-bold uppercase text-slate-400">
        <div className="hidden h-4 w-px bg-slate-200 md:block" />

        <span className="ml-3 hidden rounded border border-slate-200 bg-slate-100 px-2 py-0.5 text-[8px] text-slate-400 sm:inline">
          {currentUser?.role} VIEW
        </span>
      </div>
    </header>
  );
}

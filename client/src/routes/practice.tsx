import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router';
import { PracticeSidebar } from '../components/practiceSideBar';
import { ProblemList } from '../components/problemList';
import { useContext, useEffect } from 'react';
import { CurrentPageContext, useAuth } from './__root';
import type { RouterContext } from '../App';

export const Route = createFileRoute('/practice')({
  component: RouteComponent,
});

function RouteComponent() {
  let { setCurrentPage } = useContext(CurrentPageContext);
  let navigate = useNavigate();
  let auth = useAuth();

  useEffect(() => {
    if (auth.user) {
      setCurrentPage('practice');
    } else {
      navigate({ to: '/' });
    }
  }, []);
  return (
    <div className='flex h-full'>
      <PracticeSidebar />
      <ProblemList />
    </div>
  );
}

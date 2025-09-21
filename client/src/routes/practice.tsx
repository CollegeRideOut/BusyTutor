import { createFileRoute } from '@tanstack/react-router';
import { PracticeSidebar } from '../components/practiceSideBar';
import { ProblemList } from '../components/problemList';
import { useContext, useEffect } from 'react';
import { CurrentPageContext } from './__root';

export const Route = createFileRoute('/practice')({
  component: RouteComponent,
});

function RouteComponent() {
  let { setCurrentPage } = useContext(CurrentPageContext);
  useEffect(() => {
    setCurrentPage('practice');
  }, []);
  return (
    <div className='flex h-full'>
      <PracticeSidebar />
      <ProblemList />
    </div>
  );
}

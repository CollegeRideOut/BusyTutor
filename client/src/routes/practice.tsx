import { createFileRoute } from '@tanstack/react-router';
import { PracticeSidebar } from '../components/practiceSideBar';
import { ProblemList } from '../components/problemList';

export const Route = createFileRoute('/practice')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className='flex h-full'>
      <PracticeSidebar />
      <ProblemList />
    </div>
  );
}

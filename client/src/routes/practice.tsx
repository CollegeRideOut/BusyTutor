import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { PracticeSidebar } from '../components/practiceSideBar';
import { ProblemList } from '../components/problemList';
import { useAuth } from './__root';

export const Route = createFileRoute('/practice')({
  component: RouteComponent,
});

function RouteComponent() {
  useNavigate();
  let { user } = useAuth();

  return (
    <div className='flex h-full'>
      <PracticeSidebar user={user}/>
      <ProblemList />
    </div>
  );
}

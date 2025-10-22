import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { ProblemPage } from '../../components/problem';
import { useContext, useEffect } from 'react';
import { CurrentPageContext, useAuth } from '../__root';

export const Route = createFileRoute('/problems/$id')({
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useParams();
  let { setCurrentPage } = useContext(CurrentPageContext);
  let navigate = useNavigate();
  let auth = useAuth();

  useEffect(() => {
    if (auth.user) {
      setCurrentPage('problem');
    } else {
      navigate({ to: '/' });
    }
  }, []);
  //TODO possible error
  return <ProblemPage problemId={parseInt(id)} />;
}

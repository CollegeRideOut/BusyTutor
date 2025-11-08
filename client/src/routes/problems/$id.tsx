import { createFileRoute } from '@tanstack/react-router';
import { ProblemPage } from '../../components/problem';
import { useAuth } from '../__root';

export const Route = createFileRoute('/problems/$id')({
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useParams();
  useAuth();

  //TODO possible error
  return <ProblemPage problemId={parseInt(id)} />;
}

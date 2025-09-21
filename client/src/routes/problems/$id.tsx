import { createFileRoute } from '@tanstack/react-router';
import { ProblemPage } from '../../components/problem';

export const Route = createFileRoute('/problems/$id')({
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useParams();
  //TODO possible error
  return <ProblemPage problemId={parseInt(id)} />;
}

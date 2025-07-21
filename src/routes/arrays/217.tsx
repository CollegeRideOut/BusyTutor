import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/arrays/217')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/arrays/217"!</div>
}

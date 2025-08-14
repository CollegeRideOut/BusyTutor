import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/arrays/test')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/arrays/test"!</div>
}

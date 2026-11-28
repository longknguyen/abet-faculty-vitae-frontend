import { createBrowserRouter, RouterProvider } from 'react-router-dom'

import { HomePage } from '../features/home/pages/HomePage'
import { ReviewCyclesPage } from '../features/review-cycles/pages/ReviewCyclesPage'
import { WorkspaceLayout } from './WorkspaceLayout'
import { VitaeBuilderPage } from '../features/vitae-builder/pages/VitaeBuilderPage'

const router = createBrowserRouter([
  {
    path: '/',
    element: <WorkspaceLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'review-cycles',
        element: <ReviewCyclesPage />,
      },
      {
        path: 'build-vitae',
        element: <VitaeBuilderPage />,
      },
    ],
  },
])

export function App() {
  return <RouterProvider router={router} />
}

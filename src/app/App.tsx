import { createBrowserRouter, RouterProvider } from 'react-router-dom'

import { HomePage } from '../features/home/pages/HomePage'
import { ReviewCyclesPage } from '../features/review-cycles/pages/ReviewCyclesPage'
import { WorkspaceLayout } from './WorkspaceLayout'

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
    ],
  },
])

export function App() {
  return <RouterProvider router={router} />
}

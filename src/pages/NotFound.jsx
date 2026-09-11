import { Link } from 'react-router-dom'
import { PageHeader } from '../components/common/PageHeader'
import './NotFound.css'

export default function NotFound() {
  return (
    <div className="not-found">
      <PageHeader title="Page not found" description="There's nothing here — the page you're looking for doesn't exist." />
      <Link className="not-found__link" to="/">
        Back to dashboard
      </Link>
    </div>
  )
}

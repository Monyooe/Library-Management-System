
import Dashboard from '../components/Dashboard'

function DashboardPage({ books, users, transactions }) {
  return (
    <Dashboard
      books={books}
      users={users}
      transactions={transactions}
    />
  )
}

export default DashboardPage

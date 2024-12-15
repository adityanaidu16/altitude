import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function Header() {
  return (
    <header className="border-b">
      <div className="container flex items-center justify-between h-16 px-4">
        <Link href="/dashboard" className="font-bold text-xl">Altitude</Link>
        <nav className="flex items-center gap-4">
          <Button variant="ghost" asChild>
            <Link href="/dashboard">Dashboard</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/messages">Messages</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/profile">Profile</Link>
          </Button>
        </nav>
      </div>
    </header>
  )
}


import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function Sidebar({ className }: { className?: string }) {
  return (
    <aside className={className}>
      <Card>
        <CardHeader>
          <CardTitle>Quick Stats</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="text-2xl font-bold">23</div>
            <div className="text-sm text-muted-foreground">Total Leads</div>
          </div>
          <div>
            <div className="text-2xl font-bold">12</div>
            <div className="text-sm text-muted-foreground">Messages Sent</div>
          </div>
          <div>
            <div className="text-2xl font-bold">5</div>
            <div className="text-sm text-muted-foreground">Responses Received</div>
          </div>
        </CardContent>
      </Card>
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button variant="outline" className="w-full justify-start">
            All Leads
          </Button>
          <Button variant="outline" className="w-full justify-start">
            Pending Outreach
          </Button>
          <Button variant="outline" className="w-full justify-start">
            Awaiting Response
          </Button>
          <Button variant="outline" className="w-full justify-start">
            Responded
          </Button>
        </CardContent>
      </Card>
    </aside>
  )
}


import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

const leads = [
  { id: 1, name: 'John Doe', company: 'Tech Corp', position: 'Software Engineer Intern', status: 'Pending' },
  { id: 2, name: 'Jane Smith', company: 'Innovate Inc', position: 'Data Science Intern', status: 'Messaged' },
  { id: 3, name: 'Bob Johnson', company: 'Future Systems', position: 'Product Management Intern', status: 'Responded' },
]

export default function LeadsList() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Company</TableHead>
          <TableHead>Position</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {leads.map((lead) => (
          <TableRow key={lead.id}>
            <TableCell>{lead.name}</TableCell>
            <TableCell>{lead.company}</TableCell>
            <TableCell>{lead.position}</TableCell>
            <TableCell>
              <Badge variant={lead.status === 'Responded' ? 'secondary' : lead.status === 'Messaged' ? 'outline' : 'default'}>
                {lead.status}
              </Badge>
            </TableCell>
            <TableCell>
              <Button variant="outline" size="sm">Message</Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}


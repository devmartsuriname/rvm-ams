import { Card, CardBody, CardHeader, CardTitle } from 'react-bootstrap'
import ReactApexChart from 'react-apexcharts'
import type { ApexOptions } from 'apexcharts'
import IconifyIcon from '@/components/wrapper/IconifyIcon'
import type { StatusCount } from '@/services/dashboardService'

type TaskStatusChartProps = {
  data: StatusCount[]
}

// Status label mapping for display
const STATUS_LABELS: Record<string, string> = {
  todo: 'To Do',
  in_progress: 'In Progress',
  blocked: 'Blocked',
  done: 'Done',
  cancelled: 'Cancelled'
}

// Darkone color palette
const CHART_COLORS = ['#6658dd', '#1abc9c', '#f7b84b', '#00b19d', '#f1556c']

export function TaskStatusChart({ data }: TaskStatusChartProps) {
  const hasData = data.length > 0

  const labels = data.map(d => STATUS_LABELS[d.status] ?? d.status)
  const series = data.map(d => d.count)

  const chartOpts: ApexOptions = {
    chart: {
      height: 320,
      type: 'donut',
    },
    colors: CHART_COLORS.slice(0, data.length),
    labels,
    series,
    legend: {
      show: true,
      position: 'bottom',
    },
    responsive: [
      {
        breakpoint: 600,
        options: {
          chart: { height: 240 },
          legend: { position: 'bottom' }
        }
      }
    ]
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle as="h4">Tasks by Status</CardTitle>
      </CardHeader>
      <CardBody>
        {hasData ? (
          <div dir="ltr">
            <ReactApexChart 
              height={320} 
              options={chartOpts} 
              series={series} 
              type="donut" 
            />
          </div>
        ) : (
          <div className="text-center text-muted py-4">
            <IconifyIcon icon="bx:bar-chart-alt-2" style={{ fontSize: '2rem' }} />
            <p className="mb-0 mt-2">No task data available</p>
          </div>
        )}
      </CardBody>
    </Card>
  )
}

import { Card, CardBody, CardHeader, CardTitle } from 'react-bootstrap'
import ReactApexChart from 'react-apexcharts'
import type { ApexOptions } from 'apexcharts'
import IconifyIcon from '@/components/wrapper/IconifyIcon'
import type { StatusCount } from '@/services/dashboardService'

type DossierStatusChartProps = {
  data: StatusCount[]
}

// Status label mapping for display
const STATUS_LABELS: Record<string, string> = {
  draft: 'Draft',
  registered: 'Registered',
  in_preparation: 'In Preparation',
  scheduled: 'Scheduled',
  decided: 'Decided',
  archived: 'Archived',
  cancelled: 'Cancelled'
}

// Darkone color palette
const CHART_COLORS = ['#6658dd', '#1abc9c', '#4a81d4', '#f7b84b', '#00b19d', '#6c757d', '#f1556c']

export function DossierStatusChart({ data }: DossierStatusChartProps) {
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
        <CardTitle as="h4">Dossiers by Status</CardTitle>
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
            <p className="mb-0 mt-2">No dossier data available</p>
          </div>
        )}
      </CardBody>
    </Card>
  )
}

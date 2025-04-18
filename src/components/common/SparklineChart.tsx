'use client'

import { Line } from 'react-chartjs-2'
import { Chart, CategoryScale, LinearScale, PointElement, LineElement, Tooltip } from 'chart.js'

Chart.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip)

const SparklineChart = ({ data }: { data: number[] }) => {
  const chartData = {
    labels: data.map((_, index) => index + 1),
    datasets: [
      {
        data: data,
        borderColor: '#f7931a', // orange tone like your image
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 0,
        fill: true,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        backgroundColor: (context: any) => {
          const ctx = context.chart.ctx
          const gradient = ctx.createLinearGradient(0, 0, 0, 23)
          gradient.addColorStop(0, 'rgba(247, 147, 26, 0.2)')
          gradient.addColorStop(1, 'rgba(247, 147, 26, 0)')
          return gradient
        },
        tension: 0.3
      }
    ]
  }

  const options = {
    responsive: false,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false }
    },
    scales: {
      x: { display: false },
      y: { display: false }
    },
    elements: {
      line: {
        borderCapStyle: 'round' as CanvasLineCap
      }
    }
  }

  return (
    <div style={{ width: '58px', height: '23px' }}>
      <Line data={chartData} options={options} width={58} height={23} />
    </div>
  )
}

export default SparklineChart

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js'

export default defineNuxtPlugin(() => {
  ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    RadialLinearScale,
    Filler,
    Tooltip,
    Legend,
  )

  // Global defaults
  ChartJS.defaults.font.family = "'Plus Jakarta Sans', sans-serif"
  ChartJS.defaults.color = '#6366F1'
  ChartJS.defaults.plugins.legend.labels.usePointStyle = false
  ChartJS.defaults.plugins.legend.labels.boxWidth = 14
  ChartJS.defaults.plugins.legend.labels.boxHeight = 14
  ChartJS.defaults.plugins.legend.labels.padding = 16
  ChartJS.defaults.plugins.tooltip.backgroundColor = 'rgba(30, 27, 75, 0.9)'
  ChartJS.defaults.plugins.tooltip.cornerRadius = 10
  ChartJS.defaults.plugins.tooltip.padding = 12
  ChartJS.defaults.elements.line.tension = 0.4
  ChartJS.defaults.elements.point.radius = 3
  ChartJS.defaults.elements.point.hoverRadius = 6
  ChartJS.defaults.elements.bar.borderRadius = 6
  ChartJS.defaults.scale.grid = { ...ChartJS.defaults.scale.grid, color: 'rgba(99, 102, 241, 0.08)' }
})

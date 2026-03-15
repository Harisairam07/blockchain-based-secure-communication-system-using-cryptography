import { useMemo } from 'react';
import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { animated, useSpring } from '@react-spring/web';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler);

export default function LiveMetricsPulseChart({ value = 0 }) {
  const pulse = useSpring({
    from: { boxShadow: '0 0 0 rgba(34,197,94,0.15)' },
    to: async (next) => {
      // Repeating glow pulse for SOC live-feed effect.
      while (true) {
        await next({ boxShadow: '0 0 30px rgba(34,197,94,0.28)' });
        await next({ boxShadow: '0 0 0 rgba(34,197,94,0.12)' });
      }
    },
    config: { duration: 1200 }
  });

  const chartData = useMemo(
    () => ({
      labels: ['-50s', '-40s', '-30s', '-20s', '-10s', 'now'],
      datasets: [
        {
          label: 'Encryption Health',
          data: [Math.max(45, value - 12), Math.max(52, value - 8), Math.max(60, value - 4), Math.max(65, value - 2), Math.max(72, value - 1), Math.max(76, value)],
          borderColor: '#22c55e',
          backgroundColor: 'rgba(34,197,94,0.15)',
          fill: true,
          tension: 0.35,
          pointRadius: 2
        }
      ]
    }),
    [value]
  );

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      x: {
        ticks: { color: '#94a3b8' },
        grid: { color: 'rgba(51,65,85,0.35)' }
      },
      y: {
        ticks: { color: '#94a3b8' },
        grid: { color: 'rgba(51,65,85,0.35)' },
        min: 40,
        max: 100
      }
    }
  };

  return (
    <animated.div style={pulse} className="rounded-xl border border-cyber-border bg-slate-950/45 p-3">
      <p className="mb-2 text-xs uppercase tracking-wide text-cyber-muted">Live Encryption Pulse</p>
      <div className="h-44">
        <Line data={chartData} options={chartOptions} />
      </div>
    </animated.div>
  );
}

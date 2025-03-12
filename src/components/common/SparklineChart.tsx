import { Line } from "react-chartjs-2";
import { Chart, CategoryScale, LinearScale, PointElement, LineElement, Tooltip } from "chart.js";

Chart.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip);

const SparklineChart = ({ data }: { data: number[] }) => {
    const chartData = {
        labels: data.map((_, index) => index + 1), 
        datasets: [
            {
                data: data,
                borderColor: "#2196f3", 
                borderWidth: 2,
                pointRadius: 0, 
                pointHoverRadius: 0,
                fill: false,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } }, 
        scales: {
            x: { display: false }, 
            y: { display: false },
        },
    };

    return <Line data={chartData} options={options} />;
};

export default SparklineChart;

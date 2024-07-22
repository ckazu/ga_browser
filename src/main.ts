import { GeneticAlgorithm } from './GeneticAlgorithm';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

let fitnessChart: Chart | null = null;

const geneticAlgorithm = new GeneticAlgorithm();
(window as any).geneticAlgorithm = geneticAlgorithm;

const initializeChart = () => {
  const canvas = document.getElementById('fitnessChart') as HTMLCanvasElement;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error("Failed to get canvas context");
  }

  if (fitnessChart) {
    fitnessChart.destroy();
  }

  fitnessChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: [] as string[],
      datasets: [{
        label: '適応度',
        data: [] as number[],
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        fill: true
      }]
    },
    options: {
      animation: false,
      responsive: true,
      scales: {
        x: {
          title: {
            display: true,
            text: '世代'
          }
        },
        y: {
          title: {
            display: true,
            text: '適応度'
          }
        }
      }
    }
  });
};

geneticAlgorithm.onUpdate = (generationCount: number, bestFitness: number) => {
  if (fitnessChart && fitnessChart.data.labels && fitnessChart.data.datasets[0].data) {
    fitnessChart.data.labels.push(generationCount.toString());
    fitnessChart.data.datasets[0].data.push(bestFitness);
    fitnessChart.update();
  }
  const output = document.getElementById('output') as HTMLElement;
  output.innerText = `世代: ${generationCount}, 適応度: ${bestFitness}`;
};

const startAlgorithm = () => {
  initializeChart();
  geneticAlgorithm.start();
};
const stopAlgorithm = () => {
  geneticAlgorithm.stop();
};
(window as any).startAlgorithm = startAlgorithm;
(window as any).stopAlgorithm = stopAlgorithm;

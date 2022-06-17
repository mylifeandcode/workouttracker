import { BubbleDataPoint, ChartData, ChartDataset, ChartTypeRegistry, ScatterDataPoint } from "chart.js";

export class AnalyticsChartData implements ChartData {
  labels?: unknown[] | undefined;
  datasets: ChartDataset<keyof ChartTypeRegistry, (number | ScatterDataPoint | BubbleDataPoint | null)[]>[];

  constructor() {
    this.labels = [];
    this.datasets = [];
  }
}
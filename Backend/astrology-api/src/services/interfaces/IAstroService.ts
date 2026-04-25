import { VedicParams } from "../../types/vedic";
import { ChartType } from "../../config/vedicAstroConfig";

export interface IAstroService {
  fetchManglikDosh(params: VedicParams): Promise<Record<string, unknown>>;
  fetchOtherdosha(params: VedicParams, doshaType: string): Promise<Record<string, unknown>>;
  fetchBirthChart(params: VedicParams): Promise<Record<string, unknown>>;
  fetchChartByType(params: VedicParams, chartType: ChartType): Promise<Record<string, unknown>>;
}

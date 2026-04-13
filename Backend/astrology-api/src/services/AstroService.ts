import axios, { AxiosInstance } from "axios";
import { vedicAstroConfig } from "../config/vedicAstroConfig";
import { BaseService } from "../core/BaseService";
import { VedicParams } from "../types/vedic";
import { IAstroService } from "./interfaces/IAstroService";

// Open/Closed: DoshaType to endpoint mapping - easy to extend without modifying code
const DOSHA_ENDPOINT_MAP: Record<string, string> = {
  manglik: vedicAstroConfig.endpoints.manglikDosh,
  kalsarp: vedicAstroConfig.endpoints.kalsarpDosh,
  sadesati: vedicAstroConfig.endpoints.sadesati,
  pitradosh: vedicAstroConfig.endpoints.pitradosh,
  nadi: vedicAstroConfig.endpoints.nadiDosh,
};

export class AstroService extends BaseService implements IAstroService {
  protected readonly serviceName = "AstroService";
  private readonly client: AxiosInstance;

  constructor() {
    super();
    this.client = axios.create({
      baseURL: vedicAstroConfig.baseURL,
      timeout: vedicAstroConfig.timeout,
    });
  }

  // Single Responsibility: Only makes API calls
  private async callApi(
    endpoint: string,
    params: Record<string, unknown>
  ): Promise<Record<string, unknown>> {
    const response = await this.client.get(endpoint, {
      params: {
        ...params,
        api_key: vedicAstroConfig.apiKey,
        lang: "en",
      },
    });
    return response.data as Record<string, unknown>;
  }

  // Single Responsibility: One method per dosha, follow Open/Closed
  public fetchManglikDosh(params: VedicParams): Promise<Record<string, unknown>> {
    return this.callApi(DOSHA_ENDPOINT_MAP["manglik"], { ...params });
  }

  // Open/Closed: No switch needed - just add to map in one place
  public fetchOtherdosha(params: VedicParams, doshaType: string): Promise<Record<string, unknown>> {
    const endpoint = DOSHA_ENDPOINT_MAP[doshaType];
    if (!endpoint) {
      throw new Error(`Invalid dosha type: ${doshaType}. Valid types: ${Object.keys(DOSHA_ENDPOINT_MAP).join(", ")}`);
    }
    return this.callApi(endpoint, { ...params });
  }

  public fetchBirthChart(params: VedicParams): Promise<Record<string, unknown>> {
    return this.callApi(vedicAstroConfig.endpoints.birthChart, { ...params });
  }
}

export const astroService = new AstroService();

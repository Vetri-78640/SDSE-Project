import { BaseService } from "../core/BaseService";

// Single Responsibility: Each function does one thing
export class BirthChartService extends BaseService {
  protected readonly serviceName = "BirthChartService";

  // Responsibility 1: Date formatting
  public formatDate(date: Date | string): string {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  }

  // Responsibility 2: Time validation
  public isValidTimeFormat(time: string): boolean {
    return /^([01]\d|2[0-3]):([0-5]\d)$/.test(time);
  }

  // Responsibility 3: Time conversion
  public convertTo24Hour(time12h: string): string {
    const [time, modifier] = time12h.split(" ");
    let [hours, minutes] = time.split(":");
    if (hours === "12") hours = "00";
    if ((modifier || "").toUpperCase() === "PM") {
      hours = String(parseInt(hours, 10) + 12);
    }
    return `${hours.padStart(2, "0")}:${minutes}`;
  }
}

export const birthChartService = new BirthChartService();

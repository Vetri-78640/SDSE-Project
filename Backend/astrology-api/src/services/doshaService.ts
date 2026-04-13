import { BaseService } from "../core/BaseService";

// Single Responsibility: Each function does one thing
export class DoshaService extends BaseService {
  protected readonly serviceName = "DoshaService";

  // Responsibility 1: Date formatting
  public formatDate(date: Date | string): string {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  }

  // Responsibility 2: Severity calculation
  public calculateSeverity(apiResponse: Record<string, unknown>): "low" | "medium" | "high" {
    const isPresent = Boolean(apiResponse.is_present ?? apiResponse.present);
    if (!isPresent) return "low";

    const severity = String(apiResponse.severity || "").toLowerCase();
    if (severity === "low" || severity === "medium" || severity === "high") {
      return severity as "low" | "medium" | "high";
    }

    const percentage = Number(apiResponse.percentage);
    if (!Number.isNaN(percentage)) {
      if (percentage > 70) return "high";
      if (percentage > 40) return "medium";
      return "low";
    }

    return "medium";
  }

  // Responsibility 3: Report formatting for API response
  public formatReport(report: {
    _id: unknown;
    doshaType: string;
    isPresent: boolean;
    severity: string;
    reportData?: Record<string, unknown>;
    remedies?: string[];
    cachedAt?: Date;
    profileId?: { personalInfo?: { name?: string; dateOfBirth?: Date } };
  }): Record<string, unknown> {
    return {
      id: report._id,
      doshaType: report.doshaType,
      isPresent: report.isPresent,
      severity: report.severity,
      summary: report.reportData?.summary || "No summary available",
      remedies: report.remedies || [],
      cachedAt: report.cachedAt,
      profile: report.profileId
        ? {
            name: report.profileId.personalInfo?.name,
            dateOfBirth: report.profileId.personalInfo?.dateOfBirth,
          }
        : null,
    };
  }
}

export const doshaService = new DoshaService();

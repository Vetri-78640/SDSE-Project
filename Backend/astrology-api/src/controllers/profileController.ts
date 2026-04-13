import { Request, Response } from "express";
import { BaseController } from "../core/BaseController";
import { BirthChartModel } from "../models/BirthChartModel";
import { DoshaReportModel } from "../models/DoshaReportModel";
import { profileService } from "../services/profileService";

class ProfileController extends BaseController {
  private canAccessUser(reqUserId: string, reqUserRole: string, targetUserId: string): boolean {
    return reqUserRole === "admin" || String(reqUserId) === String(targetUserId);
  }

  public createProfile = this.asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?._id;
    if (!userId) return this.fail(res, 401, "Unauthorized");

    const existingProfile = await profileService.getProfileByUserId(userId);
    if (existingProfile) return this.fail(res, 409, "Profile already exists. Use update endpoint.");

    const profile = await profileService.createProfile({
      userId: userId as any,
      personalInfo: {
        name: req.body.name,
        gender: req.body.gender,
        dateOfBirth: req.body.dateOfBirth,
        timeOfBirth: req.body.timeOfBirth,
        placeOfBirth: {
          city: req.body.city,
          state: req.body.state,
          country: req.body.country,
          coordinates: { latitude: req.body.latitude, longitude: req.body.longitude },
        },
      },
      timezone: req.body.timezone || "+5.5",
    });

    return this.created(res, profile, "Profile created successfully");
  });

  public getProfile = this.asyncHandler(async (req: Request, res: Response) => {
    const reqUser = req.user;
    if (!reqUser) return this.fail(res, 401, "Unauthorized");

    const targetUserId = String(req.params.userId || reqUser._id);
    if (!this.canAccessUser(reqUser._id, reqUser.role, targetUserId)) {
      return this.fail(res, 403, "Insufficient access");
    }

    const profile = await profileService.getProfileByUserId(targetUserId);
    if (!profile) return this.fail(res, 404, "Profile not found");

    return this.ok(res, profile);
  });

  public updateProfile = this.asyncHandler(async (req: Request, res: Response) => {
    const reqUser = req.user;
    if (!reqUser) return this.fail(res, 401, "Unauthorized");

    const targetUserId = String(req.params.userId || reqUser._id);
    if (!this.canAccessUser(reqUser._id, reqUser.role, targetUserId)) {
      return this.fail(res, 403, "Insufficient access");
    }

    const profile = await profileService.getProfileByUserId(targetUserId);
    if (!profile) return this.fail(res, 404, "Profile not found");

    await profileService.updateProfile(profile, req.body);
    return this.ok(res, profile, "Profile updated successfully");
  });

  public deleteProfile = this.asyncHandler(async (req: Request, res: Response) => {
    const reqUser = req.user;
    if (!reqUser) return this.fail(res, 401, "Unauthorized");

    const targetUserId = String(req.params.userId || reqUser._id);
    if (!this.canAccessUser(reqUser._id, reqUser.role, targetUserId)) {
      return this.fail(res, 403, "Insufficient access");
    }

    const profile = await profileService.getProfileByUserId(targetUserId);
    if (!profile) return this.fail(res, 404, "Profile not found");

    await profileService.deleteProfile(profile);

    await BirthChartModel.updateMany({ profileId: profile._id }, { isDeleted: true });
    await DoshaReportModel.deleteMany({ profileId: profile._id });

    return this.ok(res, null, "Profile deleted successfully");
  });
}

export const profileController = new ProfileController();

import { BaseService } from "../core/BaseService";
import { IUserProfile, UserProfileModel } from "../models/UserProfileModel";

// Single Responsibility: Delegate directly to Mongoose
export class ProfileService extends BaseService {
  protected readonly serviceName = "ProfileService";

  public async getProfileByUserId(userId: string): Promise<IUserProfile | null> {
    return UserProfileModel.findOne({ userId, isDeleted: false });
  }

  public async createProfile(profileData: Partial<IUserProfile>): Promise<IUserProfile> {
    return UserProfileModel.create(profileData);
  }

  // Simplified: Use Mongoose save() directly - no manual field mapping
  public async updateProfile(profile: IUserProfile, updates: Record<string, unknown>): Promise<IUserProfile> {
    // Apply updates directly to the document
    Object.assign(profile, updates);
    return profile.save();
  }

  public async deleteProfile(profile: IUserProfile): Promise<IUserProfile> {
    profile.isDeleted = true;
    profile.deletedAt = new Date();
    return profile.save();
  }
}

export const profileService = new ProfileService();

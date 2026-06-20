import { LocalStorageWaterLogRepository } from '@/lib/repositories/LocalStorageWaterLogRepository';
import { WaterService } from '@/lib/services/waterService';

// Singleton pattern — swap this when adding cloud sync
const repo = new LocalStorageWaterLogRepository();
export const waterService = new WaterService(repo);

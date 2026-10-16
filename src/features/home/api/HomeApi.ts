import type { HomeData } from '../model/homeSchemas'

export interface HomeApi {
  loadHome(signal?: AbortSignal): Promise<HomeData>
  uploadCv(facultyCycleRecordId: string, file: File, signal?: AbortSignal): Promise<HomeData>
  verifyFacultyRecord(
    facultyCycleRecordId: string,
    version: number,
    signal?: AbortSignal,
  ): Promise<HomeData>
}

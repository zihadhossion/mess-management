import { post as httpPost } from "~/services/httpMethods/post";
import { patch } from "~/services/httpMethods/patch";
import type { CreateMessDto, JoinMessDto } from "~/types/mess.d";

export async function createMessRequest(dto: CreateMessDto): Promise<void> {
  await httpPost("/messes", dto);
}

export async function joinMess(dto: JoinMessDto): Promise<void> {
  await httpPost(`/messes/${dto.messId}/join-requests`);
}

export async function updateMessSettings(
  messId: string,
  dto: Partial<CreateMessDto>,
): Promise<void> {
  await patch(`/messes/${messId}`, dto);
}

export async function approveJoinRequest(
  messId: string,
  requestId: string,
): Promise<void> {
  await httpPost(`/messes/${messId}/join-requests/${requestId}/approve`);
}

export async function rejectJoinRequest(
  messId: string,
  requestId: string,
): Promise<void> {
  await httpPost(`/messes/${messId}/join-requests/${requestId}/reject`);
}

export async function submitDeletionRequest(
  messId: string,
  reason: string,
): Promise<void> {
  await httpPost(`/messes/${messId}/deletion-request`, { reason });
}

export async function deactivateMess(messId: string): Promise<void> {
  await httpPost(`/messes/${messId}/deactivate`);
}

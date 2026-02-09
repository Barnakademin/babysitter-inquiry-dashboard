import { getApiBaseUrlStatic } from "@/utils/apiConfig";

export type HistoryItem = {
  id: number;
  client_id: number;
  sitter_id: number;
  sitter_name: string;
  client_name?: string;
  stage: string;
  status_client: string;
  status_sitter: string;
  date: string;
  date_client: string;
  asked_client: string;
  reminder: string;
  meeting: string;
  sitter_stage_two: string;
};

export type ConnectionItem = {
  id?: number;
  client_id: number;
  sitter_id: number;
  connecting?: string;
  client_date?: string;
  stop_date?: string;
};

export const fetchHistory = async (): Promise<HistoryItem[]> => {
  const API_BASE_URL = getApiBaseUrlStatic();
  const response = await fetch(`${API_BASE_URL}/get-history`);
  if (!response.ok) {
    throw new Error('Failed to fetch history');
  }
  return response.json();
};

export const fetchConnections = async (): Promise<ConnectionItem[]> => {
  const API_BASE_URL = getApiBaseUrlStatic();
  const response = await fetch(`${API_BASE_URL}/connection`);
  if (!response.ok) {
    throw new Error('Failed to fetch connections');
  }
  return response.json();
};

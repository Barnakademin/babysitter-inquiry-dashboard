import { getApiBaseUrlStatic, getApiActionUrlStatic } from "@/utils/apiConfig";

export interface ClientInquiry {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  service: 'babysitting' | 'nanny';
  languages: string[];
  needHelpWith: string;
  howOften: string;
  numberOfKids: number;
  formLanguage: 'sv' | 'en';
  promoCode: string | null;
  comment: string;
  stage: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
  stageDate: Date;
  createdAt: Date;
  nannyLanguagePreference: 'swedish-speaking' | 'bilingual';
  everReachedStage7?: boolean;
  firstStage7Date?: Date;
}

/**
 * Получает базовый URL для API запросов
 */
function getApiBaseUrl(): string {
  return getApiBaseUrlStatic();
}

/** Парсит datetime из API (MySQL "Y-m-d H:i:s") в формат, корректно обрабатываемый JS по локальному времени */
function parseDateTime(value: string): string {
  if (!value) return value;
  return value.replace(' ', 'T');
}

/**
 * Загружает данные клиентов из API /json/clients-full
 */
export const fetchClientsFull = async (): Promise<ClientInquiry[]> => {
  try {
    const API_BASE_URL = getApiBaseUrl();
    const url = `${API_BASE_URL}/clients-full`;

    const response = await fetch(url, {
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch clients: ${response.statusText}`);
    }

    const data = await response.json();

    if (!Array.isArray(data)) {
      console.warn('API returned non-array data:', data);
      return [];
    }

    return data.map((client: any) => {
      const languages = Array.isArray(client.language) 
        ? client.language.map((lang: any) => lang.name || '').filter(Boolean)
        : [];

      const helpsArray = Array.isArray(client.helps) ? client.helps : [];
      const helpTitles: string[] = [];
      helpsArray.forEach((help: any) => {
        if (typeof help === 'object' && help !== null) {
          if (help.title) {
            helpTitles.push(help.title);
          } else if (Array.isArray(help) && help.length > 0 && help[0]?.title) {
            helpTitles.push(help[0].title);
          }
        }
      });

      const stripHtml = (html: string): string => {
        if (!html) return '';
        const tmp = document.createElement('DIV');
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || '';
      };

      return {
        id: String(client.client_id || client.id || ''),
        name: client.client_name || client.name || '',
        email: client.client_email || client.email || '',
        phone: client.client_phone || client.phone || '',
        address: client.client_address || client.address || '',
        city: client.client_location || client.city || '',
        service: client.client_service === 0 ? 'nanny' : 'babysitting',
        languages: languages,
        needHelpWith: helpTitles.join(', '),
        howOften: client.schedule?.title || '',
        numberOfKids: Array.isArray(client.children) ? client.children.length : 0,
        formLanguage: client.client_client_lang === 1 ? 'en' : 'sv',
        promoCode: client.promo_code || null,
        comment: stripHtml(client.client_form_comment || client.client_notes || ''),
        stage: Number(
          client.client_stage_ui !== undefined && client.client_stage_ui !== null
            ? client.client_stage_ui
            : (client.client_stage != null ? (client.client_stage as number) - 1 : 0)
        ) as 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9,
        stageDate: client.client_added_stage && client.client_added_stage !== '0000-00-00' 
          ? new Date(client.client_added_stage) 
          : (client.client_added ? new Date(parseDateTime(client.client_added)) : new Date()),
        createdAt: client.client_added && client.client_added !== '0000-00-00'
          ? new Date(parseDateTime(client.client_added))
          : new Date(),
        nannyLanguagePreference: 'swedish-speaking',
        everReachedStage7: client.ever_reached_stage_7 === true || client.ever_reached_stage_7 === 1 ? true : undefined,
        firstStage7Date: client.first_stage_7_date && client.first_stage_7_date !== '0000-00-00' ? new Date(client.first_stage_7_date) : undefined,
      };
    });
  } catch (error) {
    console.error("Error fetching clients data:", error);
    throw error;
  }
};

/**
 * Удаляет клиента через API /react/delete-client
 */
export const deleteClient = async (clientId: string): Promise<void> => {
  try {
    const API_BASE_URL = getApiActionUrlStatic();
    const url = `${API_BASE_URL}/react/delete-client?id=${clientId}`;

    const response = await fetch(url, {
      method: 'GET',
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Failed to delete client: ${response.statusText}`);
    }
  } catch (error) {
    console.error("Error deleting client:", error);
    throw error;
  }
};

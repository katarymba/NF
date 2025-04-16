// ais/ais-frontend/src/api/reports.ts

import axios from 'axios';

const BASE_URL = 'http://localhost:8080/ais';

export interface ReportPeriod {
  startDate: string;
  endDate: string;
}

export interface ReportData {
  id?: string;
  name: string;
  type: string;
  source: string;
  status?: 'draft' | 'sent' | 'printed';
  createdAt?: string;
  period?: ReportPeriod;
  organization?: string;
  department?: string;
  responsible?: string;
  format?: 'pdf' | 'excel' | 'word';
  includeTotals?: boolean;
  includeChart?: boolean;
  includeDetails?: boolean;
}

export interface ReportTemplate {
  id: string;
  name: string;
  type: string;
  description: string;
  default?: boolean;
}

// Получение всех отчетов
export const getAllReports = async (token: string) => {
  try {
    const response = await axios.get(`${BASE_URL}/reports`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching reports:', error);
    throw error;
  }
};

// Получение шаблонов отчетов
export const getReportTemplates = async (token: string) => {
  try {
    const response = await axios.get(`${BASE_URL}/reports/templates`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching report templates:', error);
    throw error;
  }
};

// Создание нового отчета
export const createReport = async (reportData: ReportData, token: string) => {
  try {
    const response = await axios.post(`${BASE_URL}/reports`, reportData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error creating report:', error);
    throw error;
  }
};

// Получение данных отчета по ID
export const getReportById = async (reportId: string, token: string) => {
  try {
    const response = await axios.get(`${BASE_URL}/reports/${reportId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching report:', error);
    throw error;
  }
};

// Обновление статуса отчета
export const updateReportStatus = async (reportId: string, status: string, token: string) => {
  try {
    const response = await axios.patch(
      `${BASE_URL}/reports/${reportId}`,
      { status },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error updating report status:', error);
    throw error;
  }
};

// Отправка отчета (например, по email)
export const sendReport = async (
  reportId: string, 
  emailData: { 
    recipients: string[];
    subject?: string;
    message?: string;
    sendCopy?: boolean;
  }, 
  token: string
) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/reports/${reportId}/send`,
      emailData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error sending report:', error);
    throw error;
  }
};

// Генерация печатной формы отчета
export const generatePrintableReport = async (
  reportId: string, 
  options: { 
    paperSize?: 'A4' | 'A3' | 'Letter';
    orientation?: 'portrait' | 'landscape';
    margins?: {
      top: number;
      right: number;
      bottom: number;
      left: number;
    };
  } | undefined, 
  token: string
) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/reports/${reportId}/print`,
      options || {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        responseType: 'blob' // Получаем файл как blob
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error generating printable report:', error);
    throw error;
  }
};

// Скачивание отчета в выбранном формате
export const downloadReport = async (
  reportId: string, 
  format: 'pdf' | 'excel' | 'word', 
  token: string
) => {
  try {
    const response = await axios.get(
      `${BASE_URL}/reports/${reportId}/download?format=${format}`, 
      {
        headers: {
          Authorization: `Bearer ${token}`
        },
        responseType: 'blob'
      }
    );
    
    // Создаем временную ссылку для скачивания файла
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `report-${reportId}.${format}`);
    document.body.appendChild(link);
    link.click();
    
    // Очистка
    link.parentNode?.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    return true;
  } catch (error) {
    console.error('Error downloading report:', error);
    throw error;
  }
};

// Удаление отчета
export const deleteReport = async (reportId: string, token: string) => {
  try {
    const response = await axios.delete(`${BASE_URL}/reports/${reportId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting report:', error);
    throw error;
  }
};

// Получение списка организаций для отчетов
export const getOrganizations = async (token: string) => {
  try {
    const response = await axios.get(`${BASE_URL}/organizations`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching organizations:', error);
    throw error;
  }
};

// Получение списка подразделений
export const getDepartments = async (token: string) => {
  try {
    const response = await axios.get(`${BASE_URL}/departments`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching departments:', error);
    throw error;
  }
};

// Получение списка ответственных лиц
export const getResponsiblePersons = async (token: string) => {
  try {
    const response = await axios.get(`${BASE_URL}/employees`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching responsible persons:', error);
    throw error;
  }
};
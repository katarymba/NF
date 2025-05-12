import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DocumentTextIcon, ArrowDownTrayIcon, EnvelopeIcon, PrinterIcon, MagnifyingGlassIcon, CalendarIcon } from '@heroicons/react/24/outline';
import { XMarkIcon } from '@heroicons/react/24/solid';
import '../styles/Reports.css';

interface Report {
  id: string;
  name: string;
  type: string;
  createdAt: string;
  status: 'draft' | 'sent' | 'printed';
  source: string;
  period?: {
    startDate: string;
    endDate: string;
  };
  organization?: string;
  department?: string;
  responsible?: string;
  format?: string;
  includeTotals?: boolean;
  includeChart?: boolean;
  includeDetails?: boolean;
}

interface ReportTemplate {
  id: string;
  name: string;
  type: string;
  description: string;
  default?: boolean;
}

// Demo data for offline development
const DEMO_REPORTS: Report[] = [
  {
    id: '1',
    name: 'Отчет по заказам за неделю',
    type: 'orders',
    createdAt: '2025-04-15T12:00:00',
    status: 'sent',
    source: 'orders',
    period: {
      startDate: '2025-04-08',
      endDate: '2025-04-15'
    },
    organization: 'ООО "СеверФиш"',
    format: 'pdf'
  },
  {
    id: '2',
    name: 'Аналитика продаж',
    type: 'analytics',
    createdAt: '2025-04-14T10:30:00',
    status: 'printed',
    source: 'analytics',
    period: {
      startDate: '2025-03-01',
      endDate: '2025-03-31'
    },
    organization: 'ИП Иванов И.И.',
    format: 'excel'
  },
  {
    id: '3',
    name: 'Отчет по платежам',
    type: 'payments',
    createdAt: '2025-04-13T15:45:00',
    status: 'draft',
    source: 'payments',
    period: {
      startDate: '2025-03-01',
      endDate: '2025-04-01'
    },
    organization: 'Рыбный дом',
    format: 'pdf'
  }
];

const DEMO_TEMPLATES: ReportTemplate[] = [
  { 
    id: '1', 
    name: 'Стандартный отчет по заказам', 
    type: 'orders', 
    description: 'Детальная информация по всем заказам за период',
    default: true
  },
  { 
    id: '2', 
    name: 'Реестр заказов', 
    type: 'orders', 
    description: 'Краткий реестр заказов с ключевой информацией'
  },
  { 
    id: '3', 
    name: 'Товарный отчет', 
    type: 'products', 
    description: 'Отчет по движению товаров'
  },
  { 
    id: '4', 
    name: 'Отчет по оплатам', 
    type: 'payments', 
    description: 'Список всех платежей с детализацией'
  },
  { 
    id: '5', 
    name: 'Анализ продаж по категориям', 
    type: 'analytics', 
    description: 'Детальный анализ продаж с разбивкой по категориям товаров'
  }
];

// Demo organization data
const DEMO_ORGANIZATIONS = ['ООО "СеверФиш"', 'ИП Иванов И.И.', 'Рыбный дом'];
const DEMO_DEPARTMENTS = ['Продажи', 'Закупки', 'Склад', 'Логистика', 'Бухгалтерия'];
const DEMO_RESPONSIBLE_PERSONS = ['Иванов И.И.', 'Петров П.П.', 'Сидоров С.С.', 'Смирнова А.А.'];

// Check if we're in development mode and should use mock data
const USE_MOCK_DATA = true; // Set to true to always use mock data, avoiding API calls

const Reports: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreatingReport, setIsCreatingReport] = useState(false);
  const [newReport, setNewReport] = useState({
    name: '',
    type: 'orders',
    source: 'manual',
    period: {
      startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
    },
    organization: '',
    department: '',
    responsible: '',
    format: 'pdf',
    includeTotals: true,
    includeChart: false,
    includeDetails: true,
  });
  const [activeTab, setActiveTab] = useState('all');
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [step, setStep] = useState(1);
  const [search, setSearch] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [formatMenuOpen, setFormatMenuOpen] = useState<string | null>(null);
  
  // Lists for dropdowns
  const [organizations, setOrganizations] = useState<string[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const [responsiblePersons, setResponsiblePersons] = useState<string[]>([]);

  // Fetch reports from API or use mock data
  useEffect(() => {
    const fetchReports = async () => {
      setIsLoading(true);
      try {
        if (USE_MOCK_DATA) {
          // Simulate network delay
          await new Promise(resolve => setTimeout(resolve, 500));
          setReports(DEMO_REPORTS);
          setError(null);
        } else {
          const response = await axios.get('/api/reports');
          setReports(response.data);
          setError(null);
        }
      } catch (err) {
        console.error("Failed to fetch reports:", err);
        setError("Не удалось загрузить отчеты. Используются демо-данные.");
        setReports(DEMO_REPORTS);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReports();
  }, []);

  // Fetch report templates
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        if (USE_MOCK_DATA) {
          // Simulate network delay
          await new Promise(resolve => setTimeout(resolve, 300));
          setTemplates(DEMO_TEMPLATES);
        } else {
          const response = await axios.get('/api/report-templates');
          setTemplates(response.data);
        }
      } catch (err) {
        console.error("Failed to fetch report templates:", err);
        setTemplates(DEMO_TEMPLATES);
      }
    };

    fetchTemplates();
  }, []);

  // Fetch organizations, departments and responsible persons
  useEffect(() => {
    const fetchOrganizationData = async () => {
      try {
        if (USE_MOCK_DATA) {
          // Simulate network delay
          await new Promise(resolve => setTimeout(resolve, 400));
          setOrganizations(DEMO_ORGANIZATIONS);
          setDepartments(DEMO_DEPARTMENTS);
          setResponsiblePersons(DEMO_RESPONSIBLE_PERSONS);
        } else {
          const orgResponse = await axios.get('/api/organizations');
          setOrganizations(orgResponse.data.map((org: any) => org.name));
          
          const deptResponse = await axios.get('/api/departments');
          setDepartments(deptResponse.data.map((dept: any) => dept.name));
          
          const personsResponse = await axios.get('/api/employees');
          setResponsiblePersons(personsResponse.data.map((person: any) => 
            `${person.lastName} ${person.firstName} ${person.middleName || ''}`.trim()
          ));
        }
      } catch (err) {
        console.error("Failed to fetch organization data:", err);
        setOrganizations(DEMO_ORGANIZATIONS);
        setDepartments(DEMO_DEPARTMENTS);
        setResponsiblePersons(DEMO_RESPONSIBLE_PERSONS);
      }
    };

    fetchOrganizationData();
  }, []);

  const handleCreateReport = async () => {
    setIsGenerating(true);
    
    try {
      // Simulate API response with a timeout
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const createdReport: Report = {
        id: Date.now().toString(),
        name: newReport.name,
        type: newReport.type,
        createdAt: new Date().toISOString(),
        status: 'draft',
        source: newReport.source,
        period: newReport.period,
        organization: newReport.organization,
        department: newReport.department,
        responsible: newReport.responsible,
        format: newReport.format,
        includeTotals: newReport.includeTotals,
        includeChart: newReport.includeChart,
        includeDetails: newReport.includeDetails
      };
      
      // Add the new report to the state
      setReports([createdReport, ...reports]);
      
      // Show success notification
      alert('Отчет успешно создан');
      resetForm();
    } catch (err) {
      console.error("Failed to create report:", err);
      alert('Ошибка при создании отчета. Пожалуйста, попробуйте снова.');
    } finally {
      setIsGenerating(false);
    }
  };

  const resetForm = () => {
    setIsCreatingReport(false);
    setStep(1);
    setSelectedTemplate('');
    setShowSettings(false);
    setNewReport({
      name: '',
      type: 'orders',
      source: 'manual',
      period: {
        startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
      },
      organization: '',
      department: '',
      responsible: '',
      format: 'pdf',
      includeTotals: true,
      includeChart: false,
      includeDetails: true,
    });
  };

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = templates.find(t => t.id === templateId);
    
    if (template) {
      setNewReport({
        ...newReport,
        name: template.name,
        type: template.type,
      });
      
      setStep(2);
    }
  };

  // Implement actual functionality for sending reports
  const handleSendReport = async (reportId: string) => {
    try {
      // Simulate API request
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update the report status in the local state
      setReports(reports.map(report => 
        report.id === reportId ? { ...report, status: 'sent' } : report
      ));
      
      alert('Отчет успешно отправлен');
    } catch (err) {
      console.error("Failed to send report:", err);
      alert('Ошибка при отправке отчета. Пожалуйста, попробуйте снова.');
    }
  };

  // Implement actual functionality for printing reports
  const handlePrintReport = async (reportId: string) => {
    try {
      // Simulate getting a printable version
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // In a real implementation, open the print dialog
      console.log(`Printing report ${reportId}`);
      
      // Update the report status
      setReports(reports.map(report => 
        report.id === reportId ? { ...report, status: 'printed' } : report
      ));
      
      // Create a printable version
      const report = reports.find(r => r.id === reportId);
      if (report) {
        const printContent = `
          <html>
          <head>
            <title>Печать отчета: ${report.name}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 30px; }
              h1 { font-size: 24px; margin-bottom: 20px; }
              h2 { font-size: 18px; margin-top: 20px; margin-bottom: 10px; }
              .info { margin-bottom: 5px; }
              .label { font-weight: bold; display: inline-block; width: 150px; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
              th { background-color: #f2f2f2; }
              @media print {
                button { display: none; }
              }
            </style>
          </head>
          <body>
            <h1>${report.name}</h1>
            <div class="info"><span class="label">Тип отчета:</span> ${
              report.type === 'orders' ? 'Заказы' :
              report.type === 'products' ? 'Товары' :
              report.type === 'payments' ? 'Платежи' : 'Аналитика'
            }</div>
            <div class="info"><span class="label">Период:</span> ${
              report.period ? `${new Date(report.period.startDate).toLocaleDateString('ru-RU')} - ${new Date(report.period.endDate).toLocaleDateString('ru-RU')}` : 'Не указан'
            }</div>
            <div class="info"><span class="label">Организация:</span> ${report.organization || 'Не указана'}</div>
            <div class="info"><span class="label">Создан:</span> ${new Date(report.createdAt).toLocaleString('ru-RU')}</div>
            
            <h2>Данные отчета</h2>
            <p>Здесь будут отображены данные отчета согласно выбранным параметрам.</p>
            
            <table>
              <thead>
                <tr>
                  <th>№</th>
                  <th>Наименование</th>
                  <th>Количество</th>
                  <th>Сумма</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>1</td>
                  <td>Товар 1</td>
                  <td>10</td>
                  <td>10 000 ₽</td>
                </tr>
                <tr>
                  <td>2</td>
                  <td>Товар 2</td>
                  <td>5</td>
                  <td>7 500 ₽</td>
                </tr>
                <tr>
                  <td>3</td>
                  <td>Товар 3</td>
                  <td>3</td>
                  <td>4 500 ₽</td>
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="2"><strong>Итого:</strong></td>
                  <td><strong>18</strong></td>
                  <td><strong>22 000 ₽</strong></td>
                </tr>
              </tfoot>
            </table>
            
            <button onclick="window.print()" style="margin-top: 20px; padding: 10px 20px;">Печать отчета</button>
          </body>
          </html>
        `;
        
        // Open print window
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          printWindow.document.write(printContent);
          printWindow.document.close();
          printWindow.focus();
          // Auto-trigger print after content is loaded
          setTimeout(() => {
            printWindow.print();
          }, 500);
        } else {
          alert('Пожалуйста, разрешите всплывающие окна для печати отчетов');
        }
      }
    } catch (err) {
      console.error("Failed to print report:", err);
      alert('Ошибка при печати отчета. Пожалуйста, попробуйте снова.');
    }
  };

  // Implement downloading reports in different formats
  const handleDownloadReport = async (reportId: string, format = 'pdf') => {
    try {
      // Simulate API request for download
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const report = reports.find(r => r.id === reportId);
      
      if (!report) {
        throw new Error('Report not found');
      }
      
      // Generate sample content based on format
      let content: string;
      let mimeType: string;
      let filename: string = `${report.name || 'Отчет'}_${new Date().toISOString().split('T')[0]}`;
      
      switch (format.toLowerCase()) {
        case 'pdf':
          // In a real implementation, generate a PDF or fetch from API
          // For demo, create a simple HTML that would be converted to PDF
          content = `
            <html>
              <body>
                <h1>${report.name}</h1>
                <p>Отчет в формате PDF</p>
                <p>Период: ${report.period ? `${new Date(report.period.startDate).toLocaleDateString('ru-RU')} - ${new Date(report.period.endDate).toLocaleDateString('ru-RU')}` : 'Не указан'}</p>
              </body>
            </html>
          `;
          mimeType = 'application/pdf';
          filename += '.pdf';
          break;
          
        case 'excel':
          // For demo, create a simple CSV that would be Excel compatible
          content = `Название,Тип,Период,Организация\n"${report.name}","${report.type}","${report.period ? `${report.period.startDate} - ${report.period.endDate}` : 'Не указан'}","${report.organization || 'Не указана'}"`;
          mimeType = 'application/vnd.ms-excel';
          filename += '.xlsx';
          break;
          
        case 'word':
          // For demo, create a simple HTML that would be converted to Word
          content = `
            <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word">
              <head>
                <meta charset="utf-8">
                <title>${report.name}</title>
              </head>
              <body>
                <h1>${report.name}</h1>
                <p>Отчет в формате Word</p>
                <p>Период: ${report.period ? `${new Date(report.period.startDate).toLocaleDateString('ru-RU')} - ${new Date(report.period.endDate).toLocaleDateString('ru-RU')}` : 'Не указан'}</p>
              </body>
            </html>
          `;
          mimeType = 'application/msword';
          filename += '.docx';
          break;
          
        default:
          content = JSON.stringify(report, null, 2);
          mimeType = 'application/json';
          filename += '.json';
      }
      
      // Create a blob from the content
      const blob = new Blob([content], { type: mimeType });
      
      // Create download link
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link);
      
      // Trigger download
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
      
      // Hide format menu
      setFormatMenuOpen(null);
      
      console.log(`Downloaded report ${reportId} in ${format} format`);
    } catch (err) {
      console.error("Failed to download report:", err);
      alert(`Ошибка при скачивании отчета в формате ${format.toUpperCase()}. Пожалуйста, попробуйте снова.`);
    }
  };

  // Function to view report
  const handleViewReport = (reportId: string) => {
    const report = reports.find(r => r.id === reportId);
    if (report) {
      // Create a viewer content similar to the print version
      const viewContent = `
        <html>
        <head>
          <title>Просмотр отчета: ${report.name}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 30px; }
            h1 { font-size: 24px; margin-bottom: 20px; }
            h2 { font-size: 18px; margin-top: 20px; margin-bottom: 10px; }
            .info { margin-bottom: 5px; }
            .label { font-weight: bold; display: inline-block; width: 150px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
            th { background-color: #f2f2f2; }
            .actions { margin-top: 20px; }
            button { padding: 8px 16px; margin-right: 10px; cursor: pointer; }
            .print-btn { background-color: #4CAF50; color: white; border: none; }
            .download-btn { background-color: #008CBA; color: white; border: none; }
          </style>
        </head>
        <body>
          <h1>${report.name}</h1>
          <div class="info"><span class="label">Тип отчета:</span> ${
            report.type === 'orders' ? 'Заказы' :
            report.type === 'products' ? 'Товары' :
            report.type === 'payments' ? 'Платежи' : 'Аналитика'
          }</div>
          <div class="info"><span class="label">Период:</span> ${
            report.period ? `${new Date(report.period.startDate).toLocaleDateString('ru-RU')} - ${new Date(report.period.endDate).toLocaleDateString('ru-RU')}` : 'Не указан'
          }</div>
          <div class="info"><span class="label">Организация:</span> ${report.organization || 'Не указана'}</div>
          <div class="info"><span class="label">Создан:</span> ${new Date(report.createdAt).toLocaleString('ru-RU')}</div>
          
          <h2>Данные отчета</h2>
          <p>Здесь отображены данные отчета согласно выбранным параметрам.</p>
          
          <table>
            <thead>
              <tr>
                <th>№</th>
                <th>Наименование</th>
                <th>Количество</th>
                <th>Сумма</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>1</td>
                <td>Товар 1</td>
                <td>10</td>
                <td>10 000 ₽</td>
              </tr>
              <tr>
                <td>2</td>
                <td>Товар 2</td>
                <td>5</td>
                <td>7 500 ₽</td>
              </tr>
              <tr>
                <td>3</td>
                <td>Товар 3</td>
                <td>3</td>
                <td>4 500 ₽</td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <td colspan="2"><strong>Итого:</strong></td>
                <td><strong>18</strong></td>
                <td><strong>22 000 ₽</strong></td>
              </tr>
            </tfoot>
          </table>
          
          <div class="actions">
            <button onclick="window.print()" class="print-btn">Печать отчета</button>
            <button onclick="window.close()" class="download-btn">Закрыть</button>
          </div>
        </body>
        </html>
      `;
      
      // Open in new window
      const viewWindow = window.open('', '_blank');
      if (viewWindow) {
        viewWindow.document.write(viewContent);
        viewWindow.document.close();
        viewWindow.focus();
      } else {
        alert('Пожалуйста, разрешите всплывающие окна для просмотра отчетов');
      }
    }
  };

  const filteredReports = reports.filter(report => {
    // Filter by type
    if (activeTab !== 'all' && report.type !== activeTab) {
      return false;
    }
    
    // Filter by search
    if (search && !report.name.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    
    return true;
  });

  const nextStep = () => {
    setStep(step + 1);
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  // Step 1 - Template selection
  const StepOne = () => (
    <div>
      <h3 className="text-lg font-medium mb-4 dark:text-gray-200">Шаг 1: Выберите шаблон отчета</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {templates.map(template => (
          <div 
            key={template.id} 
            className={`border rounded-lg p-4 cursor-pointer transition-all 
              ${selectedTemplate === template.id 
                ? 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/30' 
                : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700'}`}
            onClick={() => handleTemplateSelect(template.id)}
          >
            <div className="flex items-start mb-2">
              <DocumentTextIcon className="h-6 w-6 text-blue-500 dark:text-blue-400 mr-2" />
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">{template.name}</h4>
                <p className="text-sm text-gray-500 dark:text-gray-300">{template.description}</p>
              </div>
            </div>
            
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              {template.default && (
                <span className="inline-block bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded text-xs mr-2">
                  По умолчанию
                </span>
              )}
              <span className="inline-block bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-2 py-1 rounded text-xs">
                Тип: {template.type === 'orders' ? 'Заказы' : 
                     template.type === 'products' ? 'Товары' : 
                     template.type === 'payments' ? 'Платежи' : 'Аналитика'}
              </span>
            </div>
          </div>
        ))}
      </div>
      
      <div className="flex items-center justify-between mt-6">
        <button
          onClick={() => setIsCreatingReport(false)}
          className="px-4 py-2 bg-gray-300 hover:bg-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600 
                    text-gray-800 dark:text-gray-200 rounded-md transition-colors"
        >
          Отмена
        </button>
        
        <button
          onClick={nextStep}
          disabled={!selectedTemplate}
          className={`px-4 py-2 rounded-md transition-colors ${
            !selectedTemplate ? 'bg-blue-400 cursor-not-allowed text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          Далее
        </button>
      </div>
    </div>
  );

  // Step 2 - Report parameters
  const StepTwo = () => (
    <div>
      <h3 className="text-lg font-medium mb-4 dark:text-gray-200">Шаг 2: Параметры отчета</h3>
      
      <div className="mb-6 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <h4 className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
          Основные параметры
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Название отчета <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              value={newReport.name}
              onChange={(e) => setNewReport({...newReport, name: e.target.value})}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 
                        bg-white dark:bg-[#333] text-gray-800 dark:text-white"
              placeholder="Введите название отчета"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Тип отчета
            </label>
            <select
              value={newReport.type}
              onChange={(e) => setNewReport({...newReport, type: e.target.value})}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 
                        bg-white dark:bg-[#333] text-gray-800 dark:text-white"
            >
              <option value="orders">Заказы</option>
              <option value="products">Товары</option>
              <option value="payments">Платежи</option>
              <option value="analytics">Аналитика</option>
            </select>
          </div>
        </div>
      
        <h4 className="text-sm font-semibold mt-4 mb-2 text-gray-700 dark:text-gray-300">
          Период отчета
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Дата начала <span className="text-red-600">*</span>
            </label>
            <div className="relative">
              <CalendarIcon className="h-5 w-5 absolute left-3 top-2.5 text-gray-400" />
              <input
                type="date"
                value={newReport.period.startDate}
                onChange={(e) => setNewReport({
                  ...newReport, 
                  period: {
                    ...newReport.period,
                    startDate: e.target.value
                  }
                })}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-md pl-10 pr-3 py-2 
                          bg-white dark:bg-[#333] text-gray-800 dark:text-white"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Дата окончания <span className="text-red-600">*</span>
            </label>
            <div className="relative">
              <CalendarIcon className="h-5 w-5 absolute left-3 top-2.5 text-gray-400" />
              <input
                type="date"
                value={newReport.period.endDate}
                onChange={(e) => setNewReport({
                  ...newReport, 
                  period: {
                    ...newReport.period,
                    endDate: e.target.value
                  }
                })}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-md pl-10 pr-3 py-2 
                          bg-white dark:bg-[#333] text-gray-800 dark:text-white"
              />
            </div>
          </div>
        </div>
        
        <h4 className="text-sm font-semibold mt-4 mb-2 text-gray-700 dark:text-gray-300">
          Организация и ответственные
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Организация <span className="text-red-600">*</span>
            </label>
            <select
              value={newReport.organization}
              onChange={(e) => setNewReport({...newReport, organization: e.target.value})}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 
                        bg-white dark:bg-[#333] text-gray-800 dark:text-white"
            >
              <option value="">Выберите организацию</option>
              {organizations.map(org => (
                <option key={org} value={org}>{org}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Подразделение
            </label>
            <select
              value={newReport.department}
              onChange={(e) => setNewReport({...newReport, department: e.target.value})}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 
                        bg-white dark:bg-[#333] text-gray-800 dark:text-white"
            >
              <option value="">Выберите подразделение</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      <div className="mt-3">
        <button 
          type="button" 
          onClick={() => setShowSettings(!showSettings)}
          className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:underline"
        >
          {showSettings ? "Скрыть дополнительные настройки" : "Показать дополнительные настройки"}
        </button>
      </div>
      
      {showSettings && (
        <div className="mt-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <h4 className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
            Дополнительные параметры
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Ответственный
              </label>
              <select
                value={newReport.responsible}
                onChange={(e) => setNewReport({...newReport, responsible: e.target.value})}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 
                          bg-white dark:bg-[#333] text-gray-800 dark:text-white"
              >
                <option value="">Выберите ответственного</option>
                {responsiblePersons.map(person => (
                  <option key={person} value={person}>{person}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Формат файла
              </label>
              <div className="flex space-x-4">
                <label className="inline-flex items-center">
                  <input 
                    type="radio" 
                    name="format" 
                    value="pdf" 
                    checked={newReport.format === 'pdf'}
                    onChange={() => setNewReport({...newReport, format: 'pdf'})}
                    className="form-radio text-blue-600"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">PDF</span>
                </label>
                <label className="inline-flex items-center">
                  <input 
                    type="radio" 
                    name="format" 
                    value="excel" 
                    checked={newReport.format === 'excel'}
                    onChange={() => setNewReport({...newReport, format: 'excel'})}
                    className="form-radio text-blue-600"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Excel</span>
                </label>
                <label className="inline-flex items-center">
                  <input 
                    type="radio" 
                    name="format" 
                    value="word" 
                    checked={newReport.format === 'word'}
                    onChange={() => setNewReport({...newReport, format: 'word'})}
                    className="form-radio text-blue-600"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Word</span>
                </label>
              </div>
            </div>
          </div>
          
          <h4 className="text-sm font-semibold mt-4 mb-2 text-gray-700 dark:text-gray-300">
            Содержание отчета
          </h4>
          
          <div className="space-y-2 mt-2">
            <label className="inline-flex items-center">
              <input 
                type="checkbox" 
                checked={newReport.includeTotals}
                onChange={() => setNewReport({...newReport, includeTotals: !newReport.includeTotals})}
                className="form-checkbox text-blue-600"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Включить итоги</span>
            </label>
            
            <div className="ml-6 mt-1 text-xs text-gray-500 dark:text-gray-400">
              Отчет будет содержать итоговые суммы и количества
            </div>
            
            <label className="inline-flex items-center mt-2">
              <input 
                type="checkbox" 
                checked={newReport.includeChart}
                onChange={() => setNewReport({...newReport, includeChart: !newReport.includeChart})}
                className="form-checkbox text-blue-600"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Включить диаграммы</span>
            </label>
            
            <div className="ml-6 mt-1 text-xs text-gray-500 dark:text-gray-400">
              В отчет будут добавлены графические представления данных
            </div>
            
            <label className="inline-flex items-center mt-2">
              <input 
                type="checkbox" 
                checked={newReport.includeDetails}
                onChange={() => setNewReport({...newReport, includeDetails: !newReport.includeDetails})}
                className="form-checkbox text-blue-600"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Включить детализацию</span>
            </label>
            
            <div className="ml-6 mt-1 text-xs text-gray-500 dark:text-gray-400">
              Отчет будет содержать подробную информацию по каждой позиции
            </div>
          </div>
        </div>
      )}
      
      <div className="flex items-center justify-between mt-6">
        <button
          onClick={prevStep}
          className="px-4 py-2 bg-gray-300 hover:bg-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600 
                    text-gray-800 dark:text-gray-200 rounded-md transition-colors"
        >
          Назад
        </button>
        
        <button
          onClick={nextStep}
          disabled={!newReport.name || !newReport.organization}
          className={`px-4 py-2 rounded-md transition-colors ${
            !newReport.name || !newReport.organization 
              ? 'bg-blue-400 cursor-not-allowed text-white' 
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          Далее
        </button>
      </div>
    </div>
  );

  // Step 3 - Preview and confirm
  const StepThree = () => (
    <div>
      <h3 className="text-lg font-medium mb-4 dark:text-gray-200">Шаг 3: Подтверждение и создание отчета</h3>
      
      <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-6">
        <h4 className="text-sm font-semibold mb-4 text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700 pb-2">
          Предпросмотр отчета
        </h4>
        
        <div className="space-y-3">
          <div className="flex">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400 w-40">Название:</span>
            <span className="text-sm text-gray-800 dark:text-gray-200">{newReport.name}</span>
          </div>
          
          <div className="flex">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400 w-40">Тип отчета:</span>
            <span className="text-sm text-gray-800 dark:text-gray-200">
              {newReport.type === 'orders' && 'Заказы'}
              {newReport.type === 'products' && 'Товары'}
              {newReport.type === 'payments' && 'Платежи'}
              {newReport.type === 'analytics' && 'Аналитика'}
            </span>
          </div>
          
          <div className="flex">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400 w-40">Период:</span>
            <span className="text-sm text-gray-800 dark:text-gray-200">
              с {new Date(newReport.period.startDate).toLocaleDateString('ru-RU')} 
              по {new Date(newReport.period.endDate).toLocaleDateString('ru-RU')}
            </span>
          </div>
          
          <div className="flex">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400 w-40">Организация:</span>
            <span className="text-sm text-gray-800 dark:text-gray-200">{newReport.organization || 'Не указано'}</span>
          </div>
          
          {newReport.department && (
            <div className="flex">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400 w-40">Подразделение:</span>
              <span className="text-sm text-gray-800 dark:text-gray-200">{newReport.department}</span>
            </div>
          )}
          
          {newReport.responsible && (
            <div className="flex">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400 w-40">Ответственный:</span>
              <span className="text-sm text-gray-800 dark:text-gray-200">{newReport.responsible}</span>
            </div>
          )}
          
          <div className="flex">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400 w-40">Формат файла:</span>
            <span className="text-sm text-gray-800 dark:text-gray-200">
              {newReport.format === 'pdf' && 'PDF'}
              {newReport.format === 'excel' && 'Excel'}
              {newReport.format === 'word' && 'Word'}
            </span>
          </div>
          
          <div className="flex">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400 w-40">Содержание:</span>
            <div className="text-sm text-gray-800 dark:text-gray-200">
              <ul className="list-disc ml-5 space-y-1">
                {newReport.includeTotals && <li>Итоговые данные</li>}
                {newReport.includeChart && <li>Диаграммы</li>}
                {newReport.includeDetails && <li>Детализация</li>}
              </ul>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-600 dark:text-blue-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h5 className="text-sm font-medium text-blue-800 dark:text-blue-200">
              Отчет готов к созданию
            </h5>
            <div className="mt-1 text-xs text-blue-700 dark:text-blue-300">
              После создания вы сможете отправить или распечатать отчет из списка доступных отчетов
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex items-center justify-between mt-6">
        <button
          onClick={prevStep}
          className="px-4 py-2 bg-gray-300 hover:bg-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600 
                    text-gray-800 dark:text-gray-200 rounded-md transition-colors"
          disabled={isGenerating}
        >
          Назад
        </button>
        
        <button
          onClick={handleCreateReport}
          disabled={isGenerating}
          className={`px-4 py-2 ${
            isGenerating 
              ? 'bg-blue-400 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700'
          } text-white rounded-md transition-colors flex items-center`}
        >
          {isGenerating ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Создание...
            </>
          ) : (
            'Создать отчет'
          )}
        </button>
      </div>
    </div>
  );

  // Handle format menu toggle
  const toggleFormatMenu = (reportId: string) => {
    if (formatMenuOpen === reportId) {
      setFormatMenuOpen(null);
    } else {
      setFormatMenuOpen(reportId);
    }
  };

  // Close format menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (formatMenuOpen) {
        const menu = document.getElementById(`format-menu-${formatMenuOpen}`);
        if (menu && !menu.contains(event.target as Node)) {
          setFormatMenuOpen(null);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [formatMenuOpen]);

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Отчеты</h1>
        
        {!isCreatingReport && (
          <button
            onClick={() => setIsCreatingReport(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md"
          >
            Создать отчет
          </button>
        )}
      </div>

      {/* Error message if any */}
      {error && (
        <div className="bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded mb-6">
          <p>{error}</p>
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}

      {/* Modal for creating report */}
      {isCreatingReport && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 dark:bg-gray-900 opacity-75"></div>
            </div>
            
            {/* Modal window */}
            <div className="inline-block align-bottom bg-white dark:bg-[#252525] rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
              {/* Modal header and close button */}
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <h2 className="text-xl font-medium text-gray-900 dark:text-white">
                  Создание нового отчета
                </h2>
                <button onClick={resetForm} className="text-gray-400 hover:text-gray-500">
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              
              {/* Progress steps */}
              <div className="px-6 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#202020]">
                <div className="flex items-center">
                  <div className={`flex items-center relative ${step >= 1 ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`}>
                    <div className={`rounded-full transition duration-500 ease-in-out h-6 w-6 flex items-center justify-center ${
                      step > 1 ? 'bg-blue-600 dark:bg-blue-500 text-white' : 'border-2 border-gray-300 dark:border-gray-600'
                    }`}>
                      {step > 1 ? (
                        <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <span className={step === 1 ? 'text-blue-600 dark:text-blue-400' : ''}>1</span>
                      )}
                    </div>
                    <div className={`ml-2 text-sm ${step >= 1 ? 'font-medium' : ''}`}>Выбор шаблона</div>
                  </div>
                  
                  <div className={`flex-auto border-t-2 mx-4 transition duration-500 ease-in-out ${
                    step > 1 ? 'border-blue-600 dark:border-blue-500' : 'border-gray-300 dark:border-gray-700'
                  }`}></div>
                  
                  <div className={`flex items-center relative ${step >= 2 ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`}>
                    <div className={`rounded-full transition duration-500 ease-in-out h-6 w-6 flex items-center justify-center ${
                      step > 2 ? 'bg-blue-600 dark:bg-blue-500 text-white' : 'border-2 border-gray-300 dark:border-gray-600'
                    }`}>
                      {step > 2 ? (
                        <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <span className={step === 2 ? 'text-blue-600 dark:text-blue-400' : ''}>2</span>
                      )}
                    </div>
                    <div className={`ml-2 text-sm ${step >= 2 ? 'font-medium' : ''}`}>Параметры</div>
                  </div>
                  
                  <div className={`flex-auto border-t-2 mx-4 transition duration-500 ease-in-out ${
                    step > 2 ? 'border-blue-600 dark:border-blue-500' : 'border-gray-300 dark:border-gray-700'
                  }`}></div>
                  
                  <div className={`flex items-center relative ${step >= 3 ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`}>
                    <div className={`rounded-full transition duration-500 ease-in-out h-6 w-6 flex items-center justify-center ${
                      step > 3 ? 'bg-blue-600 dark:bg-blue-500 text-white' : 'border-2 border-gray-300 dark:border-gray-600'
                    }`}>
                      <span className={step === 3 ? 'text-blue-600 dark:text-blue-400' : ''}>3</span>
                    </div>
                    <div className={`ml-2 text-sm ${step >= 3 ? 'font-medium' : ''}`}>Подтверждение</div>
                  </div>
                </div>
              </div>
              
              {/* Content for current step */}
              <div className="px-6 py-5">
                {step === 1 && <StepOne />}
                {step === 2 && <StepTwo />}
                {step === 3 && <StepThree />}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search and filters for reports */}
      <div className="mb-6">
        <div className="md:flex items-center justify-between">
          <div className="md:w-1/3 mb-4 md:mb-0">
            <div className="relative">
              <input
                type="text"
                placeholder="Поиск отчетов..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 
                          bg-white dark:bg-[#333] text-gray-800 dark:text-white"
              />
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-2.5 text-gray-400" />
            </div>
          </div>
          
          <div className="inline-flex rounded-md shadow">
            <select
              className="py-2 px-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#333] 
                        text-gray-700 dark:text-white rounded-md focus:outline-none"
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value)}
            >
              <option value="all">Все отчеты</option>
              <option value="orders">Заказы</option>
              <option value="products">Товары</option>
              <option value="payments">Платежи</option>
              <option value="analytics">Аналитика</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reports list */}
      <div className="bg-white dark:bg-[#282828] rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-[#333]">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Название
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Тип
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Дата создания
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Статус
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Действия
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredReports.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                  {isLoading ? "Загрузка отчетов..." : "Нет доступных отчетов"}
                </td>
              </tr>
            ) : (
              filteredReports.map((report) => (
                <tr key={report.id} className="relative">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    <div className="flex items-center">
                      <DocumentTextIcon className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-2" />
                      <button 
                        onClick={() => handleViewReport(report.id)}
                        className="hover:text-blue-600 dark:hover:text-blue-400"
                      >
                        {report.name}
                      </button>
                      {report.format === 'pdf' && (
                        <span className="ml-2 px-2 py-0.5 text-xs font-medium rounded-full bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                          PDF
                        </span>
                      )}
                      {report.format === 'excel' && (
                        <span className="ml-2 px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                          Excel
                        </span>
                      )}
                      {report.format === 'word' && (
                        <span className="ml-2 px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                          Word
                        </span>
                      )}
                    </div>
                    {report.period && (
                      <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        За период: {new Date(report.period.startDate).toLocaleDateString('ru-RU')} - {new Date(report.period.endDate).toLocaleDateString('ru-RU')}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200">
                      {report.type === 'orders' && 'Заказы'}
                      {report.type === 'products' && 'Товары'}
                      {report.type === 'payments' && 'Платежи'}
                      {report.type === 'analytics' && 'Аналитика'}
                    </span>
                    {report.organization && (
                      <div className="mt-1 text-xs">
                        {report.organization}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    {new Date(report.createdAt).toLocaleDateString('ru-RU', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2.5 py-1 text-xs font-medium rounded-full 
                      ${report.status === 'draft' && 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200'} 
                      ${report.status === 'sent' && 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200'} 
                      ${report.status === 'printed' && 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200'}`}
                    >
                      {report.status === 'draft' && 'Черновик'}
                      {report.status === 'sent' && 'Отправлен'}
                      {report.status === 'printed' && 'Напечатан'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    <div className="flex justify-end space-x-3">
                      <button 
                        onClick={() => handlePrintReport(report.id)}
                        title="Печать"
                        className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300"
                      >
                        <PrinterIcon className="h-5 w-5" />
                      </button>
                      <button 
                        onClick={() => handleSendReport(report.id)}
                        title="Отправить по email"
                        className={`text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300 
                                  ${report.status === 'sent' && 'opacity-50 cursor-not-allowed'}`}
                        disabled={report.status === 'sent'}
                      >
                        <EnvelopeIcon className="h-5 w-5" />
                      </button>
                      <div className="relative">
                        <button 
                          onClick={() => toggleFormatMenu(report.id)}
                          title="Скачать"
                          className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300"
                        >
                          <ArrowDownTrayIcon className="h-5 w-5" />
                        </button>
                        <div 
                          id={`format-menu-${report.id}`}
                          className={`absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-10 ${formatMenuOpen === report.id ? 'block' : 'hidden'}`}
                        >
                          <div className="py-1">
                            <button 
                              onClick={() => handleDownloadReport(report.id, 'pdf')}
                              className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                              PDF
                            </button>
                            <button 
                              onClick={() => handleDownloadReport(report.id, 'excel')}
                              className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                              Excel
                            </button>
                            <button 
                              onClick={() => handleDownloadReport(report.id, 'word')}
                              className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                              Word
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer with metadata */}
      <div className="mt-6 text-xs text-gray-500 dark:text-gray-400 text-right">
        <div>Последнее обновление: {new Date().toLocaleDateString('ru-RU', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}</div>
        <div>Пользователь: katarymba</div>
      </div>
    </div>
  );
};

export default Reports;
              
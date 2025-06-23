// src/pages/ServiceCatalogPage.tsx
import React, { useState } from 'react';
import { 
  MagnifyingGlassIcon, 
  LifebuoyIcon,
  UsersIcon,
  ServerIcon,
  WifiIcon,
  CreditCardIcon,
  ReceiptPercentIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

// Service Catalog Data Structure (mapped from your HTML prototype)
interface ServiceField {
  name: string;
  type: string;
  required?: boolean;
}

interface Service {
  id: string;
  name: string;
  description: string;
  fields: ServiceField[];
}

interface ServiceCategory {
  name: string;
  icon: string;
  description: string;
  services: Service[];
}

// Icon mapping for categories
const iconMap = {
  'users': UsersIcon,
  'hard-drive': ServerIcon,
  'wifi': WifiIcon,
  'credit-card': CreditCardIcon,
  'receipt': ReceiptPercentIcon,
  'file-text': DocumentTextIcon,
  'siren': ExclamationTriangleIcon,
};

// Service catalog data (transformed from your HTML prototype)
const serviceCatalogData: ServiceCategory[] = [
  {
    name: "User & Account Management",
    icon: 'users',
    description: "Create new user accounts, manage access permissions, and reset passwords for various applications.",
    services: [
      {
        id: "olibs_new_user",
        name: "OLIBS: Pendaftaran User Baru",
        description: "Request a new user account for the OLIBS application.",
        fields: [
          { name: "Cabang/Capem", type: "dropdown", required: true },
          { name: "Kode User", type: "text", required: true },
          { name: "Nama User", type: "text", required: true },
          { name: "Jabatan", type: "text", required: true }
        ]
      },
      {
        id: "olibs_password",
        name: "OLIBS: Override Password",
        description: "Request a password override for an OLIBS user.",
        fields: [
          { name: "Cabang/Capem", type: "dropdown", required: true },
          { name: "Kode User", type: "text", required: true },
          { name: "Nama User", type: "text", required: true },
          { name: "Jabatan", type: "text", required: true }
        ]
      },
      {
        id: "olibs_change_limit",
        name: "OLIBS: Perubahan Menu & Limit Transaksi",
        description: "Modify menu access and transaction limits for an OLIBS user.",
        fields: [
          { name: "Tanggal berlaku", type: "date", required: true },
          { name: "Cabang / Capem", type: "dropdown", required: true },
          { name: "Kode User", type: "text", required: true },
          { name: "Program Fasilitas OLIBS", type: "dropdown", required: true }
        ]
      },
      {
        id: "xcard_new_user",
        name: "XCARD: Pendaftaran User Baru",
        description: "Request a new user account for the XCARD application.",
        fields: [
          { name: "Cabang/Capem", type: "dropdown", required: true },
          { name: "Kode User", type: "text", required: true },
          { name: "Nama User", type: "text", required: true },
          { name: "IP Komputer", type: "text", required: true },
          { name: "Menu XCARD", type: "text", required: true }
        ]
      },
      {
        id: "bsgqris_new_user",
        name: "BSG QRIS: Pendaftaran User",
        description: "Create a new user for the BSG QRIS system.",
        fields: [
          { name: "Cabang/Capem", type: "dropdown", required: true },
          { name: "Kode User", type: "text", required: true },
          { name: "Nama User", type: "text", required: true }
        ]
      }
    ]
  },
  {
    name: "Hardware & Software",
    icon: 'hard-drive',
    description: "Request new devices, software installations, or maintenance for your computer and peripherals.",
    services: [
      {
        id: "hw_install_os",
        name: "Instalasi Sistem Operasi (Hardening)",
        description: "Request a fresh and secure installation of a Windows or Linux operating system.",
        fields: []
      },
      {
        id: "hw_install_sw",
        name: "Instalasi Perangkat Lunak",
        description: "Request the installation of approved software on your computer.",
        fields: []
      },
      {
        id: "hw_maintenance_pc",
        name: "Maintenance Komputer",
        description: "Schedule a routine check-up or repair for your desktop or laptop.",
        fields: []
      }
    ]
  },
  {
    name: "Network & Connectivity",
    icon: 'wifi',
    description: "Report network outages, slow performance, or issues with internet, LAN, or WAN connectivity.",
    services: [
      {
        id: "net_lan_issue",
        name: "Gangguan Jaringan LAN",
        description: "Report a problem with the local area network (cabled connection).",
        fields: []
      },
      {
        id: "net_internet_issue",
        name: "Gangguan Jaringan Internet",
        description: "Report slow or no internet access.",
        fields: []
      }
    ]
  },
  {
    name: "ATM Services",
    icon: 'credit-card',
    description: "Manage ATMs, including technical issues, transaction discrepancies, and profile changes.",
    services: [
      {
        id: "atm_technical",
        name: "Permasalahan Teknis ATM",
        description: "Report a technical fault or malfunction with an ATM.",
        fields: [
          { name: "Cabang/Capem", type: "dropdown", required: true },
          { name: "ID ATM", type: "text", required: true },
          { name: "Nama ATM", type: "text", required: true },
          { name: "Serial Number", type: "text", required: true },
          { name: "Tipe Mesin", type: "text", required: true },
          { name: "Nama PIC", type: "text", required: true },
          { name: "No HP PIC", type: "text", required: true }
        ]
      }
    ]
  },
  {
    name: "Transaction Claims",
    icon: 'receipt',
    description: "Submit a claim for a failed or incorrect transaction via BSGTouch, QRIS, or other channels.",
    services: [
      {
        id: "claim_bsgtouch_transfer",
        name: "Klaim: BSGTouch Transfer Antar Bank",
        description: "File a claim for a failed inter-bank transfer made via BSGTouch.",
        fields: [
          { name: "Nama Nasabah", type: "text", required: true },
          { name: "Nomor Rekening", type: "number", required: true },
          { name: "Nominal Transaksi", type: "currency", required: true },
          { name: "Tanggal transaksi", type: "datetime", required: true },
          { name: "Nomor Arsip", type: "text", required: true }
        ]
      }
    ]
  },
  {
    name: "Report an Issue",
    icon: 'siren',
    description: "Experiencing an error or a system problem? Report it here for our team to investigate.",
    services: [
      {
        id: "error_olibs",
        name: "Error: OLIBs",
        description: "Report an error in the OLIBs Core Banking System (e.g., Gagal Connect, Error PRK, Selisih Pembukuan).",
        fields: []
      },
      {
        id: "error_kasda",
        name: "Error: Kasda",
        description: "Report a system error, data issue, or performance problem in the Kasda application.",
        fields: []
      }
    ]
  }
];

const ServiceCatalogPage: React.FC = () => {
  const [currentView, setCurrentView] = useState<'categories' | 'services'>('categories');
  const [currentCategory, setCurrentCategory] = useState<ServiceCategory | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [showModal, setShowModal] = useState(false);

  // Filter services based on search term
  const getFilteredServices = () => {
    if (!searchTerm) return [];
    
    const results: Service[] = [];
    serviceCatalogData.forEach(category => {
      category.services.forEach(service => {
        if (
          service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          service.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          category.name.toLowerCase().includes(searchTerm.toLowerCase())
        ) {
          results.push(service);
        }
      });
    });
    return results;
  };

  const renderCategories = () => {
    return serviceCatalogData.map((category, index) => {
      const IconComponent = iconMap[category.icon as keyof typeof iconMap] || DocumentTextIcon;
      
      return (
        <div
          key={category.name}
          className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 animate-fade-in-up"
          onClick={() => {
            setCurrentCategory(category);
            setCurrentView('services');
          }}
          style={{
            animationDelay: `${index * 100}ms`
          }}
        >
          <div className="flex items-center justify-center bg-blue-100 text-blue-600 rounded-xl w-14 h-14 mb-4">
            <IconComponent className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">{category.name}</h3>
          <p className="text-sm text-gray-500 mt-1 h-10">{category.description}</p>
        </div>
      );
    });
  };

  const renderServices = (services: Service[]) => {
    return services.map((service, index) => (
      <div
        key={service.id}
        className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 animate-fade-in-up"
        onClick={() => {
          setSelectedService(service);
          setShowModal(true);
        }}
        style={{
          animationDelay: `${index * 100}ms`
        }}
      >
        <div className="flex items-center justify-center bg-blue-100 text-blue-600 rounded-xl w-14 h-14 mb-4">
          <DocumentTextIcon className="w-7 h-7" />
        </div>
        <h3 className="text-lg font-bold text-gray-900">{service.name}</h3>
        <p className="text-sm text-gray-500 mt-1 h-10">{service.description}</p>
      </div>
    ));
  };

  const renderBreadcrumb = () => {
    return (
      <div className="mb-6">
        <button
          onClick={() => {
            setCurrentView('categories');
            setCurrentCategory(null);
            setSearchTerm('');
          }}
          className="text-blue-600 hover:underline font-medium"
        >
          All Categories
        </button>
        {currentCategory && (
          <span className="text-gray-500">
            <span className="mx-2 text-gray-400">/</span>
            {currentCategory.name}
          </span>
        )}
        {searchTerm && (
          <span className="text-gray-500">
            <span className="mx-2 text-gray-400">/</span>
            Search results for "{searchTerm}"
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">IT Service Catalog</h1>
            <p className="mt-1 text-lg text-gray-600">How can we help you today?</p>
          </div>
          <div className="p-3 bg-blue-600 rounded-full text-white">
            <LifebuoyIcon className="w-7 h-7" />
          </div>
        </div>
        
        {/* Search Bar */}
        <div className="mt-6 relative">
          <input
            type="text"
            placeholder="Search for a service (e.g., 'password', 'new user', 'printer')..."
            className="w-full p-4 pl-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
          </div>
        </div>
      </header>

      <main>
        {/* Breadcrumb */}
        {renderBreadcrumb()}
        
        {/* Content Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {searchTerm ? (
            getFilteredServices().length > 0 ? (
              renderServices(getFilteredServices())
            ) : (
              <div className="col-span-full text-center py-16">
                <MagnifyingGlassIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-800">No Services Found</h3>
                <p className="text-gray-500 mt-1">
                  We couldn't find any services matching your search. Try using different keywords.
                </p>
              </div>
            )
          ) : currentView === 'categories' ? (
            renderCategories()
          ) : currentCategory ? (
            renderServices(currentCategory.services)
          ) : null}
        </div>
      </main>

      
      {/* Service Detail Modal - Will be implemented next */}
      {showModal && selectedService && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-11/12 max-w-2xl max-h-[85vh] flex flex-col">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{selectedService.name}</h2>
                <p className="text-gray-600 mt-1">{selectedService.description}</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Request Form</h3>
              <div className="space-y-4">
                {selectedService.fields.length > 0 ? (
                  selectedService.fields.map((field, index) => (
                    <div key={index}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {field.name} {field.required && <span className="text-red-500">*</span>}
                      </label>
                      <input
                        type={field.type === 'datetime' ? 'datetime-local' : field.type === 'number' ? 'number' : 'text'}
                        placeholder={field.type}
                        className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">
                    No specific fields are required for this request. Please provide details in your ticket description upon submission.
                  </p>
                )}
              </div>
            </div>
            <div className="p-6 bg-gray-50 border-t border-gray-200 rounded-b-2xl">
              <button className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 transition-all shadow-md">
                Submit Request
              </button>
              <p className="text-xs text-gray-500 mt-3 text-center">
                Note: This will create a ticket with the service details.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceCatalogPage;
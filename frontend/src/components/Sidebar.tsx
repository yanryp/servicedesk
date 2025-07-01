// components/Sidebar.tsx
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  TicketIcon,
  ClipboardDocumentListIcon,
  InboxIcon,
  UserIcon,
  ChartBarIcon,
  ArrowRightOnRectangleIcon,
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  TagIcon,
  CheckCircleIcon,
  RectangleStackIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  isMobileOpen: boolean;
  onMobileToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  isCollapsed, 
  onToggle, 
  isMobileOpen, 
  onMobileToggle 
}) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => {
    if (path === '/technician/tickets') {
      return location.pathname === path;
    }
    if (path === '/tickets' && ['technician', 'manager', 'admin'].includes(user?.role || '')) {
      // Redirect technicians, managers, and admins to the modern ticket management page
      return location.pathname === '/technician/tickets';
    }
    return location.pathname === path;
  };

  const navigationSections = [
    {
      title: 'Workspace',
      items: [
        // Technician Workspace (Inbox-style with view toggle)
        {
          name: 'Technician Workspace',
          href: '/technician/workspace',
          icon: InboxIcon,
          roles: ['technician', 'manager', 'admin']
        },
        // Technician Tickets (Modern Table/Kanban View)
        {
          name: 'Ticket Management',
          href: '/technician/tickets',
          icon: ClipboardDocumentListIcon,
          roles: ['technician', 'manager', 'admin']
        },
        // My Tickets for non-technicians
        {
          name: 'My Tickets',
          href: '/tickets',
          icon: ClipboardDocumentListIcon,
          roles: ['requester', 'manager', 'admin']
        },
        {
          name: 'Service Catalog',
          href: '/service-catalog-v2',
          icon: RectangleStackIcon,
          roles: ['requester', 'technician', 'manager', 'admin']
        }
      ]
    },
    {
      title: 'Management',
      items: [
        {
          name: 'Categorization Queue',
          href: '/categorization/queue',
          icon: TagIcon,
          roles: ['technician', 'admin']
        },
        {
          name: 'Approvals',
          href: '/manager',
          icon: CheckCircleIcon,
          roles: ['manager', 'admin']
        }
      ]
    },
    {
      title: 'Administration',
      items: [
        {
          name: 'User Management',
          href: '/admin/register',
          icon: UserIcon,
          roles: ['admin']
        },
        {
          name: 'Service Catalog Admin',
          href: '/service-catalog-admin',
          icon: RectangleStackIcon,
          roles: ['admin']
        },
        {
          name: 'SLA Policies',
          href: '/admin/sla-policies',
          icon: ClockIcon,
          roles: ['admin']
        },
        {
          name: 'Analytics',
          href: '/categorization/analytics',
          icon: ChartBarIcon,
          roles: ['manager', 'admin']
        },
        {
          name: 'Reporting',
          href: '/reporting',
          icon: ChartBarIcon,
          roles: ['manager', 'admin']
        }
      ]
    }
  ];

  const hasAccessToItem = (roles: string[]) => {
    return user?.role && roles.includes(user.role);
  };

  const sidebarContent = (
    <div className="h-full flex flex-col bg-white/80 backdrop-blur-md border-r border-slate-200/50 shadow-xl">
      {/* Header */}
      <div className={`p-4 border-b border-slate-200/50 ${isCollapsed ? 'px-2' : ''}`}>
        <div className="flex items-center justify-between">
          <Link to="/" className={`flex items-center space-x-3 group ${isCollapsed ? 'justify-center' : ''}`}>
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-200">
              <TicketIcon className="w-6 h-6 text-white" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col">
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  BSG Helpdesk
                </span>
                <span className="text-xs text-slate-500 -mt-1">Support Portal</span>
              </div>
            )}
          </Link>
          
          {/* Desktop Toggle */}
          <button
            onClick={onToggle}
            className="hidden lg:flex items-center justify-center w-8 h-8 rounded-lg hover:bg-slate-100 transition-colors"
          >
            {isCollapsed ? (
              <ChevronRightIcon className="w-4 h-4 text-slate-600" />
            ) : (
              <ChevronLeftIcon className="w-4 h-4 text-slate-600" />
            )}
          </button>

          {/* Mobile Close */}
          <button
            onClick={onMobileToggle}
            className="lg:hidden flex items-center justify-center w-8 h-8 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <XMarkIcon className="w-5 h-5 text-slate-600" />
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-6">
        {navigationSections.map((section) => {
          const visibleItems = section.items.filter(item => hasAccessToItem(item.roles));
          
          if (visibleItems.length === 0) return null;

          return (
            <div key={section.title}>
              {!isCollapsed && (
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                  {section.title}
                </h3>
              )}
              <ul className="space-y-1">
                {visibleItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  
                  return (
                    <li key={item.name}>
                      <Link
                        to={item.href}
                        onClick={() => window.innerWidth < 1024 && onMobileToggle()}
                        className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                          active
                            ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
                            : 'text-slate-600 hover:text-blue-600 hover:bg-blue-50'
                        } ${isCollapsed ? 'justify-center px-2' : ''}`}
                        title={isCollapsed ? item.name : undefined}
                      >
                        <Icon className={`${isCollapsed ? 'w-6 h-6' : 'w-5 h-5'} flex-shrink-0`} />
                        {!isCollapsed && <span>{item.name}</span>}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className={`p-4 border-t border-slate-200/50 ${isCollapsed ? 'px-2' : ''}`}>
        {!isCollapsed ? (
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
              <div className="w-8 h-8 bg-gradient-to-r from-slate-400 to-slate-600 rounded-lg flex items-center justify-center">
                <UserIcon className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">
                  {user?.username}
                </p>
                <div className="flex items-center space-x-2 text-xs text-slate-500">
                  <span className="capitalize">{user?.role}</span>
                  {user?.department && (
                    <>
                      <span>•</span>
                      <span className="text-blue-600 font-medium truncate">
                        {user.department.name}
                      </span>
                    </>
                  )}
                  {user?.unit && (
                    <>
                      <span>•</span>
                      <span className="text-green-600 font-medium truncate">
                        {user.unit.name}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-3 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg text-sm font-medium transition-colors"
            >
              <ArrowRightOnRectangleIcon className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex justify-center">
              <div className="w-8 h-8 bg-gradient-to-r from-slate-400 to-slate-600 rounded-lg flex items-center justify-center">
                <UserIcon className="w-4 h-4 text-white" />
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex justify-center px-2 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
              title="Logout"
            >
              <ArrowRightOnRectangleIcon className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/50" onClick={onMobileToggle} />
      )}

      {/* Desktop Sidebar */}
      <div className={`hidden lg:block transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'}`}>
        {sidebarContent}
      </div>

      {/* Mobile Sidebar */}
      <div className={`lg:hidden fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ${
        isMobileOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {sidebarContent}
      </div>
    </>
  );
};

export default Sidebar;
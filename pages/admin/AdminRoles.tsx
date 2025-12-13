import React, { useState } from 'react';
import { ShieldCheck, UserPlus, Edit3, Trash2 } from 'lucide-react';
import Button from '../../components/Button';
import { AdminRole } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';

const AdminRoles: React.FC = () => {
  const { t } = useLanguage();
  // Mock Roles
  const roles: AdminRole[] = [
    { id: '1', name: 'Super Admin', description: 'Full access to all system features', permissions: ['ALL'], usersCount: 2 },
    { id: '2', name: 'Support Agent', description: 'Can manage tickets and view users', permissions: ['view_users', 'manage_tickets'], usersCount: 5 },
    { id: '3', name: 'Finance Manager', description: 'Access to billing and payments only', permissions: ['view_payments', 'manage_invoices', 'view_reports'], usersCount: 1 },
  ];

  const allPermissions = [
      'manage_distributors', 'view_distributors',
      'manage_users', 'view_users',
      'manage_payments', 'view_payments',
      'manage_settings', 'view_logs',
      'manage_tickets'
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">{t('roles_perms')}</h1>
          <p className="text-slate-400 text-sm">{t('define_access')}</p>
        </div>
        <Button className="gap-2">
            <UserPlus size={18} /> {t('add_role')}
        </Button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Roles List */}
          <div className="space-y-4">
              {roles.map(role => (
                  <div key={role.id} className="bg-slate-900 border border-slate-800 p-6 rounded-xl flex flex-col gap-4 hover:border-blue-500/30 transition-colors">
                      <div className="flex justify-between items-start">
                          <div className="flex items-center gap-3">
                              <div className="p-3 bg-blue-900/20 text-blue-400 rounded-lg">
                                  <ShieldCheck size={24} />
                              </div>
                              <div>
                                  <h3 className="text-lg font-bold text-white">{role.name}</h3>
                                  <p className="text-sm text-slate-400">{role.description}</p>
                              </div>
                          </div>
                          <div className="flex gap-2">
                              <button className="p-2 hover:bg-slate-800 rounded text-slate-400 hover:text-white"><Edit3 size={16} /></button>
                              {role.name !== 'Super Admin' && (
                                  <button className="p-2 hover:bg-slate-800 rounded text-slate-400 hover:text-red-400"><Trash2 size={16} /></button>
                              )}
                          </div>
                      </div>
                      
                      <div className="border-t border-slate-800 pt-4">
                          <div className="text-xs font-bold text-slate-500 uppercase mb-2">{t('permissions')}</div>
                          <div className="flex flex-wrap gap-2">
                              {role.permissions.map(p => (
                                  <span key={p} className="px-2 py-1 bg-slate-800 text-slate-300 text-xs rounded border border-slate-700 font-mono">
                                      {p}
                                  </span>
                              ))}
                          </div>
                      </div>
                      
                      <div className="flex justify-between items-center text-xs text-slate-500 pt-2">
                          <span>{role.usersCount} {t('staff_members')}</span>
                          <span>ID: role_{role.id}</span>
                      </div>
                  </div>
              ))}
          </div>

          {/* Quick Permission View / Editor Mock */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
              <h3 className="font-bold text-white mb-4">{t('permission_matrix')}</h3>
              <p className="text-sm text-slate-400 mb-6">{t('select_role_edit')}</p>
              
              <div className="space-y-3 opacity-50 pointer-events-none">
                  {allPermissions.map(perm => (
                      <div key={perm} className="flex items-center gap-3">
                          <input type="checkbox" className="rounded bg-slate-800 border-slate-700" />
                          <label className="text-sm text-slate-300 font-mono">{perm}</label>
                      </div>
                  ))}
              </div>
          </div>
      </div>
    </div>
  );
};

export default AdminRoles;
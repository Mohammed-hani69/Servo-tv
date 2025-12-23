let allUsers = [];
const usersFromFlask = window.usersData || [];

async function processUsers() {
    allUsers = usersFromFlask.map(user => ({
        id: user.id,
        username: user.username,
        email: user.username,
        created_at: user.created_at,
        activation_code: user.activation_code,
        expiration_date: user.expiration_date,
        status: 'Inactive'
    }));
    
    for (let user of allUsers) {
        try {
            const response = await fetch(`/reseller/api/users/${user.id}`);
            const result = await response.json();
            
            if (result.success) {
                const data = result.data;
                user.devices = data.devices ? `${data.devices.length} / 1` : '0 / 1';
                user.is_active = data.is_active;
                user.status = data.is_active ? 'Active' : 'Inactive';
            }
        } catch (error) {
            console.warn(`Failed to fetch details for user ${user.id}:`, error);
            user.devices = '0 / 1';
        }
    }
    
    renderUsers();
}

function renderUsers() {
    const tableBody = document.getElementById('usersTable');
    
    if (allUsers.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 2rem;">No users found</td></tr>';
        return;
    }
    
    tableBody.innerHTML = allUsers.map(user => `
        <tr class="group">
            <td>
                <div class="user-email-cell">${user.email}</div>
                <div class="user-id-cell">ID: ${user.id}</div>
            </td>
            <td>
                <span class="status-badge ${user.status === 'Active' ? 'status-active' : 'status-suspended'}">
                    ${user.status === 'Active' ? 'Active' : 'Inactive'}
                </span>
            </td>
            <td>
                <div class="expiration-date">${user.expiration_date || 'LifeTime'}</div>
            </td>
            <td>
                <div class="devices-count">${user.devices || '0 / 1'}</div>
            </td>
            <td class="actions-cell">
                <div class="actions-container">
                    <button class="action-btn view" title="View Profile" onclick="viewUserProfile(${user.id})">
                        <svg class="action-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"></path><circle cx="12" cy="12" r="3"></circle></svg>
                    </button>
                    ${user.status === 'Active' ? `
                        <button class="action-btn password" title="Assign New Code" onclick="changeUserCode(${user.id}, '${user.username}')">
                            <svg class="action-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                        </button>
                        <button class="action-btn suspend" title="Deactivate User" onclick="suspendUser(${user.id}, '${user.username}')">
                            <svg class="action-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"><path d="M12 2v10"></path><path d="M18.4 6.6a9 9 0 1 1-12.77.04"></path></svg>
                        </button>
                    ` : `
                        <button class="action-btn activate" title="Activate User" onclick="activateUser(${user.id}, '${user.username}')">
                            <svg class="action-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"><path d="M12 2v10"></path><path d="M18.4 6.6a9 9 0 0 0-12.77-.04"></path></svg>
                        </button>
                    `}
                    <button class="action-btn delete" title="Delete User" onclick="deleteUser(${user.id}, '${user.username}')">
                        <svg class="action-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"><path d="M19 6l-.8 12.012C18.07 19.74 17.235 21 15.992 21H8.009c-1.243 0-2.078-1.26-2.211-2.988L5 6m1 0h12M9 6V4.5A2.5 2.5 0 0 1 11.5 2h1A2.5 2.5 0 0 1 15 4.5V6M9 11v5m6-5v5"></path></svg>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

async function viewUserProfile(userId) {
    try {
        const response = await fetch(`/reseller/api/users/${userId}`);
        const result = await response.json();
        
        if (result.success) {
            const data = result.data;
            
            document.getElementById('profile-username').textContent = data.username || 'Unknown';
            document.getElementById('profile-user-id').textContent = data.username || '-';
            document.getElementById('profile-user-number').textContent = `#${data.id}` || '-';
            
            const createdDate = data.created_at ? new Date(data.created_at).toLocaleDateString('en-US') : '-';
            document.getElementById('profile-created-date').textContent = createdDate;
            
            document.getElementById('profile-activation-code').textContent = data.activation_code || 'No Code';
            
            const planType = data.plan_type || 'Inactive';
            document.getElementById('profile-plan-type').textContent = planType;
            
            if (data.expiration_date) {
                const expirationDate = new Date(data.expiration_date).toLocaleDateString('en-US');
                document.getElementById('profile-expiration-date').textContent = expirationDate;
            } else {
                document.getElementById('profile-expiration-date').textContent = 'Lifetime';
            }
            
            document.getElementById('profile-max-devices').textContent = `${data.max_devices || 1} Device(s)`;
            
            const statusBadge = document.getElementById('profile-status');
            if (data.is_active) {
                statusBadge.textContent = 'Active';
                statusBadge.className = 'status-badge status-active';
            } else {
                statusBadge.textContent = 'Inactive';
                statusBadge.className = 'status-badge status-suspended';
            }
            
            const devicesList = document.getElementById('devices-list');
            if (!data.devices || data.devices.length === 0) {
                devicesList.innerHTML = `
                    <div class="empty-state">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
                            <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                            <path d="M8 21h8"></path>
                        </svg>
                        <p>No connected devices</p>
                    </div>
                `;
            } else {
                devicesList.innerHTML = data.devices.map(device => `
                    <div class="device-item">
                        <div class="device-header">
                            <div class="device-icon">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
                                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                                    <path d="M8 21h8"></path>
                                </svg>
                            </div>
                            <div class="device-name">${device.device_type || 'Unknown Device'}</div>
                            <span class="device-status ${device.is_active ? 'active' : 'inactive'}">
                                ${device.is_active ? 'Active' : 'Inactive'}
                            </span>
                        </div>
                        <div class="device-details">
                            <div class="device-detail">
                                <strong>Device ID:</strong> ${device.device_uid || '-'}
                            </div>
                            <div class="device-detail">
                                <strong>Last Login:</strong> 
                                ${device.last_login ? new Date(device.last_login).toLocaleDateString('en-US') : 'Never'}
                            </div>
                        </div>
                    </div>
                `).join('');
            }
            
            const modal = document.getElementById('user-profile-modal');
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        } else {
            showNotification('Failed to load user data', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('Connection error', 'error');
    }
}

async function verifyPinBeforeAction(action, userId, username) {
    return new Promise((resolve) => {
        // تعيين الإجراء المعلق
        window.pendingAction = async () => {
            // تنفيذ الإجراء المطلوب بناءً على نوع الإجراء
            switch(action) {
                case 'changeCode':
                    await performChangeCode(userId, username);
                    break;
                case 'suspend':
                    await performSuspendUser(userId, username);
                    break;
                case 'activate':
                    await performActivateUser(userId, username);
                    break;
                case 'delete':
                    await performDeleteUser(userId, username);
                    break;
            }
            resolve(true);
        };

        // فتح نافذة PIN (يتم تعريفها في HTML)
        openPinModal();

        // إذا لم يتم التحقق من PIN أو تم الإلغاء
        // سيتم إنشاء مستمع للإلغاء
        const checkCancel = setInterval(() => {
            const modal = document.getElementById('verifyPinModal');
            if (modal && modal.classList.contains('hidden')) {
                clearInterval(checkCancel);
                if (!window.pinVerified) {
                    resolve(false);
                }
            }
        }, 100);
    });
}

// الدوال المساعدة للإجراءات الفعلية
async function performChangeCode(userId, username) {
    const modal = document.createElement('div');
    modal.style.cssText = `position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 2000;`;
    modal.innerHTML = `<div style="background: #1e293b; padding: 2rem; border-radius: 0.5rem; min-width: 350px; color: white;"><h3 style="margin: 0 0 1rem 0; color: #f8fafc;">Assign New Code</h3><p style="margin: 0 0 1rem 0; font-size: 0.9rem; color: #cbd5e1;">Enter new code for ${username}:</p><input type="text" id="new-code-input" placeholder="Enter code" style="width: 100%; padding: 0.5rem; border: 1px solid #334155; border-radius: 0.25rem; background: #0f172a; color: white; margin-bottom: 1rem; box-sizing: border-box;"><div style="display: flex; gap: 0.5rem; justify-content: flex-end;"><button onclick="this.closest('[style*=z-index]').remove()" style="padding: 0.5rem 1rem; background: #475569; border: none; border-radius: 0.25rem; color: white; cursor: pointer;">Cancel</button><button id="confirm-code-btn" style="padding: 0.5rem 1rem; background: #3b82f6; border: none; border-radius: 0.25rem; color: white; cursor: pointer;">Assign</button></div></div>`;
    document.body.appendChild(modal);
    const input = modal.querySelector('#new-code-input');
    input.focus();
    modal.querySelector('#confirm-code-btn').addEventListener('click', async () => {
        const newCode = input.value.trim();
        if (!newCode) { showNotification('Code is required', 'error'); return; }
        modal.remove();
        try {
            const response = await fetch(`/reseller/api/users/${userId}/change-password`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ new_code: newCode }) });
            const result = await response.json();
            if (result.success) { showNotification('Code assigned successfully', 'success'); location.reload(); } else { showNotification(result.message || 'Failed to assign code', 'error'); }
        } catch (error) { console.error('Error:', error); showNotification('Connection error', 'error'); }
    });
    input.addEventListener('keypress', (e) => { if (e.key === 'Enter') modal.querySelector('#confirm-code-btn').click(); });
}

async function performSuspendUser(userId, username) {
    try {
        const response = await fetch(`/reseller/api/users/${userId}/suspend`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        
        const result = await response.json();
        if (result.success) {
            showNotification('User deactivated successfully', 'success');
            const modal = document.getElementById('user-profile-modal');
            if (modal && modal.style.display === 'flex') {
                closeUserProfileModal();
            }
            location.reload();
        } else {
            showNotification(result.message || 'Failed to deactivate user', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('Connection error', 'error');
    }
}

async function performActivateUser(userId, username) {
    try {
        const response = await fetch(`/reseller/api/users/${userId}/activate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        
        const result = await response.json();
        if (result.success) {
            showNotification('User activated successfully', 'success');
            const modal = document.getElementById('user-profile-modal');
            if (modal && modal.style.display === 'flex') {
                closeUserProfileModal();
            }
            location.reload();
        } else {
            showNotification(result.message || 'Failed to activate user', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('Connection error', 'error');
    }
}

async function performDeleteUser(userId, username) {
    try {
        const response = await fetch(`/reseller/api/users/${userId}/delete`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' }
        });
        
        const result = await response.json();
        if (result.success) {
            showNotification('User deleted successfully', 'success');
            const modal = document.getElementById('user-profile-modal');
            if (modal && modal.style.display === 'flex') {
                closeUserProfileModal();
            }
            location.reload();
        } else {
            showNotification(result.message || 'Failed to delete user', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('Connection error', 'error');
    }
}

async function changeUserCode(userId, username) {
    // طلب التحقق من PIN أولاً
    await verifyPinBeforeAction('changeCode', userId, username);
}

async function suspendUser(userId, username) {
    // طلب التحقق من PIN أولاً
    await verifyPinBeforeAction('suspend', userId, username);
}

async function activateUser(userId, username) {
    // طلب التحقق من PIN أولاً
    await verifyPinBeforeAction('activate', userId, username);
}

async function deleteUser(userId, username) {
    // طلب التحقق من PIN أولاً
    await verifyPinBeforeAction('delete', userId, username);
}

function closeUserProfileModal() {
    const modal = document.getElementById('user-profile-modal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        border-radius: 0.5rem;
        z-index: 1000;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

document.addEventListener('DOMContentLoaded', function() {
    processUsers();
    
    const searchInput = document.querySelector('.users-search');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            const searchTerm = e.target.value.toLowerCase();
            document.querySelectorAll('tbody tr').forEach(row => {
                const email = row.querySelector('.user-email-cell').textContent.toLowerCase();
                const id = row.querySelector('.user-id-cell').textContent.toLowerCase();
                const matches = email.includes(searchTerm) || id.includes(searchTerm);
                row.style.display = matches ? 'table-row' : 'none';
            });
        });
    }
});

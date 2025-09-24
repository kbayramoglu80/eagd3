let donations = [];
let currentDonationId = null;
let authToken = null;

// Force login every time - no persistent sessions
// Removed localStorage check for security

// Login form submission
document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('loginError');
    
    try {
        const response = await fetch('/api/admin/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password })
        });
        
        const result = await response.json();
        
        if (response.ok) {
            authToken = result.token;
            // No localStorage - session only for security
            showDashboard();
        } else {
            throw new Error(result.error || 'Giriş başarısız');
        }
    } catch (error) {
        console.error('Login error:', error);
        errorDiv.textContent = error.message || 'Giriş başarısız!';
        errorDiv.style.display = 'block';
    }
});

// Verify token function
async function verifyToken() {
    try {
        const response = await fetch('/api/admin/verify', {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (response.ok) {
            showDashboard();
        } else {
            localStorage.removeItem('adminToken');
            authToken = null;
        }
    } catch (error) {
        localStorage.removeItem('adminToken');
        authToken = null;
    }
}

function showDashboard() {
    document.getElementById('loginContainer').style.display = 'none';
    document.getElementById('dashboardContainer').style.display = 'block';
    loadDonations();
}

function logout() {
    // Clear any existing tokens
    localStorage.removeItem('adminToken');
    sessionStorage.removeItem('adminToken');
    authToken = null;
    
    // Show login form
    document.getElementById('loginContainer').style.display = 'block';
    document.getElementById('dashboardContainer').style.display = 'none';
    document.getElementById('loginForm').reset();
    document.getElementById('loginError').style.display = 'none';
    
    // Clear any sensitive data
    donations = [];
    currentDonationId = null;
}

async function loadDonations() {
    try {
        const response = await fetch('/api/donations', {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        const result = await response.json();
        
        if (response.ok) {
            donations = result.data;
            updateStats();
            updateTable();
        } else {
            throw new Error(result.error || 'Bağışlar yüklenemedi');
        }
    } catch (error) {
        console.error('Error loading donations:', error);
        alert('Bağışlar yüklenirken hata oluştu: ' + error.message);
    }
}

async function loadStats() {
    try {
        const response = await fetch('/api/donations/stats/summary', {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        const result = await response.json();
        
        if (response.ok) {
            const stats = result.data;
            document.getElementById('totalDonations').textContent = stats.total;
            document.getElementById('pendingDonations').textContent = stats.pending;
            document.getElementById('processingDonations').textContent = stats.processing;
            document.getElementById('completedDonations').textContent = stats.completed;
        }
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

function updateStats() {
    // Load stats from API
    loadStats();
}

function updateTable() {
    const tbody = document.getElementById('donationsTableBody');
    tbody.innerHTML = '';

    donations.forEach(donation => {
        const row = document.createElement('tr');
        const status = donation.status || 'pending';
        const statusText = getStatusText(status);
        const statusClass = getStatusClass(status);
        
        const deviceTypeText = getDeviceTypeText(donation.deviceType);
        const deviceConditionText = getDeviceConditionText(donation.deviceCondition);
        
        console.log('Admin panel - donation data:', donation);
        console.log('Admin panel - deviceType:', donation.deviceType);
        console.log('Admin panel - deviceCondition:', donation.deviceCondition);
        console.log('Admin panel - deviceTypeText:', deviceTypeText);
        console.log('Admin panel - deviceConditionText:', deviceConditionText);
        
        row.innerHTML = `
            <td>${donation._id ? donation._id.substring(0, 8) : 'N/A'}</td>
            <td>${donation.fullName || 'N/A'}</td>
            <td>${donation.phone || 'N/A'}</td>
            <td>
                <div style="font-weight: 500;">${deviceTypeText}</div>
                <div style="font-size: 0.8rem; color: #666;">${deviceConditionText}</div>
                <div style="font-size: 0.8rem; color: #888;">${donation.deviceBrand || ''} ${donation.deviceModel || ''}</div>
            </td>
            <td>
                <div style="font-size: 0.9rem;">${donation.email || 'E-posta yok'}</div>
                <div style="font-size: 0.8rem; color: #666;">${donation.city || 'Şehir belirtilmemiş'}</div>
            </td>
            <td><span class="status-badge ${statusClass}">${statusText}</span></td>
            <td>${new Date(donation.createdAt).toLocaleDateString('tr-TR')}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-small btn-view" data-action="view" data-id="${donation._id}">
                        <i class="fas fa-eye"></i> Görüntüle
                    </button>
                    <button class="btn-small btn-update" data-action="edit" data-id="${donation._id}">
                        <i class="fas fa-edit"></i> Düzenle
                    </button>
                    <button class="btn-small btn-delete" data-action="delete" data-id="${donation._id}">
                        <i class="fas fa-trash"></i> Sil
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function getStatusText(status) {
    const statusMap = {
        'pending': 'Bekliyor',
        'processing': 'İşlemde',
        'completed': 'Tamamlandı'
    };
    return statusMap[status] || 'Bekliyor';
}

function getStatusClass(status) {
    const classMap = {
        'pending': 'status-pending',
        'processing': 'status-processing',
        'completed': 'status-completed'
    };
    return classMap[status] || 'status-pending';
}

function getDeviceTypeText(deviceType) {
    const typeMap = {
        'laptop': 'Laptop',
        'desktop': 'Masaüstü Bilgisayar',
        'tablet': 'Tablet',
        'smartphone': 'Akıllı Telefon',
        'monitor': 'Monitör',
        'printer': 'Yazıcı',
        'other': 'Diğer',
        '': 'Belirtilmemiş'
    };
    return typeMap[deviceType] || 'Belirtilmemiş';
}

function getDeviceConditionText(deviceCondition) {
    const conditionMap = {
        'working': 'Çalışır Durumda',
        'partially_working': 'Kısmen Çalışır',
        'broken': 'Bozuk',
        'unknown': 'Bilinmiyor',
        '': 'Belirtilmemiş'
    };
    return conditionMap[deviceCondition] || 'Belirtilmemiş';
}

async function viewDonation(id) {
    try {
        const response = await fetch(`/api/donations/${id}`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.error || 'Bağış bulunamadı');
        }
        
        const donation = result.data;
        currentDonationId = id;
        document.getElementById('modalTitle').textContent = 'Bağış Detayları';
        
        const modalBody = document.getElementById('modalBody');
        modalBody.innerHTML = `
            <div class="form-row">
                <div class="form-field">
                    <label>Ad Soyad</label>
                    <input type="text" value="${donation.fullName || ''}" readonly>
                </div>
                <div class="form-field">
                    <label>Telefon</label>
                    <input type="text" value="${donation.phone || ''}" readonly>
                </div>
            </div>
            <div class="form-row">
                <div class="form-field">
                    <label>E-posta</label>
                    <input type="text" value="${donation.email || ''}" readonly>
                </div>
                <div class="form-field">
                    <label>Şehir</label>
                    <input type="text" value="${donation.city || ''}" readonly>
                </div>
            </div>
            <div class="form-field">
                <label>Adres</label>
                <textarea readonly>${donation.address || ''}</textarea>
            </div>
            <div class="form-row">
                <div class="form-field">
                    <label>Cihaz Türü</label>
                    <input type="text" value="${getDeviceTypeText(donation.deviceType)}" readonly>
                </div>
                <div class="form-field">
                    <label>Cihaz Durumu</label>
                    <input type="text" value="${getDeviceConditionText(donation.deviceCondition)}" readonly>
                </div>
            </div>
            <div class="form-row">
                <div class="form-field">
                    <label>Marka</label>
                    <input type="text" value="${donation.deviceBrand || ''}" readonly>
                </div>
                <div class="form-field">
                    <label>Model</label>
                    <input type="text" value="${donation.deviceModel || ''}" readonly>
                </div>
            </div>
            <div class="form-field">
                <label>Eşyanın İçeriği</label>
                <textarea readonly>${donation.deviceContent || ''}</textarea>
            </div>
            <div class="form-field">
                <label>Mesaj</label>
                <textarea readonly>${donation.message || ''}</textarea>
            </div>
            <div class="form-field">
                <label>Gönderim Tarihi</label>
                <input type="text" value="${new Date(donation.createdAt).toLocaleString('tr-TR')}" readonly>
            </div>
        `;
        
        document.getElementById('donationModal').style.display = 'block';
    } catch (error) {
        console.error('Error viewing donation:', error);
        alert('Bağış görüntülenirken hata oluştu: ' + error.message);
    }
}

async function editDonation(id) {
    try {
        const response = await fetch(`/api/donations/${id}`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.error || 'Bağış bulunamadı');
        }
        
        const donation = result.data;
        currentDonationId = id;
        document.getElementById('modalTitle').textContent = 'Bağış Düzenle';
        
        const modalBody = document.getElementById('modalBody');
        modalBody.innerHTML = `
            <form id="editForm">
                <div class="form-row">
                    <div class="form-field">
                        <label>Ad Soyad</label>
                        <input type="text" name="fullName" value="${donation.fullName || ''}" required>
                    </div>
                    <div class="form-field">
                        <label>Telefon</label>
                        <input type="text" name="phone" value="${donation.phone || ''}" required>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-field">
                        <label>E-posta</label>
                        <input type="email" name="email" value="${donation.email || ''}">
                    </div>
                    <div class="form-field">
                        <label>Şehir</label>
                        <input type="text" name="city" value="${donation.city || ''}">
                    </div>
                </div>
                <div class="form-field">
                    <label>Adres</label>
                    <textarea name="address">${donation.address || ''}</textarea>
                </div>
                <div class="form-row">
                    <div class="form-field">
                        <label>Cihaz Türü</label>
                        <select name="deviceType">
                            <option value="">Seçiniz...</option>
                            <option value="laptop" ${donation.deviceType === 'laptop' ? 'selected' : ''}>Laptop</option>
                            <option value="desktop" ${donation.deviceType === 'desktop' ? 'selected' : ''}>Masaüstü Bilgisayar</option>
                            <option value="tablet" ${donation.deviceType === 'tablet' ? 'selected' : ''}>Tablet</option>
                            <option value="smartphone" ${donation.deviceType === 'smartphone' ? 'selected' : ''}>Akıllı Telefon</option>
                            <option value="monitor" ${donation.deviceType === 'monitor' ? 'selected' : ''}>Monitör</option>
                            <option value="printer" ${donation.deviceType === 'printer' ? 'selected' : ''}>Yazıcı</option>
                            <option value="other" ${donation.deviceType === 'other' ? 'selected' : ''}>Diğer</option>
                        </select>
                    </div>
                    <div class="form-field">
                        <label>Cihaz Durumu</label>
                        <select name="deviceCondition">
                            <option value="">Seçiniz...</option>
                            <option value="working" ${donation.deviceCondition === 'working' ? 'selected' : ''}>Çalışır Durumda</option>
                            <option value="partially_working" ${donation.deviceCondition === 'partially_working' ? 'selected' : ''}>Kısmen Çalışır</option>
                            <option value="broken" ${donation.deviceCondition === 'broken' ? 'selected' : ''}>Bozuk</option>
                            <option value="unknown" ${donation.deviceCondition === 'unknown' ? 'selected' : ''}>Bilinmiyor</option>
                        </select>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-field">
                        <label>Marka</label>
                        <input type="text" name="deviceBrand" value="${donation.deviceBrand || ''}">
                    </div>
                    <div class="form-field">
                        <label>Model</label>
                        <input type="text" name="deviceModel" value="${donation.deviceModel || ''}">
                    </div>
                </div>
                <div class="form-field">
                    <label>Durum</label>
                    <select name="status">
                        <option value="pending" ${donation.status === 'pending' || !donation.status ? 'selected' : ''}>Bekliyor</option>
                        <option value="processing" ${donation.status === 'processing' ? 'selected' : ''}>İşlemde</option>
                        <option value="completed" ${donation.status === 'completed' ? 'selected' : ''}>Tamamlandı</option>
                        <option value="cancelled" ${donation.status === 'cancelled' ? 'selected' : ''}>İptal Edildi</option>
                    </select>
                </div>
                <div class="form-field">
                    <label>Admin Notları</label>
                    <textarea name="adminNotes">${donation.adminNotes || ''}</textarea>
                </div>
                <div class="form-field">
                    <label>Eşyanın İçeriği</label>
                    <textarea name="deviceContent">${donation.deviceContent || ''}</textarea>
                </div>
                <div class="form-field">
                    <label>Mesaj</label>
                    <textarea name="message">${donation.message || ''}</textarea>
                </div>
                <div style="text-align: center; margin-top: 2rem;">
                    <button type="submit" style="background: #28a745; color: white; border: none; padding: 1rem 2rem; border-radius: 8px; cursor: pointer; font-size: 1rem;">
                        <i class="fas fa-save"></i> Kaydet
                    </button>
                </div>
            </form>
        `;
        
        document.getElementById('donationModal').style.display = 'block';

        // Handle form submission
        document.getElementById('editForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            const updatedData = Object.fromEntries(formData);
            
            try {
                const updateResponse = await fetch(`/api/donations/${currentDonationId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${authToken}`
                    },
                    body: JSON.stringify(updatedData)
                });
                
                const updateResult = await updateResponse.json();
                
                if (updateResponse.ok) {
                    await loadDonations();
                    closeModal();
                    alert('Bağış başarıyla güncellendi!');
                } else {
                    throw new Error(updateResult.error || 'Güncelleme başarısız');
                }
            } catch (error) {
                console.error('Error updating donation:', error);
                alert('Güncelleme sırasında hata oluştu: ' + error.message);
            }
        });
    } catch (error) {
        console.error('Error loading donation for edit:', error);
        alert('Bağış yüklenirken hata oluştu: ' + error.message);
    }
}

async function deleteDonation(id) {
    if (confirm('Bu bağışı silmek istediğinizden emin misiniz?')) {
        try {
            const response = await fetch(`/api/donations/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });
            
            const result = await response.json();
            
            if (response.ok) {
                await loadDonations();
                alert('Bağış başarıyla silindi!');
            } else {
                throw new Error(result.error || 'Silme işlemi başarısız');
            }
        } catch (error) {
            console.error('Error deleting donation:', error);
            alert('Silme işlemi sırasında hata oluştu: ' + error.message);
        }
    }
}

function closeModal() {
    document.getElementById('donationModal').style.display = 'none';
    currentDonationId = null;
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('donationModal');
    if (event.target === modal) {
        closeModal();
    }
}

// Add event listeners for elements that had inline handlers
document.addEventListener('DOMContentLoaded', function() {
    // Force show login form on every page load
    document.getElementById('loginContainer').style.display = 'block';
    document.getElementById('dashboardContainer').style.display = 'none';
    
    // Clear any existing tokens for security
    localStorage.removeItem('adminToken');
    sessionStorage.removeItem('adminToken');
    authToken = null;
    
    // Add security event listeners
    window.addEventListener('beforeunload', function() {
        // Clear sensitive data when leaving the page
        authToken = null;
        donations = [];
        currentDonationId = null;
    });
    
    // Clear session on page visibility change (tab switching)
    document.addEventListener('visibilitychange', function() {
        if (document.hidden) {
            // Optional: Clear session when tab becomes hidden
            // authToken = null;
        }
    });
    
    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
    
    // Close modal button
    const closeModalBtn = document.getElementById('closeModalBtn');
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeModal);
    }
    
    // Event delegation for action buttons
    document.addEventListener('click', function(e) {
        const action = e.target.closest('[data-action]');
        if (action) {
            const actionType = action.getAttribute('data-action');
            const donationId = action.getAttribute('data-id');
            
            switch(actionType) {
                case 'view':
                    viewDonation(donationId);
                    break;
                case 'edit':
                    editDonation(donationId);
                    break;
                case 'delete':
                    deleteDonation(donationId);
                    break;
            }
        }
    });
});

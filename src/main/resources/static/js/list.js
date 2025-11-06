console.log('list.js loaded successfully');

let currentUserId = null;
let allUsers = [];
let allRoles = [];

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded - initializing admin page');
    loadCurrentUser();
    loadRoles();
    loadUsers();
});

async function apiCall(url, options = {}) {
    try {
        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || `HTTP error! status: ${response.status}`);
        }

        const responseText = await response.text();

        try {
            return JSON.parse(responseText);
        } catch (e) {
            return responseText;
        }
    } catch (error) {
        console.error('API call failed:', error);
        throw error;
    }
}

async function loadCurrentUser() {
    try {
        const user = await apiCall('/api/user/info');
        document.getElementById('currentUsername').textContent = user.username;

        const rolesContainer = document.getElementById('currentUserRoles');
        rolesContainer.innerHTML = '';

        if (user.roles && user.roles.length > 0) {
            user.roles.forEach(role => {
                let roleName = '';

                if (typeof role === 'string') {
                    roleName = role;
                } else if (role.name) {
                    roleName = role.name;
                } else if (role.authority) {
                    roleName = role.authority;
                }

                roleName = roleName.replace('ROLE_', '');
                roleName = roleName.toUpperCase();

                const badge = document.createElement('span');
                badge.className = 'badge bg-info me-1';
                badge.textContent = roleName;
                rolesContainer.appendChild(badge);
            });
        } else {
            rolesContainer.innerHTML = '<span class="badge bg-secondary">No roles</span>';
        }
    } catch (error) {
        console.error('Failed to load current user:', error);
        document.getElementById('currentUsername').textContent = 'Error loading user';
    }
}

async function loadRoles() {
    try {
        document.getElementById('rolesLoading').style.display = 'block';
        allRoles = await apiCall('/api/admin/roles');
        renderRoles();
    } catch (error) {
        console.error('Failed to load roles:', error);
        showError('Failed to load roles: ' + error.message);
    } finally {
        document.getElementById('rolesLoading').style.display = 'none';
    }
}

async function loadUsers() {
    try {
        showLoading(true);
        allUsers = await apiCall('/api/admin/users');
        renderUsers();
        showLoading(false);
    } catch (error) {
        showLoading(false);
        showError('Failed to load users: ' + error.message);
    }
}

async function createUser(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const selectedRoles = getSelectedRoles('create');

    const userDto = {
        firstName: formData.get('firstName'),
        lastName: formData.get('lastName'),
        username: formData.get('username'),
        password: formData.get('password'),
        roles: selectedRoles
    };

    try {
        document.getElementById('createUserBtn').disabled = true;

        await apiCall('/api/admin/users', {
            method: 'POST',
            body: JSON.stringify(userDto)
        });

        event.target.reset();
        document.getElementById('createUserSuccessMessage').style.display = 'block';
        document.getElementById('createUserErrorMessage').style.display = 'none';

        loadUsers();

        setTimeout(() => {
            switchToAllUsers();
        }, 1500);

    } catch (error) {
        document.getElementById('createUserErrorText').textContent = error.message;
        document.getElementById('createUserErrorMessage').style.display = 'block';
        document.getElementById('createUserSuccessMessage').style.display = 'none';
    } finally {
        document.getElementById('createUserBtn').disabled = false;
    }
}

async function updateUser(event) {
    event.preventDefault();

    const userId = document.getElementById('editUserId').value;
    const selectedRoles = getSelectedRoles('edit');

    const userDto = {
        firstName: document.getElementById('editFirstName').value,
        lastName: document.getElementById('editLastName').value,
        username: document.getElementById('editUsername').value,
        password: document.getElementById('editPassword').value || null,
        roles: selectedRoles
    };

    try {
        document.getElementById('updateUserBtn').disabled = true;

        await apiCall(`/api/admin/users/${userId}`, {
            method: 'PUT',
            body: JSON.stringify(userDto)
        });

        bootstrap.Modal.getInstance(document.getElementById('editUserModal')).hide();
        loadUsers();

    } catch (error) {
        alert('Failed to update user: ' + error.message);
    } finally {
        document.getElementById('updateUserBtn').disabled = false;
    }
}

async function deleteUser() {
    if (!currentUserId) return;

    if (!confirm('Are you sure you want to delete this user?')) {
        return;
    }

    try {
        document.getElementById('deleteUserBtn').disabled = true;

        await apiCall(`/api/admin/users/${currentUserId}`, {
            method: 'DELETE'
        });

        bootstrap.Modal.getInstance(document.getElementById('viewDeleteUserModal')).hide();
        loadUsers();

    } catch (error) {
        alert('Failed to delete user: ' + error.message);
    } finally {
        document.getElementById('deleteUserBtn').disabled = false;
    }
}

function renderRoles() {
    const createContainer = document.getElementById('rolesContainer');
    createContainer.innerHTML = allRoles.map(role => `
        <div class="form-check">
            <input class="form-check-input" type="checkbox"
                   id="create_role_${role.id}"
                   value="${role.id}"
                   name="roleIds">
            <label class="form-check-label" for="create_role_${role.id}">
                ${role.name.replace('ROLE_', '').toUpperCase()}
            </label>
        </div>
    `).join('');

    const editContainer = document.getElementById('editRolesContainer');
    editContainer.innerHTML = allRoles.map(role => `
        <div class="form-check">
            <input class="form-check-input role-checkbox" type="checkbox"
                   id="edit_role_${role.id}"
                   value="${role.id}"
                   name="roleIds">
            <label class="form-check-label" for="edit_role_${role.id}">
                ${role.name.replace('ROLE_', '').toUpperCase()}
            </label>
        </div>
    `).join('');
}

function renderUsers() {
    const tbody = document.getElementById('usersTableBody');

    if (allUsers.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">No users found</td></tr>';
        return;
    }

    tbody.innerHTML = allUsers.map(user => {
        let roleBadges = '<span class="badge bg-secondary">No roles</span>';

        if (user.roles && user.roles.length > 0) {
            roleBadges = user.roles.map(role => {
                let roleName = '';

                if (typeof role === 'string') {
                    roleName = role;
                } else if (role.name) {
                    roleName = role.name;
                } else if (role.authority) {
                    roleName = role.authority;
                }

                roleName = roleName.replace('ROLE_', '');
                roleName = roleName.toUpperCase();

                return `<span class="badge bg-primary me-1">${roleName}</span>`;
            }).join(' ');
        }

        return `
        <tr>
            <td>${user.id}</td>
            <td>${user.username}</td>
            <td>${user.firstName}</td>
            <td>${user.lastName}</td>
            <td>${roleBadges}</td>
            <td>
                <button type="button" class="btn btn-warning btn-sm" onclick="openEditModal(${user.id})">
                    Edit
                </button>
                <button type="button" class="btn btn-danger btn-sm" onclick="openViewDeleteModal(${user.id})">
                    Delete
                </button>
            </td>
        </tr>
    `;
    }).join('');
}

function openViewDeleteModal(userId) {
    const user = allUsers.find(u => u.id === userId);
    if (!user) return;

    currentUserId = userId;

    document.getElementById('viewDeleteUsername').value = user.username;
    document.getElementById('viewDeleteFirstName').value = user.firstName;
    document.getElementById('viewDeleteLastName').value = user.lastName;

    const rolesContainer = document.getElementById('viewDeleteRoles');

    if (user.roles && user.roles.length > 0) {
        const roleBadges = user.roles.map(role => {
            let roleName = '';
            if (typeof role === 'string') {
                roleName = role;
            } else if (role.name) {
                roleName = role.name;
            }
            roleName = roleName.replace('ROLE_', '');
            roleName = roleName.toUpperCase();
            return `<span class="badge bg-primary me-1">${roleName}</span>`;
        }).join('');
        rolesContainer.innerHTML = roleBadges;
    } else {
        rolesContainer.innerHTML = '<span class="badge bg-secondary">No roles</span>';
    }

    const modal = new bootstrap.Modal(document.getElementById('viewDeleteUserModal'));
    modal.show();
}

async function openEditModal(userId) {
    try {
        const user = await apiCall(`/api/admin/users/${userId}`);

        currentUserId = userId;
        document.getElementById('editUserId').value = user.id;
        document.getElementById('editUsername').value = user.username;
        document.getElementById('editFirstName').value = user.firstName;
        document.getElementById('editLastName').value = user.lastName;
        document.getElementById('editPassword').value = '';

        document.querySelectorAll('#editRolesContainer input[type="checkbox"]').forEach(checkbox => {
            checkbox.checked = false;
        });

        if (user.roles && user.roles.length > 0) {
            user.roles.forEach(roleName => {
                // Convert role name to uppercase for matching
                const uppercaseRoleName = roleName.replace('ROLE_', '').toUpperCase();
                const roleElement = Array.from(document.querySelectorAll('#editRolesContainer label'))
                    .find(label => label.textContent.trim() === uppercaseRoleName);
                if (roleElement) {
                    const checkbox = roleElement.previousElementSibling;
                    checkbox.checked = true;
                }
            });
        }

        const modal = new bootstrap.Modal(document.getElementById('editUserModal'));
        modal.show();

    } catch (error) {
        alert('Failed to load user: ' + error.message);
    }
}

function getSelectedRoles(context) {
    const containerId = context === 'create' ? 'rolesContainer' : 'editRolesContainer';
    const checkboxes = document.querySelectorAll(`#${containerId} input[type="checkbox"]:checked`);

    return Array.from(checkboxes).map(checkbox => {
        const roleId = parseInt(checkbox.value);
        return allRoles.find(role => role.id === roleId);
    }).filter(role => role !== undefined);
}

function showLoading(show) {
    const spinner = document.getElementById('usersLoading');
    const tableContainer = document.getElementById('usersTableContainer');

    if (show) {
        spinner.style.display = 'block';
        tableContainer.style.display = 'none';
    } else {
        spinner.style.display = 'none';
        tableContainer.style.display = 'block';
    }
}

function showError(message) {
    const errorElement = document.getElementById('errorMessage');
    errorElement.textContent = message;
    errorElement.style.display = 'block';
    setTimeout(() => {
        errorElement.style.display = 'none';
    }, 5000);
}

function switchToAllUsers() {
    const allUsersTab = new bootstrap.Tab(document.getElementById('all-users-tab'));
    allUsersTab.show();
}

function preventSpacesAndSpecialChars(event) {
    if ([8, 9, 13, 27, 46].includes(event.keyCode) ||
        (event.ctrlKey && [65, 67, 86, 88].includes(event.keyCode))) {
        return true;
    }

    const charCode = event.keyCode || event.which;
    const charStr = String.fromCharCode(charCode);

    if (!/^[a-zA-Z0-9]$/.test(charStr)) {
        event.preventDefault();
        return false;
    }
    return true;
}

function validateEditUsername(input) {
    input.value = input.value.replace(/[^a-zA-Z0-9]/g, '');
    if (input.checkValidity()) {
        input.classList.remove('is-invalid');
        input.classList.add('is-valid');
    } else {
        input.classList.remove('is-valid');
        input.classList.add('is-invalid');
    }
}

function validateEditPassword(input) {
    if (input.value.includes(' ')) {
        input.value = input.value.replace(/\s/g, '');
    }
    if (input.value === '' || input.checkValidity()) {
        input.classList.remove('is-invalid');
        input.classList.add('is-valid');
    } else {
        input.classList.remove('is-valid');
        input.classList.add('is-invalid');
    }
}

function preventSpaces(event) {
    if (event.key === ' ') {
        event.preventDefault();
        return false;
    }
    return true;
}

function validateUsername(input) {
    input.value = input.value.replace(/[^a-zA-Z0-9]/g, '');
    if (input.checkValidity()) {
        input.classList.remove('is-invalid');
        input.classList.add('is-valid');
    } else {
        input.classList.remove('is-valid');
        input.classList.add('is-invalid');
    }
}

function validatePassword(input) {
    if (input.value.includes(' ')) {
        input.value = input.value.replace(/\s/g, '');
    }
    if (input.checkValidity()) {
        input.classList.remove('is-invalid');
        input.classList.add('is-valid');
    } else {
        input.classList.remove('is-valid');
        input.classList.add('is-invalid');
    }
}

function validateLetters(input) {
    input.value = input.value.replace(/[^\p{L}\s]/gu, '');
    if (input.checkValidity()) {
        input.classList.remove('is-invalid');
        input.classList.add('is-valid');
    } else {
        input.classList.remove('is-valid');
        input.classList.add('is-invalid');
    }
}
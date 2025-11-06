document.addEventListener('DOMContentLoaded', function() {
    loadCurrentUser();
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

        let userRoles = [];
        if (user.roles && user.roles.length > 0) {
            user.roles.forEach(role => {
                let roleName = '';
                if (typeof role === 'string') {
                    roleName = role;
                } else if (role.name) {
                    roleName = role.name;
                }
                roleName = roleName.replace('ROLE_', '');

                const badge = document.createElement('span');
                badge.className = 'badge bg-info me-1';
                badge.textContent = roleName;
                rolesContainer.appendChild(badge);

                userRoles.push(roleName);
            });
        }

        updateNavigation(userRoles);

        const tbody = document.getElementById('userTableBody');
        let roleBadges = '<span class="badge bg-secondary">No roles</span>';
        if (user.roles && user.roles.length > 0) {
            roleBadges = user.roles.map(role => {
                let roleName = '';
                if (typeof role === 'string') {
                    roleName = role;
                } else if (role.name) {
                    roleName = role.name;
                }
                roleName = roleName.replace('ROLE_', '');
                return `<span class="badge bg-primary me-1">${roleName}</span>`;
            }).join(' ');
        }

        tbody.innerHTML = `
            <tr>
                <td>${user.id}</td>
                <td>${user.username}</td>
                <td>${user.firstName}</td>
                <td>${user.lastName}</td>
                <td>${roleBadges}</td>
            </tr>
        `;

    } catch (error) {
        console.error('Failed to load user info:', error);
        document.getElementById('currentUsername').textContent = 'Error loading user';
    }
}

function updateNavigation(userRoles) {
    const navigationContainer = document.getElementById('navigationLinks');

    let navigationHTML = `
        <a href="/user/info" class="nav-link btn btn-outline-primary mb-2 text-start">
            User
        </a>
    `;

    const hasAdminRole = userRoles.some(role =>
        role.toLowerCase() === 'admin'
    );

    if (hasAdminRole) {
        navigationHTML += `
            <a href="/admin/users" class="nav-link btn btn-outline-success mb-2 text-start">
                Admin
            </a>
        `;
    }

    navigationContainer.innerHTML = navigationHTML;
}
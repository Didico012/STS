// Sample data structure
let vehicles = JSON.parse(localStorage.getItem('vehicles')) || [];

// DOM Elements
const vehiclesGrid = document.getElementById('vehiclesGrid');
const filterButtons = document.querySelectorAll('.filter-btn');
const modal = document.getElementById('vehicleModal');
const modalContent = document.getElementById('vehicleDetails');
const closeBtn = document.querySelector('.close');

// Filter buttons functionality
filterButtons.forEach(button => {
    button.addEventListener('click', () => {
        filterButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        displayVehicles(button.dataset.filter);
    });
});

// Display vehicles based on filter
function displayVehicles(filter = 'all') {
    const filteredVehicles = filter === 'all' 
        ? vehicles 
        : vehicles.filter(vehicle => vehicle.status === filter);

    vehiclesGrid.innerHTML = filteredVehicles.map(vehicle => `
        <div class="vehicle-card" data-id="${vehicle.id}">
            <img src="${vehicle.photos?.[0]?.url || 'placeholder.jpg'}" alt="Viatura ${vehicle.regFab}" class="vehicle-photo">
            <div class="vehicle-info">
                <h3>REG-FAB: ${vehicle.regFab}</h3>
                <p>Placa: ${vehicle.plate}</p>
                <p>Data de Entrada: ${new Date(vehicle.entryDate).toLocaleDateString()}</p>
                <span class="status-badge status-${vehicle.status}">
                    ${getStatusText(vehicle.status)}
                </span>
            </div>
        </div>
    `).join('');

    // Add click event listeners to cards
    document.querySelectorAll('.vehicle-card').forEach(card => {
        card.addEventListener('click', () => showVehicleDetails(card.dataset.id));
    });
}

// Status text helper
function getStatusText(status) {
    const statusMap = {
        'available': 'Disponível',
        'unavailable': 'Baixada',
        'external': 'Oficina Externa'
    };
    return statusMap[status];
}

// Show vehicle details in modal with edit functionality
function showVehicleDetails(vehicleId) {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    if (!vehicle) return;

    modalContent.innerHTML = `
        <h2>Detalhes da Viatura</h2>
        <div class="vehicle-photos">
            ${vehicle.photos?.map((photo, index) => `
                <div class="photo-item">
                    <img src="${photo.url}" alt="Viatura ${vehicle.regFab} - Foto ${index + 1}" style="max-width: 200px;">
                    <p>${new Date(photo.date).toLocaleDateString()}</p>
                    <p>${photo.description || ''}</p>
                </div>
            `).join('') || ''}
        </div>
        <form id="editVehicleForm" class="edit-form">
            <div class="form-group">
                <label>REG-FAB: ${vehicle.regFab}</label>
            </div>
            <div class="form-group">
                <label>Placa: ${vehicle.plate}</label>
            </div>
            <div class="form-group">
                <label for="editStatus">Status:</label>
                <select id="editStatus" name="status" required>
                    <option value="available" ${vehicle.status === 'available' ? 'selected' : ''}>Disponível</option>
                    <option value="unavailable" ${vehicle.status === 'unavailable' ? 'selected' : ''}>Baixada</option>
                    <option value="external" ${vehicle.status === 'external' ? 'selected' : ''}>Oficina Externa</option>
                </select>
            </div>
            <div class="form-group workshop-fields" style="display: ${vehicle.status === 'external' ? 'block' : 'none'}">
                <label for="editWorkshop">Oficina:</label>
                <input type="text" id="editWorkshop" name="workshop" value="${vehicle.workshop || ''}">
            </div>
            <div class="form-group workshop-fields" style="display: ${vehicle.status === 'external' ? 'block' : 'none'}">
                <label for="editBudget">Orçamento (R$):</label>
                <input type="number" id="editBudget" name="budget" step="0.01" value="${vehicle.budget || ''}">
            </div>
            <div class="form-group">
                <label for="editIssue">Observações:</label>
                <textarea id="editIssue" name="issue">${vehicle.issue || ''}</textarea>
            </div>
            <div class="form-group">
                <label for="editReleaseDate">Data de Liberação:</label>
                <input type="date" id="editReleaseDate" name="releaseDate" value="${vehicle.releaseDate || ''}">
            </div>
            <div class="form-group">
                <label for="newPhoto">Adicionar Nova Foto:</label>
                <input type="file" id="newPhoto" accept="image/*">
                <input type="text" id="photoDescription" placeholder="Descrição da foto">
            </div>
            <button type="submit" class="submit-btn">Salvar Alterações</button>
        </form>
        <h3>Histórico</h3>
        <div class="history-list">
            ${vehicle.history.map(entry => `
                <div class="history-item">
                    <p><strong>${new Date(entry.date).toLocaleDateString()}</strong></p>
                    <p>Status: ${getStatusText(entry.status)}</p>
                    <p>${entry.description}</p>
                    ${entry.workshop ? `<p>Oficina: ${entry.workshop}</p>` : ''}
                    ${entry.budget ? `<p>Orçamento: R$ ${entry.budget.toFixed(2)}</p>` : ''}
                    ${entry.releaseDate ? `<p>Data de Liberação: ${new Date(entry.releaseDate).toLocaleDateString()}</p>` : ''}
                </div>
            `).join('')}
        </div>
    `;

    // Add event listeners for the edit form
    const editForm = document.getElementById('editVehicleForm');
    const statusSelect = document.getElementById('editStatus');
    const workshopFields = document.querySelectorAll('.workshop-fields');

    statusSelect.addEventListener('change', () => {
        const isExternal = statusSelect.value === 'external';
        workshopFields.forEach(field => {
            field.style.display = isExternal ? 'block' : 'none';
        });
    });

    editForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const newPhoto = document.getElementById('newPhoto');
        let photoUrl = '';

        if (newPhoto.files.length > 0) {
            const file = newPhoto.files[0];
            photoUrl = await convertToBase64(file);
            
            const photoDescription = document.getElementById('photoDescription').value;
            if (!vehicle.photos) vehicle.photos = [];
            vehicle.photos.push({
                url: photoUrl,
                date: new Date().toISOString(),
                description: photoDescription
            });
        }

        const newStatus = statusSelect.value;
        const newWorkshop = document.getElementById('editWorkshop').value;
        const newBudget = parseFloat(document.getElementById('editBudget').value) || 0;
        const newIssue = document.getElementById('editIssue').value;
        const newReleaseDate = document.getElementById('editReleaseDate').value;

        // Add new history entry if status changed
        if (newStatus !== vehicle.status || newWorkshop !== vehicle.workshop || newBudget !== vehicle.budget) {
            vehicle.history.unshift({
                date: new Date().toISOString(),
                status: newStatus,
                description: newIssue,
                workshop: newWorkshop,
                budget: newBudget,
                releaseDate: newReleaseDate
            });
        }

        // Update vehicle
        vehicle.status = newStatus;
        vehicle.workshop = newWorkshop;
        vehicle.budget = newBudget;
        vehicle.issue = newIssue;
        vehicle.releaseDate = newReleaseDate;

        // Save to localStorage
        localStorage.setItem('vehicles', JSON.stringify(vehicles));

        // Refresh display
        displayVehicles();
        showVehicleDetails(vehicleId);
    });

    modal.style.display = 'block';
}

// Close modal functionality
closeBtn.addEventListener('click', () => {
    modal.style.display = 'none';
});

window.addEventListener('click', (event) => {
    if (event.target === modal) {
        modal.style.display = 'none';
    }
});

// Helper function to convert file to base64
function convertToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

// Initial display
displayVehicles();
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('vehicleForm');
    const statusSelect = document.getElementById('status');
    const workshopFields = document.querySelectorAll('.workshop-fields');

    // Show/hide workshop fields based on status
    statusSelect.addEventListener('change', () => {
        const isExternal = statusSelect.value === 'external';
        workshopFields.forEach(field => {
            field.style.display = isExternal ? 'block' : 'none';
        });
    });

    // Handle form submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const photoInput = document.getElementById('photo');
        let photoUrl = '';

        // Convert photo to base64 if provided
        if (photoInput.files.length > 0) {
            const file = photoInput.files[0];
            photoUrl = await convertToBase64(file);
        }

        const vehicle = {
            id: generateId(),
            regFab: document.getElementById('regFab').value,
            plate: document.getElementById('plate').value,
            entryDate: document.getElementById('entryDate').value,
            status: statusSelect.value,
            workshop: document.getElementById('workshop').value,
            budget: parseFloat(document.getElementById('budget').value) || 0,
            issue: document.getElementById('issue').value,
            photos: photoUrl ? [{
                url: photoUrl,
                date: new Date().toISOString(),
                description: 'Foto inicial'
            }] : [],
            history: [{
                date: new Date().toISOString(),
                status: statusSelect.value,
                description: document.getElementById('issue').value,
                workshop: document.getElementById('workshop').value,
                budget: parseFloat(document.getElementById('budget').value) || 0
            }]
        };

        // Save to localStorage
        const vehicles = JSON.parse(localStorage.getItem('vehicles')) || [];
        vehicles.push(vehicle);
        localStorage.setItem('vehicles', JSON.stringify(vehicles));

        // Reset form and show success message
        form.reset();
        alert('Viatura cadastrada com sucesso!');
        window.location.href = 'index.html';
    });
});

// Helper functions
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function convertToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}
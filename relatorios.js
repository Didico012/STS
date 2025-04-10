document.addEventListener('DOMContentLoaded', () => {
    const generateReportBtn = document.getElementById('generateReport');
    const reportResults = document.getElementById('reportResults');

    generateReportBtn.addEventListener('click', generateReport);

    function generateReport() {
        const dateStart = document.getElementById('dateStart').value;
        const dateEnd = document.getElementById('dateEnd').value;

        if (!dateStart || !dateEnd) {
            alert('Por favor, selecione as datas inicial e final.');
            return;
        }

        const vehicles = JSON.parse(localStorage.getItem('vehicles')) || [];
        const filteredVehicles = filterVehiclesByDate(vehicles, dateStart, dateEnd);
        const stats = calculateStats(filteredVehicles);

        displayReport(stats, filteredVehicles);
    }

    function filterVehiclesByDate(vehicles, start, end) {
        const startDate = new Date(start);
        const endDate = new Date(end);
        
        return vehicles.filter(vehicle => {
            const entryDate = new Date(vehicle.entryDate);
            return entryDate >= startDate && entryDate <= endDate;
        });
    }

    function calculateStats(vehicles) {
        return {
            total: vehicles.length,
            available: vehicles.filter(v => v.status === 'available').length,
            unavailable: vehicles.filter(v => v.status === 'unavailable').length,
            external: vehicles.filter(v => v.status === 'external').length,
            totalBudget: vehicles
                .filter(v => v.status === 'external')
                .reduce((sum, v) => sum + (v.budget || 0), 0)
        };
    }

    function displayReport(stats, vehicles) {
        reportResults.innerHTML = `
            <div class="report-summary">
                <h3>Resumo do Período</h3>
                <div class="stats-grid">
                    <div class="stat-item">
                        <h4>Total de Viaturas</h4>
                        <p>${stats.total}</p>
                    </div>
                    <div class="stat-item">
                        <h4>Disponíveis</h4>
                        <p>${stats.available}</p>
                    </div>
                    <div class="stat-item">
                        <h4>Baixadas</h4>
                        <p>${stats.unavailable}</p>
                    </div>
                    <div class="stat-item">
                        <h4>Em Oficina</h4>
                        <p>${stats.external}</p>
                    </div>
                    <div class="stat-item">
                        <h4>Total em Manutenção</h4>
                        <p>R$ ${stats.totalBudget.toFixed(2)}</p>
                    </div>
                </div>
            </div>

            <div class="vehicles-list">
                <h3>Lista de Viaturas no Período</h3>
                <table>
                    <thead>
                        <tr>
                            <th>REG-FAB</th>
                            <th>Placa</th>
                            <th>Status</th>
                            <th>Data de Entrada</th>
                            <th>Oficina</th>
                            <th>Orçamento</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${vehicles.map(vehicle => `
                            <tr>
                                <td>${vehicle.regFab}</td>
                                <td>${vehicle.plate}</td>
                                <td>${getStatusText(vehicle.status)}</td>
                                <td>${new Date(vehicle.entryDate).toLocaleDateString()}</td>
                                <td>${vehicle.workshop || '-'}</td>
                                <td>${vehicle.budget ? `R$ ${vehicle.budget.toFixed(2)}` : '-'}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    function getStatusText(status) {
        const statusMap = {
            'available': 'Disponível',
            'unavailable': 'Baixada',
            'external': 'Oficina Externa'
        };
        return statusMap[status];
    }
});
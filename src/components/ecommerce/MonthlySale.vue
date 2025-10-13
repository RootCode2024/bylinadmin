<template>
  <div
    class="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6"
  >
    <div class="flex items-center justify-between">
      <h3 class="text-lg font-semibold text-gray-800 dark:text-white/90">Statistiques mensuelles des ventes</h3>

      <div class="flex items-center gap-4">
        <!-- Sélecteur d'année -->
        <select 
          v-model="selectedYear" 
          @change="fetchMonthlySales"
          class="text-sm border border-gray-300 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option v-for="year in availableYears" :key="year" :value="year">
            {{ year }}
          </option>
        </select>

        <div class="relative h-fit">
          <DropdownMenu :menu-items="menuItems">
            <template #icon>
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M10.2441 6C10.2441 5.0335 11.0276 4.25 11.9941 4.25H12.0041C12.9706 4.25 13.7541 5.0335 13.7541 6C13.7541 6.9665 12.9706 7.75 12.0041 7.75H11.9941C11.0276 7.75 10.2441 6.9665 10.2441 6ZM10.2441 18C10.2441 17.0335 11.0276 16.25 11.9941 16.25H12.0041C12.9706 16.25 13.7541 17.0335 13.7541 18C13.7541 18.9665 12.9706 19.75 12.0041 19.75H11.9941C11.0276 19.75 10.2441 18.9665 10.2441 18ZM11.9941 10.25C11.0276 10.25 10.2441 11.0335 10.2441 12C10.2441 12.9665 11.0276 13.75 11.9941 13.75H12.0041C12.9706 13.75 13.7541 12.9665 13.7541 12C13.7541 11.0335 12.9706 10.25 12.0041 10.25H11.9941Z"
                  fill="currentColor"
                />
              </svg>
            </template>
          </DropdownMenu>
        </div>
      </div>
    </div>

    <!-- Indicateur de chargement -->
    <div v-if="loading" class="flex justify-center items-center h-40">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>

    <!-- Graphique avec v-if pour éviter l'erreur ApexCharts -->
    <div v-else class="max-w-full overflow-x-auto custom-scrollbar">
      <div id="chartOne" class="-ml-5 min-w-[650px] xl:min-w-full pl-2">
        <!-- ApexCharts ne se rend que lorsque les données sont prêtes -->
        <VueApexCharts 
          v-if="chartDataReady"
          type="bar" 
          height="180" 
          :options="chartOptions" 
          :series="series" 
        />
        <!-- Message si pas de données -->
        <div v-else class="flex justify-center items-center h-40 text-gray-500">
          Aucune donnée disponible
        </div>
      </div>
    </div>

    <!-- Statistiques supplémentaires -->
    <div v-if="!loading && chartDataReady" class="mt-4 grid grid-cols-3 gap-4 text-sm">
      <div class="text-center p-3 bg-gray-50 rounded-lg">
        <div class="text-gray-600">Commandes totales</div>
        <div class="font-semibold text-lg text-gray-800">
          {{ totalOrders.toLocaleString() }}
        </div>
      </div>
      <div class="text-center p-3 bg-gray-50 rounded-lg">
        <div class="text-gray-600">Ventes totales</div>
        <div class="font-semibold text-lg text-gray-800">
          {{ formatCurrency(totalSales) }}
        </div>
      </div>
      <div class="text-center p-3 bg-gray-50 rounded-lg">
        <div class="text-gray-600">Panier moyen</div>
        <div class="font-semibold text-lg text-gray-800">
          {{ formatCurrency(averageOrderValue) }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue'
import DropdownMenu from '../common/DropdownMenu.vue'
import api from '@/api/axiosConfig.js'

const menuItems = [
  { label: 'Export Data', onClick: () => exportData() },
  { label: 'Refresh', onClick: () => fetchMonthlySales() },
]

import VueApexCharts from 'vue3-apexcharts'

// Réactifs
const loading = ref(false)
const selectedYear = ref(new Date().getFullYear())
const availableYears = ref([])
const totalOrders = ref(0)
const totalSales = ref(0)
const averageOrderValue = ref(0)
const chartDataReady = ref(false) // Nouveau flag pour ApexCharts

const series = ref([
  {
    name: 'Sales',
    data: [],
  },
])

const chartOptions = ref({
  colors: ['#465fff'],
  chart: {
    fontFamily: 'Outfit, sans-serif',
    type: 'bar',
    toolbar: {
      show: false,
    },
    animations: {
      enabled: true,
      easing: 'easeinout',
      speed: 800,
    }
  },
  plotOptions: {
    bar: {
      horizontal: false,
      columnWidth: '39%',
      borderRadius: 5,
      borderRadiusApplication: 'end',
    },
  },
  dataLabels: {
    enabled: false,
  },
  stroke: {
    show: true,
    width: 4,
    colors: ['transparent'],
  },
  xaxis: {
    categories: [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ],
    axisBorder: {
      show: false,
    },
    axisTicks: {
      show: false,
    },
    labels: {
      style: {
        colors: '#6B7280',
        fontSize: '12px',
        fontFamily: 'Outfit, sans-serif',
      },
    },
  },
  yaxis: {
    title: false,
    labels: {
      formatter: function (value) {
        return formatCurrency(value);
      },
      style: {
        colors: '#6B7280',
        fontSize: '12px',
        fontFamily: 'Outfit, sans-serif',
      },
    },
  },
  grid: {
    yaxis: {
      lines: {
        show: true,
      },
    },
  },
  fill: {
    opacity: 1,
  },
  tooltip: {
    x: {
      show: false,
    },
    y: {
      formatter: function (val) {
        return formatCurrency(val);
      },
    },
  },
})

// Fonctions
const fetchMonthlySales = async () => {
  loading.value = true;
  chartDataReady.value = false; // Reset du flag
  
  try {
    const response = await api.get('/monthly-sales-complete', {
      params: { year: selectedYear.value }
    });

    console.log(response)

    // CORRECTION : Vérification sécurisée de la réponse
    if (response && response.data && response.status === 'success') {
      const data = response.data;
      
      // Mettre à jour le graphique
      if (data && data.sales && data.labels) {
        series.value[0].data = data.sales;
        chartOptions.value.xaxis.categories = data.labels;
        
        // Mettre à jour les statistiques avec des valeurs par défaut
        totalOrders.value = data.totalOrders || 0;
        totalSales.value = data.totalSales || 0;
        averageOrderValue.value = data.averageOrderValue || 0;
        
        // Attendre le prochain tick pour s'assurer que le DOM est mis à jour
        await nextTick();
        chartDataReady.value = true;
      }
    } else {
      console.warn('Réponse API invalide:', response);
      setFallbackData();
    }
  } catch (error) {
    console.error('Error fetching monthly sales:', error);
    setFallbackData();
  } finally {
    loading.value = false;
  }
}

const setFallbackData = () => {
  // Données de fallback sécurisées
  series.value[0].data = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  chartOptions.value.xaxis.categories = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];
  totalOrders.value = 0;
  totalSales.value = 0;
  averageOrderValue.value = 0;
  
  nextTick(() => {
    chartDataReady.value = true;
  });
}

const fetchAvailableYears = async () => {
  try {
    const response = await api.get('/available-years');

    console.log(response)
    
    // CORRECTION : La route retourne maintenant directement un tableau
    if (response && response.data && Array.isArray(response.data)) {
      availableYears.value = response.data;
    } else {
      // Fallback si la structure est différente
      availableYears.value = response?.years || [new Date().getFullYear()];
    }
  } catch (error) {
    console.error('Error fetching available years:', error);
    // Années par défaut sécurisées
    const currentYear = new Date().getFullYear();
    availableYears.value = [currentYear];
  }
}

const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return '0 XOF';
  
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

const exportData = () => {
  // Implémentez l'export des données si nécessaire
  console.log('Export data functionality');
}

// Cycle de vie
onMounted(() => {
  fetchAvailableYears();
  fetchMonthlySales();
})

// Watcher pour le changement d'année
watch(selectedYear, () => {
  fetchMonthlySales();
})
</script>
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useDataStore = defineStore('data', () => {
    // State
    const empresaSeleccionada = ref(null)
    const empresas = ref([])
    const isLoading = ref(false)

    // Getters
    const getEmpresaSeleccionada = computed(() => empresaSeleccionada.value)
    const getEmpresas = computed(() => empresas.value)
    const hasEmpresaSeleccionada = computed(() => !!empresaSeleccionada.value)

    // Actions
    function setEmpresaSeleccionada(empresa) {
        empresaSeleccionada.value = empresa
    }

    function setEmpresas(listaEmpresas) {
        empresas.value = listaEmpresas
    }

    function setLoading(loading) {
        isLoading.value = loading
    }

    function clearEmpresaSeleccionada() {
        empresaSeleccionada.value = null
    }

    function clearData() {
        empresaSeleccionada.value = null
        empresas.value = []
    }

    return {
        // State
        empresaSeleccionada,
        empresas,
        isLoading,
        // Getters
        getEmpresaSeleccionada,
        getEmpresas,
        hasEmpresaSeleccionada,
        // Actions
        setEmpresaSeleccionada,
        setEmpresas,
        setLoading,
        clearEmpresaSeleccionada,
        clearData
    }
}, {
    persist: {
        key: 'data-storage',
        storage: localStorage,
        paths: ['empresaSeleccionada']
    }
})

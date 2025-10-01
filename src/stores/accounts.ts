import { defineStore } from 'pinia'
import { ref } from 'vue'

export type AccountType = 'LDAP' | 'Local'

export interface Account {
    id: string
    labels: { text: string }[]
    type: AccountType
    login: string
    password: string | null
}

export const useAccountStore = defineStore('accounts', () => {
    const accounts = ref<Account[]>([])

    function addAccount() {
        accounts.value.push({
            id: crypto.randomUUID(),
            labels: [],
            type: 'LDAP',
            login: '',
            password: null,
        })
    }

    function updateAccount(updated: Account) {
        const idx = accounts.value.findIndex(a => a.id === updated.id)
        if (idx !== -1) accounts.value[idx] = { ...updated }
    }

    function deleteAccount(id: string) {
        accounts.value = accounts.value.filter(a => a.id !== id)
    }

    function loadFromStorage() {
        const data = localStorage.getItem('accounts')
        if (data) accounts.value = JSON.parse(data)
    }

    function saveToStorage() {
        localStorage.setItem('accounts', JSON.stringify(accounts.value))
    }

    return {
        accounts,
        addAccount,
        updateAccount,
        deleteAccount,
        loadFromStorage,
        saveToStorage,
    }
})
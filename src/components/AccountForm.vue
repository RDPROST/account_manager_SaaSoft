<template>
  <div class="pa-4">
    <v-row align="center" class="mb-2">
      <v-col>
        <h2 class="text-h6">Учетные записи</h2>
      </v-col>
      <v-col class="d-flex justify-end">
        <v-btn icon="mdi-plus" color="primary" @click="store.addAccount" />
      </v-col>
    </v-row>

    <v-alert type="info" variant="tonal" class="mb-4" density="comfortable">
      Для указания нескольких меток для одной пары логин/пароль используйте разделитель <strong>;</strong>
    </v-alert>

    <v-row class="font-weight-bold mb-1">
      <v-col cols="3">Метки</v-col>
      <v-col cols="2">Тип записи</v-col>
      <v-col :cols="hasPassword ? 3 : 6">Логин</v-col>
      <v-col v-if="hasPassword" cols="3">Пароль</v-col>
      <v-col cols="1"></v-col>
    </v-row>

    <v-row v-for="acc in store.accounts" :key="acc.id" class="align-center mb-2">
      <v-col cols="3">
        <v-text-field v-model="labelsRaw[acc.id]" density="compact" hide-details="auto" placeholder="Метка"
          maxlength="50" :rules="[rules.maxLabel]" @blur="saveLabels(acc)" />
      </v-col>

      <v-col cols="2">
        <v-select v-model="acc.type" :items="['LDAP', 'Local']" density="compact" hide-details="auto"
          :rules="[rules.required]" @update:model-value="() => onTypeChange(acc)" />
      </v-col>

      <v-col :cols="acc.type === 'Local' ? 3 : 6">
        <v-text-field v-model="acc.login" density="compact" hide-details="auto" placeholder="Логин" maxlength="100"
          :rules="[rules.required, rules.maxLogin]" @blur="saveAccount(acc)" />
      </v-col>

      <v-col v-if="acc.type === 'Local'" cols="3">
        <v-text-field v-model="acc.password" :type="showPassword[acc.id] ? 'text' : 'password'"
          :append-inner-icon="showPassword[acc.id] ? 'mdi-eye-off' : 'mdi-eye'"
          @click:append-inner="togglePassword(acc.id)" density="compact" hide-details="auto" placeholder="Пароль"
          maxlength="100" :rules="[rules.required, rules.maxPassword]" @blur="saveAccount(acc)" />
      </v-col>

      <v-col cols="1" class="d-flex justify-center">
        <v-btn icon="mdi-delete" color="error" variant="text" @click="store.deleteAccount(acc.id)" />
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue'
import { useAccountStore } from '../stores/accounts'
import type { Account } from '../stores/accounts'

const store = useAccountStore()
const labelsRaw = ref<Record<string, string>>({})
const showPassword = ref<Record<string, boolean>>({})

const hasPassword = computed(() =>
  store.accounts.some((acc: { type: string }) => acc.type === 'Local')
)

onMounted(() => {
  store.loadFromStorage()
  for (const acc of store.accounts) {
    labelsRaw.value[acc.id] = acc.labels.map(l => l.text).join(';')
    showPassword.value[acc.id] = false
  }
})

watch(
  () => store.accounts,
  () => {
    store.saveToStorage()
  },
  { deep: true }
)

const rules = {
  required: (v: string) => (!!v && v.trim().length > 0) || 'Обязательное поле',
  maxLabel: (v: string) =>
    !v || v.length <= 50 || 'Максимум 50 символов',
  maxLogin: (v: string) =>
    !v || v.length <= 100 || 'Максимум 100 символов',
  maxPassword: (v: string) =>
    !v || v.length <= 100 || 'Максимум 100 символов',
}

function saveLabels(acc: Account) {
  const raw = labelsRaw.value[acc.id] || ''
  acc.labels = raw
    .split(';')
    .filter(Boolean)
    .map(t => ({ text: t.trim() }))
  store.updateAccount(acc)
}

function saveAccount(acc: Account) {
  if (!acc.login) return
  if (acc.type === 'Local' && !acc.password) return
  store.updateAccount(acc)
}

function onTypeChange(acc: Account) {
  if (acc.type === 'LDAP') {
    acc.password = null
  }
  store.updateAccount(acc)
}

function togglePassword(id: string) {
  showPassword.value[id] = !showPassword.value[id]
}
</script>
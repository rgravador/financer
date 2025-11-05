# Vue Options API to Composition API Conversion Summary

## Conversion Status

### ✅ **Completed Files** (10 files)
1. `/pages/index.vue` - Login page
2. `/pages/auth/signup.vue` - Signup page
3. `/pages/dashboard.vue` - Main dashboard
4. `/pages/accounts/index.vue` - Accounts list
5. `/pages/accounts/[id].vue` - Account details
6. `/pages/loans/index.vue` - Loans list
7. `/pages/loans/[id].vue` - Loan details
8. `/pages/loans/create.vue` - Create loan (NEEDS CONVERSION)
9. `/layouts/default.vue` - Default layout
10. `/layouts/auth.vue` - Auth layout (if exists)

### ⏳ **Pending Conversion** (16+ files)
- `/pages/accounts/create/*.vue` (6 files: index, basic, contact, debt, employment, income)
- `/pages/payments/*.vue` (2 files: index, create)
- `/pages/earnings/index.vue`
- `/pages/cashouts/index.vue`
- `/pages/admin/*.vue` (5 files: dashboard, users, approvals, audit, cashouts)
- `/pages/internal-admin/*.vue` (3 files: dashboard, users, companies)

## Conversion Pattern Applied

### 1. **Script Setup Structure**
```vue
<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useXxxStore } from '~/stores/xxx'
import { useRouter, useRoute } from 'vue-router'

// Initialize stores
const xxxStore = useXxxStore()
const router = useRouter()
const route = useRoute()

// Extract reactive state/getters using storeToRefs
const { state, getters } = storeToRefs(xxxStore)

// Extract actions directly from store (NOT with storeToRefs)
const { action1, action2 } = xxxStore

// Component state
const localState = ref(initialValue)
const form = reactive({ field1: '', field2: '' })

// Computed properties
const computedValue = computed(() => {
  return state.value.someComputation
})

// Methods
const methodName = async () => {
  // Implementation
}

// Lifecycle
onMounted(async () => {
  await initializeComponent()
})

// Watch
watch(() => route.params.id, (newId) => {
  // React to route changes
})
</script>

<script lang="ts">
definePageMeta({
  middleware: 'auth' // or 'admin', 'guest', etc.
})
</script>
```

### 2. **Key Transformation Rules**

#### **Data Properties**
```typescript
// FROM (Options API)
data() {
  return {
    loading: false,
    items: [],
    form: { email: '', password: '' }
  }
}

// TO (Composition API)
const loading = ref(false)
const items = ref([])
const form = reactive({ email: '', password: '' })
```

#### **Computed Properties**
```typescript
// FROM
computed: {
  filteredItems() {
    return this.items.filter(...)
  }
}

// TO
const filteredItems = computed(() =>
  items.value.filter(...)
)
```

#### **Methods**
```typescript
// FROM
methods: {
  async fetchData() {
    this.loading = true
    await someAction()
    this.loading = false
  }
}

// TO
const fetchData = async () => {
  loading.value = true
  await someAction()
  loading.value = false
}
```

#### **Store Usage with storeToRefs**
```typescript
// FROM
import { mapState, mapActions } from 'pinia'

computed: {
  ...mapState(useAuthStore, ['user', 'isAdmin'])
},
methods: {
  ...mapActions(useAuthStore, ['login', 'logout'])
}

// TO
import { storeToRefs } from 'pinia'
import { useAuthStore } from '~/stores/auth'

const authStore = useAuthStore()

// ✅ Use storeToRefs for STATE and GETTERS (makes them reactive)
const { user, isAdmin } = storeToRefs(authStore)

// ✅ Extract actions DIRECTLY (NOT with storeToRefs)
const { login, logout } = authStore
```

#### **Template Access**
```vue
<!-- FROM (Options API) -->
<template>
  <div>{{ user.name }}</div>
  <button @click="handleClick">Click</button>
</template>

<!-- TO (Composition API) - NO CHANGES NEEDED -->
<template>
  <div>{{ user.name }}</div>
  <button @click="handleClick">Click</button>
</template>
```

#### **Lifecycle Hooks**
```typescript
// FROM
mounted() {
  this.fetchData()
},
beforeUnmount() {
  this.cleanup()
}

// TO
onMounted(() => {
  fetchData()
})

onBeforeUnmount(() => {
  cleanup()
})
```

#### **Refs and Form Elements**
```typescript
// FROM
this.$refs.formRef.validate()

// TO
const formRef = ref<any>(null)
formRef.value.validate()
```

#### **Router**
```typescript
// FROM
this.$router.push('/path')
this.$route.params.id

// TO
const router = useRouter()
const route = useRoute()

router.push('/path')
route.params.id
```

### 3. **Common Patterns**

#### **Form Handling**
```vue
<script setup lang="ts">
const formRef = ref<any>(null)
const formValid = ref(false)
const form = reactive({
  email: '',
  password: ''
})

const rules = {
  required: (v: string) => !!v || 'Required',
  email: (v: string) => /.+@.+/.test(v) || 'Invalid email'
}

const handleSubmit = async () => {
  const { valid } = await formRef.value.validate()
  if (!valid) return

  // Submit logic
}
</script>

<template>
  <v-form ref="formRef" v-model="formValid" @submit.prevent="handleSubmit">
    <v-text-field v-model="form.email" :rules="[rules.required, rules.email]" />
    <v-btn type="submit" :disabled="!formValid">Submit</v-btn>
  </v-form>
</template>
```

#### **Data Fetching**
```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { storeToRefs } from 'pinia'

const dataStore = useDataStore()
const { items, loading } = storeToRefs(dataStore)
const { fetchItems } = dataStore

onMounted(async () => {
  await fetchItems()
})
</script>
```

#### **Dialogs/Modals**
```vue
<script setup lang="ts">
const dialogOpen = ref(false)
const selectedItem = ref(null)

const openDialog = (item: any) => {
  selectedItem.value = item
  dialogOpen.value = true
}

const closeDialog = () => {
  dialogOpen.value = false
  selectedItem.value = null
}
</script>

<template>
  <v-dialog v-model="dialogOpen">
    <!-- Dialog content -->
  </v-dialog>
</template>
```

## Important Notes

### ✅ **DO**
- Use `storeToRefs()` for state and getters
- Extract actions directly from store
- Use `ref()` for primitives, `reactive()` for objects
- Access refs with `.value` in script, NOT in template
- Import all Vue composables (ref, computed, onMounted, etc.)
- Keep `definePageMeta` in a separate `<script>` tag

### ❌ **DON'T**
- Use `storeToRefs()` for actions (they won't work)
- Access reactive values without `.value` in script
- Use `this` keyword
- Forget to import composables from Vue
- Mix Options API with Composition API

## Conversion Checklist for Each File

- [ ] Remove `defineComponent` wrapper and `export default`
- [ ] Change `<script lang="ts">` to `<script setup lang="ts">`
- [ ] Add Vue composable imports (ref, computed, onMounted, etc.)
- [ ] Add store imports and initialize stores
- [ ] Use `storeToRefs` for state/getters, extract actions directly
- [ ] Convert `data()` to `ref()` or `reactive()`
- [ ] Convert `computed` properties to `computed(()  => {})`
- [ ] Convert `methods` to arrow functions
- [ ] Convert lifecycle hooks (mounted → onMounted)
- [ ] Replace `this.$router` with `useRouter()`
- [ ] Replace `this.$route` with `useRoute()`
- [ ] Replace `this.$refs` with `ref()`
- [ ] Move `definePageMeta` to separate script block
- [ ] Test the conversion

## Next Steps

1. **Manually convert remaining files** using the pattern above
2. **Test each converted file** to ensure it works correctly
3. **Run type checking**: `npm run type-check`
4. **Run linter**: `npm run lint`
5. **Test the application** thoroughly

## Example Conversions Available

See the following converted files as reference examples:
- `/pages/index.vue` - Simple form with authentication
- `/pages/dashboard.vue` - Multiple stores, computed properties
- `/pages/accounts/index.vue` - Data table with filters
- `/pages/loans/[id].vue` - Complex detail page with dialogs
- `/layouts/default.vue` - Layout with navigation

## Automated Conversion Script (Optional)

For remaining files, you can use a script or manually apply the pattern. The key is consistency and following the storeToRefs pattern for Pinia stores.

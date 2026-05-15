<template>
  <section class="panel auth-panel">
    <div v-if="!user" class="auth-card">
      <div>
        <p class="eyebrow">Cloud sync</p>
        <h2>{{ mode === 'login' ? 'Увійти в кабінет' : 'Створити кабінет' }}</h2>
        <p class="muted">JWT-сесія, PostgreSQL-історія, обране та premium-ready профіль.</p>
      </div>
      <div class="auth-grid">
        <input v-if="mode === 'register'" :value="form.name" class="auth-input" placeholder="Ваше ім’я" @input="updateForm('name', $event)" />
        <input :value="form.email" class="auth-input" placeholder="Email" autocomplete="email" @input="updateForm('email', $event)" />
        <input :value="form.password" class="auth-input" placeholder="Пароль" type="password" autocomplete="current-password" @input="updateForm('password', $event)" @keyup.enter="$emit('submit')" />
        <button class="btn" :disabled="loading" @click="$emit('submit')">{{ mode === 'login' ? 'Увійти' : 'Зареєструватись' }}</button>
        <button class="btn btn-ghost" type="button" @click="$emit('toggle-mode')">{{ mode === 'login' ? 'Створити акаунт' : 'Вже маю акаунт' }}</button>
      </div>
    </div>

    <div v-else class="auth-user">
      <div>✨ Привіт, <strong>{{ user.name }}</strong> <span class="premium-pill">{{ user.premiumTier === 'premium' ? 'Premium' : 'Free' }}</span></div>
      <button class="btn btn-secondary" @click="$emit('logout')">Вийти</button>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { AuthUser } from '../types';

const props = defineProps<{
  user: AuthUser | null;
  mode: 'login' | 'register';
  loading: boolean;
  form: { name: string; email: string; password: string };
}>();

const emit = defineEmits<{
  submit: [];
  logout: [];
  'toggle-mode': [];
  'update:form': [value: { name: string; email: string; password: string }];
}>();

function updateForm(field: keyof typeof props.form, event: Event) {
  emit('update:form', {
    ...props.form,
    [field]: (event.target as HTMLInputElement).value
  });
}
</script>

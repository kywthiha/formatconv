<template>
  <div class="row">
    <div class="col">
      <div class="totp-btn">
        <slot name="totp-slot"></slot>
      </div>
    </div>
    <div class="col">
      <div class="register">
        <slot name="register-slot"></slot>
      </div>
    </div>
  </div>
  <div class="row">
    <div class="service-title">
      <slot name="titlebar-slot"></slot>
    </div>
  </div>
</template>

<script>
export default {};
</script>

<template>
  <div class="row justify-content-between">
    <div class="col-auto">
      <div class="totp-btn">
        <slot name="totp-slot"></slot>
      </div>
    </div>
    <div class="col-auto">
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

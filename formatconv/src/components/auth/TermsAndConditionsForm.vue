<!--
    クラス名 : TermsAndConditionsForm
    概要 : 利用規約情報表示処理画面
    作成者 : GICM_MHK
    作成日 : 2022/10/17　 
-->
<script>
import logs from "./Contents";
export default {
  data() {
    return {
      logitems: logs,
    };
  },
  props: {
    show: Boolean,
  },
};
</script>

<template>
  <transition name="modal">
    <div v-if="show" class="modal-mask">
      <div class="modal-wrapper">
        <div class="modal-container">
          <div class="modal-header">
            <slot name="header">default header</slot>
          </div>

          <div class="modal-body">
            <slot name="body">
              <textarea class="textarea" v-model="logitems"></textarea>

              <content />
            </slot>
          </div>

          <div class="modal-footer">
            <slot name="footer">
              <button class="modal-default-button" @click="$emit('close')">
                {{ $t("screenItemProperties.button.closeBtn") }}
              </button>
            </slot>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<style></style>

<!--
    クラス名 : termsAndConditionsForm
    概要 : 利用規約情報表示処理画面
    作成者 : GICM
    作成日 : 2022/10/17　 
-->
<script>
export default {
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
          <!-- モーダルのタイトル -->
          <div class="modal-header">
            <slot name="header">default header</slot>
          </div>
          <!-- モーダルの内容 -->
          <div class="modal-body">
            <slot name="body">
              <textarea
                readonly
                class="textarea"
                :value="$t('conditions')"
                maxlength="2000"
              ></textarea>
            </slot>
          </div>
          <!-- ボタンエリア -->
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

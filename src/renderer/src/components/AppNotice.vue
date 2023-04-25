<template>
  <div :class="['alert', 'alert-' + noticeType]" role="alert">
    {{ notice }} <a :href="[linkUri]" class="alert-link">{{ linkText }}</a>
  </div>
</template>

<script>
export default {
  name: 'AppNotice',
  props: {
    notice: String,
    noticeType: String,
    linkText: String,
    linkUri: String
  }
}
</script>

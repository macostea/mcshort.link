<script setup>
import { ref } from 'vue';
import ShortnerForm from './components/ShortnerForm.vue';
import ResultForm from './components/ResultForm.vue';

let shortPath = ref('')

function shortenedPath(newShortPath) {
  shortPath.value = newShortPath
}

</script>

<template>
<div class="main">
  <div class="logo-wrapper">
    <img id="logo" src="/img/logo.svg" />
    <h1 id="logo-text"><a href="/">McShort Link</a></h1>
  </div>
  
</div>
  <ShortnerForm @shortened-path="shortenedPath" />
  <ResultForm :short-path="shortPath" v-show="shortPath" />
</template>

<style>

#logo {
    width: 78px;
    height: 78px;
}

#logo-text {
    width: 135px;
}
</style>

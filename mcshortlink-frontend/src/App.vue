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

/* #app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
} */
</style>

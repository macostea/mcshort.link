<script setup>
    defineProps({
        shortPath: String
    })
</script>

<template>
    <div class="result">
        <h1 class="result-title">
            Your shortened URL is:
        </h1>
        <p class="result-content"><a id="shortened-url" v-bind:href="shortPath">{{ shortPath }}</a> <button id="clipboard" data-clipboard-target="#shortened-url"><i class="far fa-copy"></i></button></p>
    </div>
</template>

<script>
new ClipboardJS('#clipboard');
</script>

<style>
.result {
    min-height: auto;
    align-items: start;
    justify-content: center;
    text-align: center;
    margin: 30px auto 48px;
    background-color: #272727;
    padding-bottom: 2px;
    padding-top: 2px;
}

.result a {
    color: #ec005e;
}

.result-title {
    font-size: 32px;
    line-height: 44px;
    text-align: center;
    padding-bottom: 5px;
    font-weight: 800;
    color: #fff;
}

#clipboard {
    border: none;
    background-color: transparent;
    cursor: pointer;
    color: #fff;
}
</style>
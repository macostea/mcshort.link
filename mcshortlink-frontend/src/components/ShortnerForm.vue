<script setup>
import { ref } from 'vue'
    let longPath = ref('')

    const emit = defineEmits([
        'shortenedPath'
    ])

    async function getShortPath() {
        let postData = {
            path: longPath.value
        }

        let shortenedPath = await fetch("/api/shorten", {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(postData)
        })

        let response = await shortenedPath.json()

        console.log(response.short_path)
        emit('shortenedPath', response.short_path)
    }
</script>

<template>
    <div class="shortner-wrapper">
        <form id="shortner-form" @submit.prevent="getShortPath">
            <input name="path" id="path" placeholder="Enter your link (e.g. https://www.mozilla.org)" v-model="longPath" />
            <button id="submit" type="submit" value="Shorten!"><i class="fas fa-arrow-right"></i></button>
        </form>
    </div>
</template>

<style>
.shortner-wrapper {
    padding: 0;
    margin: 0;
    width: 100%;
    max-width: none;
    display: block;
    float: none;
}

#shortner-form {
    padding-left: 1em;
    padding-top: 1px;
    width: 100%;
    flex: 1 0 auto;
    max-width: 665px;
    margin: 0 auto;
    background-color: #457b9d;
    border-color: #457b9d;
    box-shadow: 0 1px 3px rgba(0,0,0,0.5);
    font-size: 1.14em;
    padding-right: 3.5em;
    box-sizing: border-box;
    border-radius: 4px;
    display: block;
    position: relative;
    height: 2.8em;
    border: 1px solid rgba(0,0,0,0.15);
}

#path {
    color: #a8dadc;
    font-size: 1.1em;
    font-weight: normal;
    display: block;
    width: 100%;
    background: none;
    outline: none;
    border: none;
    padding: 0;
    height: 2.545455em;
    z-index: 1;
    position: relative;
    top: -1px;
}

#submit {
    border-radius: 0 4px 4px 0;
    min-width: 26px;
    color: #a8dadc;
    font-size: 1.25em;
    padding: 0 .64em;
    height: auto;
    min-height: 1.8em;
    margin-top: -1px;
    margin-bottom: -1px;
    margin-right: -3px;
    line-height: 1.5;
    background-color: transparent;
    background-position: 50% 50%;
    background-repeat: no-repeat;
    box-sizing: content-box;
    font-style: normal;
    font-weight: normal !important;
    font-variant: normal;
    text-transform: none;
    text-decoration: none !important;
    width: 1em;
    display: block;
    cursor: pointer;
    background: transparent;
    text-align: center;
    border: none;
    position: absolute;
    top: 0;
    bottom: 0;
    right: 2px;
    left: auto;
    margin: auto;
    z-index: 2;
    outline: none;
}
</style>
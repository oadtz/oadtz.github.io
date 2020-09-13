<template>
    <!--Hello-->
    <section id="about" class="container section">
        <div class="row">
        <div class="col-md-10">
            <h2 id="hello_header" class="section__title">Hi</h2>
            <p class="section__description" style="white-space: pre-line">
            {{profile.about}}
            </p>
        </div>
        </div>
    </section>
    <!--Hello-->
</template>

<script>
import profile from '../stores/profile';

export default {
    data: function () {
        return {
            profile
        }
    }
}
</script>
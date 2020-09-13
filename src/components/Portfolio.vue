<template>
    <!--Portfolio-->
    <section id="portfolio" class="container section">
        <div class="row">
            <div class="col-md-12">
                <h2 id="portfolio_header" class="section__title">Portfolio</h2>
            </div>
        </div>
        <div class="portfolio-cards">
            <div v-for="project in portfolio.projects" :key="project.name" @click="openProject(project)" class="row project-card">
                <div class="col-md-6 col-lg-5 project-card__img">
                    <img class="" :src="project.screenshot" alt="project-img">
                </div>
                <div class="col-md-6 col-lg-7 project-card__info">
                    <h3 class="project-card__title">{{project.name}}</h3>
                    <p class="project-card__description">{{project.description}}</p>
                    <a :href="project.url" class="project-card__link" target="_blank">{{project.url}}</a>
                </div>
            </div>
        </div>
        <!-- Portfolio Modal -->
    </section>
    <!--Portfolio-->
</template>

<script>
import portfolio from '../stores/portfolio';

export default {
    data: function () {
        return {
            portfolio
        };
    },
    methods: {
        openProject: project => {
            window.open(project.url);
        }
    }
}
</script>
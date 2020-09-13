<template>
    <!--Testimonials-->
    <div id="certifications" class="section">
        <div class="background slider-carousel" style="background-image: url(/images/img_bg_main.jpg);">
        <div class="container">
            <div id="carouselTestimonials" class="carousel slide" data-ride="carousel">
            <ol class="carousel-indicators">
                <li v-for="(cert, i) in portfolio.certifications" :key="cert.name" data-target="#carouselTestimonials" :data-slide-to="i" :class="{ active: i === 0 }"></li>
            </ol>
            <div class="carousel-inner" role="listbox">
                <div v-for="(cert, i) in portfolio.certifications" :key="cert.name" class="carousel-item" :class="{ active: i === 0 }">
                    <div class="row">
                        <div class="col-md-10 col-sm-10 col-10 mr-auto ml-auto">
                            <p class="slider-carousel__title">
                                <a :href="cert.url" target="_blank" style="color: white; text-decoration: none">{{cert.name}} <i class="fa fa-external-link"></i></a>
                            </p>
                            <p class="slider-carousel__caption">Issuer: {{cert.issuer}}</p>
                            <hr>
                            <p class="slider-carousel__description text-center">
                                <a :href="cert.url" target="_blank"><img :src="cert.screenshot" /></a>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            <a class="carousel-control-prev" href="#certifications" role="button" data-slide="prev">
                <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                <span class="sr-only">Previous</span>
            </a>
            <a class="carousel-control-next" href="#certifications" role="button" data-slide="next">
                <span class="carousel-control-next-icon" aria-hidden="true"></span>
                <span class="sr-only">Next</span>
            </a>
            <div class="slider-carousel__circle">
                <p><i class="fa fa-graduation-cap" aria-hidden="true"></i></p>
            </div>
            </div>
        </div>
        </div>
    </div>
    <!--Testimonials-->
</template>

<script>
import portfolio from '../stores/portfolio';

export default {
    data: function () {
        return {
            portfolio
        };
    }
}
</script>
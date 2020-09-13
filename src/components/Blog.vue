<template>
    <!--Blog-->
    <section id="blog" class="container section">
        <div class="row">
        <div class="col-md-12">
            <h2 id="blog_header" class="section__title">Sample Blog Posts</h2>
        </div>
        </div>

        <div class="row post-cards">
            <div v-for="blog in portfolio.blogs" :key="blog.title" class="col-md-4">
                <a :href="blog.url" target="_blank">
                    <div class="post-cards__card">
                        <div class="post-cards__img">
                            <img :src="blog.thumbnail" alt="blog_img">
                        </div>
                        <div class="post-cards__info">
                            <p class="post-cards__date">{{blog.site}}</p>
                            <h3 class="post-cards_title">{{blog.title}}</h3>
                            <p class="post-cards_description">{{blog.description}}</p>
                        </div>
                    </div>
                </a>
            </div>
            <div class="col-md-4">
                <div class="post-cards__card">
                    <div class="post-cards__img">
                        <img src="/images/img_blog_3.png" alt="blog_img">
                    </div>
                    <div class="post-cards__info">
                        <h3 class="post-cards_title">Read more on</h3>
                        <p class="post-cards_description">
                            <ul>
                                <li><a href="https://www.panohive.com" target="_blank">https://www.panohive.com</a></li>
                                <li><a href="https://www.behappynerd.com" target="_blank">https://www.behappynerd.com</a></li>
                            </ul>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </section>
    <!--Blog-->
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
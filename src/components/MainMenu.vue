<template>
    <nav style="padding: 0px; margin: 0px">
        <!--Main menu-->
        <div class="menu">
            <div class="container">
            <div class="row">
                <div class="menu__wrapper d-none d-lg-block col-md-12">
                <nav class="">
                    <ul>
                    <li><a href="#about">About</a></li>
                    <li><a href="#experience">Experience</a></li>
                    <li><a href="#portfolio">Portfolio</a></li>
                    <li><a href="#certifications">Certifications</a></li>
                    <li><a href="#blog">Blog</a></li>
                    <li><a href="#contact">Contact</a></li>
                    </ul>
                </nav>
                </div>
                <div class="menu__wrapper col-md-12 d-lg-none">
                <button type="button" class="menu__mobile-button">
                    <span><i class="fa fa-bars" aria-hidden="true"></i></span>
                </button>
                </div>
            </div>
            </div>
        </div>
        <!--Main menu-->


        <!-- Mobile menu -->
        <div class="mobile-menu d-lg-none">
            <div class="container">
            <div class="mobile-menu__close">
                <span><i class="mdi mdi-close" aria-hidden="true"></i></span>
            </div>
            <nav class="mobile-menu__wrapper">
                <ul>
                <li><a href="#about">About</a></li>
                <li><a href="#experience">Experience</a></li>
                <li><a href="#portfolio">Portfolio</a></li>
                <li><a href="#certifications">Certifications</a></li>
                <li><a href="#blog">Blog</a></li>
                <li><a href="#contact">Contact</a></li>
                </ul>
            </nav>
            </div>
        </div>
        <!-- Mobile menu -->
    </nav>
</template>

<script>
export default {

}
</script>
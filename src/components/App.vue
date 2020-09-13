<template>
    <div>
        <MainMenu />
        <Header />
        <About />

        <hr>
        
        <Experience />
        <Portfolio />
        <Certifications />
        <Blog />
        <Contact />
    </div>
</template>

<script>
import MainMenu from './MainMenu';
import Header from './Header';
import About from './About';
import Experience from './Experience';
import Portfolio from './Portfolio';
import Certifications from './Certifications';
import Blog from './Blog';
import Contact from './Contact';

export default {
    components: {
        MainMenu,
        Header,
        About,
        Experience,
        Portfolio,
        Certifications,
        Blog,
        Contact
    }
}
</script>


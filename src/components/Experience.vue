<template>
    <!--Resume-->
    <section id="experience" class="container section">
        <div class="row">
        <div class="col-md-10">
            <h2 id="resume_header" class="section__title">Experience</h2>
        </div>
        </div>
        <div class="row">
        <div class="col-md-8 section__resume resume-list">
            <h3 class="resume-list_title">education</h3>
            <div class="resume-list__block" v-for="education in experience.education" :key="education.school">
                <p class="resume-list__block-title">{{education.school}}</p>
                <p class="resume-list__block-date">{{education.from}} - {{education.to}}</p>
                <p>
                    {{education.degree}}, {{education.major}}, {{education.gpa}}
                </p>
            </div>
        </div>
        </div>
        <div class="row">
        <div class="col-md-8 section__resume resume-list">
            <h3 class="resume-list_title">employment</h3>
            <div class="resume-list__block" v-for="employment in experience.employment" :key="employment.employer">
                <p class="resume-list__block-title">{{employment.employer}}</p>
                <p class="resume-list__block-date">{{employment.from}} - {{employment.to}}</p>
                <p>
                    {{employment.title}}
                </p>
                <ul class="tags">
                    <li v-for="tag in employment.tags" :key="tag">{{tag}}</li>
                </ul>
            </div>
        </div>
        </div>
        <div class="row section__resume progress-list js-progress-list">
            <div class="col-md-12">
                <h3 class="progress-list__title">additional skills</h3>
            </div>
            <div class="col-md-5 mr-auto" v-for="skill in experience.skills" :key="skill.name">
                <div class="progress-list__skill">
                    <p>
                        <span class="progress-list__skill-title">{{skill.name}}</span>
                    </p>
                    <div class="progress">
                        <div class="progress-bar" role="progressbar" :aria-valuenow="skill.value" aria-valuemin="0" aria-valuemax="100" >
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
    <!--Resume-->
</template>

<script>
import experience from '../stores/experience';

export default {
    data: function () {
        return {
            experience
        }
    }
}
</script>
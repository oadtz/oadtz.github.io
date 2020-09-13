<template>
    <!--Header-->
    <header class="main-header" style="background-image: url(/images/cover.jpg)">
        <div class="container">
        <div class="row personal-profile">
            <div class="col-md-4 personal-profile__avatar">
            <img class="" src="images/profile.jpg" alt="avatar">
            </div>
            <div class="col-md-8">
            <p class="personal-profile__name">Thanapat Pirmphol</p>
            <p class="personal-profile__work">Software Engineer, Photographer</p>
            <div class="personal-profile__contacts">
                <dl class="contact-list contact-list__opacity-titles">
                <dt>Age:</dt>
                <dd>{{age}}</dd>
                <dt>Phone:</dt>
                <dd><a :href="'tel:' + profile.phone">{{profile.phone}}</a></dd>
                <dt>Email:</dt>
                <dd><a :href="'mailto:' + profile.email">{{profile.email}}</a></dd>
                <dt>Address:</dt>
                <dd>{{profile.address}}</dd>
                </dl>
            </div>
            <p class="personal-profile__social">
                <a :href="profile.facebook" target="_blank" alt="Facebook"><i class="fa fa-facebook-square"></i></a>
                <a :href="profile.linkedin" target="_blank" alt="LinkedIn"><i class="fa fa-linkedin-square"></i></a>
                <a :href="profile.github" target="_blank" alt="Github"><i class="fa fa-github"></i></a>
            </p>
            </div>
        </div>
        </div>
    </header>
    <!--Header-->
</template>

<script>
import moment from 'moment';

import profile from '../stores/profile';

export default {
    data: function () {
        return {
            profile
        }
    },
    computed: {
        age: function () {
            return (moment().year() - this.profile.birthdate.year());
            //return moment().diff(this.profile.birthdate, 'years');
        }
    }
}
</script>
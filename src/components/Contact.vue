<template>

    <!--Contact-->
    <div class="background" style="background-image: url(/images/footer.jpg)">
        <div id="contact" class="container section">
        <div class="row">
            <div class="col-md-12">
            <p id="contacts_header" class="section__title">Contact</p>
            </div>
        </div>
        <div class="row contacts">
            <div class="col-md-5 col-lg-4">
            <div class="contacts__list">
                <dl class="contact-list">
                <dt>Phone:</dt>
                <dd><a :href="'tel:' + profile.phone">{{profile.phone}}</a></dd>
                <dt>LINE:</dt>
                <dd><a :href="'line:' + profile.line">{{profile.line}}</a></dd>
                <dt>Email:</dt>
                <dd><a :href="'mailto:' + profile.email">{{profile.email}}</a></dd>
                </dl>
            </div>
            <div class="contacts__social">
                <ul>
                <li><a :href="profile.facebook" target="_blank">Facebook</a></li>
                <li><a :href="profile.linkedin" target="_blank">Linkedin</a></li>
                <li><a :href="profile.github" target="_blank">GitHub</a></li>
                </ul>
            </div>
            </div>
            <div class="col-md-7 col-lg-5">
            <div class="contacts__form">
                <p class="contacts__form-title">Or contact me though this facebook page</p>
                <form class="js-form">
                    <div class="fb-page" data-href="https://www.facebook.com/panohive/" data-tabs="timeline" data-small-header="false" data-adapt-container-width="true" data-hide-cover="false" data-show-facepile="true"><blockquote cite="https://www.facebook.com/panohive/" class="fb-xfbml-parse-ignore"><a href="https://www.facebook.com/panohive/">PanoHive</a></blockquote>
                    </div>
                </form>
            </div>
            <div class="footer">
                <p>&copy; {{year}} Thanapat Pirmphol. All Rights Reserved</p>
            </div>
            </div>
        </div>
        </div>
        <div id="fb-root"></div>
    </div>
    <!--Contact-->

</template>

<script>
import moment from 'moment';
import profile from '../stores/profile';

export default {
    data: function () {
        return {
            profile
        };
    },
    computed: {
        year: function () {
            return moment().format('Y');
        }
    },
    mounted: function () {
        (function(d, s, id) {
        var js, fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) return;
        js = d.createElement(s); js.id = id;
        js.src = 'https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v3.1&appId=1378825162204195&autoLogAppEvents=1';
        fjs.parentNode.insertBefore(js, fjs);
        }(document, 'script', 'facebook-jssdk'));
    }
}
</script>

document.addEventListener('DOMContentLoaded', function (event) {

    const API_YMAPS = 'https://api-maps.yandex.ru/2.1/?lang=ru_RU&mode=debug';



    /* =================================================
    smooth scroll
    ================================================= */

    function scrollToTargetAdjusted(params) {

        let element = typeof params.elem == 'string' ? document.querySelector(params.elem) : params.elem
        let headerOffset = 15;

        const getOffsetTop = function (element) {
            if (!element) return 0;
            return getOffsetTop(element.offsetParent) + element.offsetTop;
        };

        let elementPosition = getOffsetTop(element)
        let offsetPosition = elementPosition - headerOffset - (params.offset ? params.offset : 0);

        window.scrollTo({
            top: Number(offsetPosition),
            behavior: "smooth"
        });
    }

    if (document.querySelector('.header__nav')) {
        document.querySelectorAll('[data-scroll="smooth"]').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault()
                scrollToTargetAdjusted({
                    elem: document.querySelector(item.getAttribute('href')),
                    offset: 0
                })
            })
        })
    }

    /* =================================================
    preloader
    ================================================= */

    class Preloader {

        constructor() {
            this.$el = this.init()
            this.state = false
        }

        init() {
            const el = document.createElement('div')
            el.classList.add('loading')
            el.innerHTML = '<div class="indeterminate"></div>';
            document.body.append(el)
            return el;
        }

        load() {

            this.state = true;

            setTimeout(() => {
                if (this.state) this.$el.classList.add('load')
            }, 300)
        }

        stop() {

            this.state = false;

            setTimeout(() => {
                if (this.$el.classList.contains('load'))
                    this.$el.classList.remove('load')
            }, 200)
        }

    }

    window.preloader = new Preloader();


    /* ==============================================
    Status
    ============================================== */

    function Status() {

        this.containerElem = '#status'
        this.headerElem = '#status_header'
        this.msgElem = '#status_msg'
        this.btnElem = '#status_btn'
        this.timeOut = 10000,
            this.autoHide = true

        this.init = function () {
            let elem = document.createElement('div')
            elem.setAttribute('id', 'status')
            elem.innerHTML = '<div id="status_header"></div> <div id="status_msg"></div><div id="status_btn"></div>'
            document.body.append(elem)

            document.querySelector(this.btnElem).addEventListener('click', function () {
                this.parentNode.setAttribute('class', '')
            })
        }

        this.msg = function (_msg, _header) {
            _header = (_header ? _header : 'Отлично!')
            this.onShow('complete', _header, _msg)
            if (this.autoHide) {
                this.onHide();
            }
        }
        this.err = function (_msg, _header) {
            _header = (_header ? _header : 'Ошибка')
            this.onShow('error', _header, _msg)
            if (this.autoHide) {
                this.onHide();
            }
        }
        this.wrn = function (_msg, _header) {
            _header = (_header ? _header : 'Внимание')
            this.onShow('warning', _header, _msg)
            if (this.autoHide) {
                this.onHide();
            }
        }

        this.onShow = function (_type, _header, _msg) {
            document.querySelector(this.headerElem).innerText = _header
            document.querySelector(this.msgElem).innerText = _msg
            document.querySelector(this.containerElem).classList.add(_type)
        }

        this.onHide = function () {
            setTimeout(() => {
                document.querySelector(this.containerElem).setAttribute('class', '')
            }, this.timeOut);
        }

    }

    window.STATUS = new Status();
    const STATUS = window.STATUS;
    STATUS.init();

    /* ==============================================
    ajax request
    ============================================== */

    window.ajax = function (params, response) {

        //params Object
        //dom element
        //collback function

        window.preloader.load()

        let xhr = new XMLHttpRequest();
        xhr.open((params.type ? params.type : 'POST'), params.url)

        if (params.headers) {
            for (let key in params.headers) {
                xhr.setRequestHeader(key, params.headers[key]);
            }
        }

        if (params.responseType == 'json') {
            xhr.responseType = 'json';
            xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8');
            xhr.send(JSON.stringify(params.data))
        } else {
            let formData = new FormData()
            for (key in params.data) {
                formData.append(key, params.data[key])
            }
            xhr.send(formData)
        }

        xhr.onload = function () {

            response ? response(xhr.status, xhr.response) : ''
            window.preloader.stop()
            setTimeout(function () {
                if (params.btn) {
                    params.btn.classList.remove('btn-loading')
                }
            }, 300)
        };

        xhr.onerror = function () {
            window.STATUS.err('Error: ajax request failed')
        };

        xhr.onreadystatechange = function () {
            if (xhr.readyState == 3) {
                if (params.btn) {
                    params.btn.classList.add('btn-loading')
                }
            }
        };
    }

    /* ==================================================
    maska
    ==================================================*/
    const {
        MaskInput,
    } = Maska

    function initMaska() {
        new MaskInput("[data-maska]")
    }

    initMaska();


    /* ==================================================
    burgerMenu
    ==================================================*/


    if (document.querySelector('.btn-burger')) {
        document.querySelector('.btn-burger').addEventListener('click', () => {
            document.querySelector('.btn-burger').classList.toggle('open')
            document.querySelector('.header__nav').classList.toggle('is-open')
        })
    }



    /* ========================================
    slider
    ========================================*/


    if (document.querySelector('[data-slider="project"]')) {
        var splide = new Splide('[data-slider="project"]', {

            arrows: true,
            pagination: true,
            gap: 24,
            start: 0,
            perPage: 3,


            breakpoints: {
                1200: {
                    perPage: 3,
                    gap: 24,
                },
                992: {
                    perPage: 2,
                    gap: 12,
                },
                576: {
                    perPage: 1,
                },

            },

        });




        splide.mount();
    }

    /* =========================================
    video youtube
    =========================================*/

    if (document.querySelector('.video')) {
        document.querySelectorAll('.video').forEach(container => {

            if (container.closest('.video-block__yt')) return false

            const getYoutubeId = (url) => {
                var m = url.match(/^.*(?:youtu.be\/|v\/|e\/|u\/\w+\/|embed\/|v=)([^#\&\?]*).*/);
                if (!m || !m[1]) return null;
                return m[1];
            }

            container.querySelector('.video__button').addEventListener('click', e => {
                container.classList.add('is-play')

                let iframe = document.createElement('iframe')
                iframe.setAttribute('allowfullscreen', '')
                iframe.setAttribute('src', '//www.youtube.com/embed/' + getYoutubeId(container.dataset.id) + '?autoplay=true')

                container.querySelector('.video__iframe').append(iframe)
            })


        })
    }

    /* =================================================
    popups
    =================================================*/

    function popupSuccess() {

        const instancePopup = new afLightbox({
            mobileInBottom: true
        })

        instancePopup.open(`
           <div class="popup-thanks" >
                <h2> Спасибо! </h2>
                <p>Мы свяжемся с вами в ближайшее время!</p>
           </div> `, false)

    }

    function initDataModal(ctx) {
        const items = ctx.querySelectorAll('[data-modal]')

        items.forEach(item => {
            item.addEventListener('click', e => {

                window.ajax({
                    type: 'GET',
                    url: item.dataset.modal
                }, (status, response) => {

                    const instancePopup = new afLightbox({
                        mobileInBottom: true
                    })

                    instancePopup.open(response, (instance) => {


                        instance.querySelectorAll('[data-scroll]').forEach(item => {
                            item.addEventListener('click', (e) => {
                                e.preventDefault()
                                scrollToTargetAdjusted({
                                    elem: document.querySelector(item.getAttribute('href')),
                                    offset: 0
                                })

                                instancePopup.close()
                            })
                        })


                    })
                })

            })
        })
    }

    if (document.querySelector('[data-modal]')) initDataModal(document)

    /* ========================================
    slider
    ========================================*/


    if (document.querySelector('[data-slider="rev"]')) {
        var splide = new Splide('[data-slider="rev"]', {

            arrows: true,
            pagination: true,
            gap: 24,
            start: 0,
            perPage: 2,


            breakpoints: {

                992: {
                    perPage: 2,
                    gap: 12,
                },
                576: {
                    perPage: 1,
                    gap: 0
                },

            },

        });




        splide.mount();
    }


}); //dcl
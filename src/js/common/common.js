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

            document.addEventListener('click', (e) => {
                if (!e.target.closest('#status')) {
                    this.close()
                }
            })
        }

        this.msg = function (_msg, _header) {
            _header = (_header ? _header : false)
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

        this.close = function () {
            document.querySelector(this.containerElem).setAttribute('class', '')
        }

        this.onHide = function () {
            setTimeout(() => {
                this.close()
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

        //postcode
        new MaskInput("[data-input-mask='postcode']", {
            mask: '##-####',
        })

        //number
        new MaskInput("[data-input-mask='number']", {
            mask: '9',
            tokens: {
                9: {
                    pattern: /[0-9]/,
                    repeated: true
                },
            }
        })

        new MaskInput("[data-input-mask='date']", {
            mask: (value) => {
                return '##.##.####'
            },

            postProcess: (value) => {

                let arr = [];

                value.split('.').forEach((num, index) => {
                    if (index == 0) Number(num) > 31 ? arr.push(31) : arr.push(num)
                    if (index == 1) Number(num) > 12 ? arr.push(12) : arr.push(num)
                    if (index == 2) Number(num) > new Date().getFullYear() ? arr.push(new Date().getFullYear()) : arr.push(num)
                })

                return arr.join('.')

            }

        })

        new MaskInput("[data-input-mask='date-reverse']", {
            mask: (value) => {
                return '####.##.##'
            },

            postProcess: (value) => {

                let arr = [];

                value.split('.').forEach((num, index) => {
                    if (index == 2) Number(num) > 31 ? arr.push(31) : arr.push(num)
                    if (index == 1) Number(num) > 12 ? arr.push(12) : arr.push(num)
                    if (index == 0) Number(num) > new Date().getFullYear() ? arr.push(new Date().getFullYear()) : arr.push(num)
                })

                return arr.join('.')

            }

        })
    }

    initMaska();

    /* ==============================================
     select
    ============================================== */

    // public methods
    // select.afSelect.open()
    // select.afSelect.close()
    // select.afSelect.update()

    const selectCustom = new afSelect({
        selector: 'select'
    })

    selectCustom.init()
    /* ====================================
    ajax tooltip
    ====================================*/

    if (document.querySelector('[data-tooltip]')) {


        class TooltipAjax {

            constructor() {
                this.$items = document.querySelectorAll('[data-tooltip]')
                this.addEvents()
                this.tooltip = null;
            }

            ajaxLoadTooltip(e, callback) {

                callback({
                    title: '',
                    text: e.target.dataset.tooltip || e.target.closest('[data-tooltip]').dataset.tooltip
                })

            }

            getTemplate(data) {
                let html = ` <div class="tooltip-box" ><div class="af-spiner" ></div></div> `;
                if (data) {

                    html = `<div class="tooltip-box" >
                               <div class="tooltip-box__title" >${data.title}</div>
                               <div class="tooltip-box__text" >${data.text}</div>
                           </div> `;
                }
                return html;
            }

            positionTooltip(e) {
                const DomRect = e.target.getBoundingClientRect()
                const tooltipW = this.tooltip.clientWidth;
                const tooltipH = this.tooltip.clientHeight;
                const offset = 16;

                this.tooltip.style.left = (DomRect.x - (tooltipW / 2) + (offset / 2)) + 'px'
                this.tooltip.style.top = (DomRect.y - tooltipH - (offset / 2)) + 'px'


                if (this.tooltip.getBoundingClientRect().left < offset) {
                    this.tooltip.classList.add('tooltip-box-item--left')
                    this.tooltip.style.left = (DomRect.x - (DomRect.x / 2) + (offset / 2)) + 'px'
                }

                if (this.tooltip.getBoundingClientRect().top < offset) {
                    this.tooltip.classList.add('tooltip-box-item--top')
                    this.tooltip.style.top = (DomRect.y + (offset)) + 'px'
                }
            }

            tooltipDesctop(e) {

                this.tooltipRemove()
                this.tooltip = document.createElement('div')
                this.tooltip.innerHTML = this.getTemplate(false)
                this.tooltip.classList.add('tooltip-box-item')

                e.target.closest('span').append(this.tooltip)
                this.positionTooltip(e)

                //load data

                this.ajaxLoadTooltip(e, (response) => {
                    this.tooltip.innerHTML = this.getTemplate(response)
                    this.positionTooltip(e)
                })
            }

            tooltipPopup(e) {
                const tooltipPopup = new afLightbox({
                    mobileInBottom: true
                })

                tooltipPopup.open('<div class="popup-tooltip-box" >' + this.getTemplate(false) + '</div>', () => {
                    this.ajaxLoadTooltip(e, (response) => {
                        tooltipPopup.changeContent('<div class="popup-tooltip-box" >' + this.getTemplate(response) + '</div>')
                    })
                })
            }

            tooltipRemove() {
                !this.tooltip || this.tooltip.remove()
            }

            addEvents() {
                this.$items.forEach(item => {

                    //for desctop
                    if (document.body.clientWidth > 576) {

                        item.addEventListener('mouseenter', e => {
                            this.tooltipDesctop(e)

                            //add event close on scroll
                            window.addEventListener('scroll', e => {
                                this.tooltipRemove()
                            })

                        })

                        //add event close on outher click 
                        item.addEventListener('mouseleave', e => {
                            this.tooltipRemove()
                        })

                    } else {
                        item.addEventListener('click', e => {
                            //for mobile
                            this.tooltipPopup(e)
                        })
                    }



                })
            }

        }

        new TooltipAjax()


    }

    /* =====================================
    data-pf
    =====================================*/

    if (document.querySelector('[data-pf="trip"]')) {

        let container = document.querySelector('[data-pf="trip"]')
        let radio = container.querySelectorAll('[type=radio]')
        let fields = document.querySelector('[data-pf="trip-fields"]')

        radio.forEach(item => {
            item.addEventListener('change', (e) => {
                if (e.target.value != 1) {
                    fields.setAttribute('disabled', 'disabled')
                } else {
                    fields.removeAttribute('disabled')
                }
            })

            if (item.checked && item.value != 1) {
                fields.setAttribute('disabled', 'disabled')
            }
        })

    }

    if (document.querySelector('[data-pf="group"]')) {
        document.querySelectorAll('[data-pf="group"]').forEach(item => {

            let checkbox = item.querySelector('[type=checkbox]')

            if (!checkbox.checked) {
                item.setAttribute('disabled', 'disabled')
            }

            checkbox.addEventListener('change', (e) => {
                if (!e.target.checked) {
                    item.setAttribute('disabled', 'disabled')
                } else {
                    item.removeAttribute('disabled')
                }
            })
        })
    }

    // repeat trip
    if (document.querySelector('[data-pf="add-trip"]')) {
        document.querySelector('[data-pf="add-trip"]').addEventListener('click', (e) => {

            let fields = document.querySelectorAll('[data-pf="trip-fields"]')

            if (fields.length > 5) return false

            let html = fields[0].cloneNode(true)

            html.querySelectorAll('input').forEach(item => {
                item.value = ''
            })
            html.querySelectorAll('select').forEach(item => {
                item.value = ''
                const selectCustom = new afSelect({
                    selector: 'select'
                })
                selectCustom.reinit(item)
            })

            fields[(fields.length - 1)].after(html)
        })
    }

    //repeat family unit 

    if (document.querySelector('[data-pf="add-family"]')) {
        document.querySelector('[data-pf="add-family"]').addEventListener('click', (e) => {

            let fields = document.querySelectorAll('[data-pf="family"]')

            if (fields.length > 10) return false

            let html = fields[0].cloneNode(true)

            html.querySelectorAll('input').forEach(item => {
                item.value = ''
            })

            html.querySelectorAll('select').forEach(item => {
                item.value = ''
                const selectCustom = new afSelect({
                    selector: 'select'
                })
                selectCustom.reinit(item)
            })

            html.querySelector('.form__group-title').innerText = (fields.length + 1) + '.'

            fields[(fields.length - 1)].after(html)

            initMaska()
        })
    }

    // reverse date

    if (document.querySelector('[data-pf="reverse"]')) {
        const items = document.querySelectorAll('[data-pf="reverse"]')

        function convertDateFormat(inputDate, input) {
            // Проверяем, соответствует ли формат даты
            const regex = /^(\d{2})\.(\d{2})\.(\d{4})$/;
            const match = inputDate.match(regex);

            if (match) {
                const day = match[1];
                const month = match[2];
                const year = match[3];

                // input.setAttribute('data-input-mask', 'date-reverse')

                // Возвращаем дату YYYY.MM.DD
                return `${year}.${month}.${day}`;
            } else {
                const regex2 = /^(\d{4})\.(\d{2})\.(\d{2})$/;
                const match2 = inputDate.match(regex2);

                if (match2) {
                    const year = match2[1];
                    const month = match2[2];
                    const day = match2[3];

                    // input.setAttribute('data-input-mask', 'date')

                    // Возвращаем дату DD.MM.YYYY
                    return `${day}.${month}.${year}`;
                } else {
                    alert('Не верный формат даты, допустимо ДД.ММ.ГГГГ или ГГГГ.ММ.ДД')
                    return inputDate;
                }
            }
        }

        function initMaskConvertDate(input) {
            if (input.value.match(/^(\d{2})\.(\d{2})\.(\d{4})$/)) {
                input.setAttribute('data-input-mask', 'date')
            }

            if (input.value.match(/^(\d{4})\.(\d{2})\.(\d{2})$/)) {
                input.setAttribute('data-input-mask', 'date-reverse')
            }

            initMaska()
        }



        items.forEach(item => {

            item.addEventListener('click', e => {
                let input = e.target.closest('div').querySelector('input')
                if (input.value.length) {
                    input.value = convertDateFormat(input.value, input)
                    initMaska()
                }

            })
        })

    }

    // submit form

    if (document.querySelector('[data-pf="submit"]')) {
        document.querySelector('[data-pf="submit"]').addEventListener('click', (e) => {


            let form = document.querySelector('[data-pf="form"]')
            let errLog = [];

            form.querySelectorAll('input, select').forEach(item => {

                console.log(item.tagName)

                switch (item.tagName) {
                    case 'INPUT':

                        let parent = item.closest('.input-material')

                        if (item.getAttribute('required') && !item.value.trim().length) {
                            parent.classList.add('err')
                            errLog.push(item.getAttribute('placeholder'))
                        } else {

                            if (parent) {
                                !parent.classList.contains('err') || parent.classList.remove('err')
                            }


                        }

                        break;
                }
            })

            if (errLog.length) {
                e.preventDefault()

                const tooltipPopup = new afLightbox({
                    mobileInBottom: true
                })

                let html = `
                
                    <div class="confirm" >
                        <div class="confirm__title" >В анкете не заполнено полей ${errLog.length}</div>
                        <div class="confirm__btn" >
                            <button class="btn" data-confirm="save" >Сохранить</button>
                            <button class="btn btn-line" data-confirm="edit" >Заполнить</button>
                        </div>
                    </div>

                `;

                tooltipPopup.open(html, (e) => {
                    e.querySelector('[data-confirm="save"]').addEventListener('click', e => {
                        form.submit()
                    })

                    e.querySelector('[data-confirm="edit"]').addEventListener('click', e => {
                        tooltipPopup.close()

                        scrollToTargetAdjusted({
                            elem: document.querySelector('.err')
                        })
                    })
                })
            }



        })
    }

    // copy fields

    if (document.querySelector('.profile--manager')) {
        let container = document.querySelector('.profile--manager')
        let inputs = container.querySelectorAll('.input-material')
        let selects = container.querySelectorAll('.af-select')

        const copyClipboard = (text) => {
            navigator.clipboard.writeText(text)
                .then(() => {
                    window.STATUS.msg('Скопирован в буфер!')
                })
                .catch(err => {
                    window.STATUS.err('Не удалось скопировать в буфер обмена')
                });
        }

        inputs.forEach(item => {
            item.addEventListener('click', e => {
                copyClipboard(item.querySelector('input, textarea').value)
            })
        })

        selects.forEach(item => {
            item.addEventListener('click', e => {
                copyClipboard(item.querySelector('select').value)
            })
        })
    }



}); //dcl
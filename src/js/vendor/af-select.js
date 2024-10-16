class afSelect {

    constructor(option) {
        this.selector = option.selector;
        this.selectAll = document.querySelectorAll(this.selector)
        this.on = option.on ? option.on : false
    }

    init() {
        this.renderTemplate()
        this.clickEventOut()
    }

    reinit(elem) {
        const _this = this;

        let item = elem.parentNode

        if (item.querySelector('.select-styled')) {
            item.querySelector('.select-styled').remove()
            item.querySelector('.select-list').remove()

            item.querySelectorAll('[selected]').forEach(opt => opt.removeAttribute('selected'))
        }

        _this.renderOption(item)
        _this.clickEventOpenSelect(item)

        item.classList.remove('af-select--selected')

    }

    ajaxOption(item, callback) {
        let xhr = new XMLHttpRequest();
        let result = null;
        xhr.open('GET', item.dataset.ajax)
        xhr.responseType = 'json';
        xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8');
        xhr.send()
        xhr.onerror = function () {
            console.err('Error: afSelect ajax request failed')
        };

        xhr.onreadystatechange = function () {

            if (xhr.readyState == 3) {
                item.closest('.af-select').querySelector('.select-list').classList.add('select-list--load')
            }

            if (xhr.readyState == 4) {
                item.closest('.af-select').querySelector('.select-list').classList.remove('select-list--load')
            }

        };

        xhr.onload = function () {
            callback(xhr.response)
        };

        return result;
    }

    renderOption(item) {

        var _this = this;
        var select = item.querySelector('select')
        var placeholder = select.getAttribute('placeholder')
        var label = select.getAttribute('data-label')
        var multiple = select.getAttribute('multiple')

        const styledSelect = document.createElement('div')
        styledSelect.classList.add('select-styled');
        styledSelect.innerHTML = '<span>' + placeholder + '</span>';

        const styledOptions = document.createElement('ul')
        styledOptions.classList.add('select-options');

        const styledList = document.createElement('div')
        styledList.classList.add('select-list');



        styledList.appendChild(styledOptions)

        if (!item.querySelector('.select-styled')) {
            item.appendChild(styledSelect)
        }

        if (!item.querySelector('.select-options')) {
            item.appendChild(styledList)
        }



        function createOptions(item) {
            item.querySelectorAll('select > option').forEach(function (item, index) {

                // create li elem
                const li = document.createElement('li')
                li.innerHTML = item.innerText
                li.setAttribute('rel', item.value)

                if (multiple) {
                    let check = document.createElement('span')
                    check.classList.add('af-check-multiple')
                    li.append(check)
                }

                //если не задан placeholder, сделать им первый элемент
                if (index == 0 && !placeholder) {
                    styledSelect.innerHTML = '<span>' + item.innerText + '</span>';
                }

                //если есть selected элемент
                if (item.getAttribute('selected')) {

                    function selectedText(option) {
                        if (multiple) {

                            let selected_arr = [];

                            option.parentNode.querySelectorAll('option[selected]').forEach(function (item) {
                                selected_arr.push(item.innerText)
                            })

                            return (selected_arr.length ? selected_arr.join(', ') : placeholder);
                        } else {
                            return option.innerText
                        }
                    }

                    if (!placeholder) {
                        styledSelect.innerHTML = '<span>' + selectedText(item) + '</span>';
                        li.classList.add('active')
                    } else {
                        styledSelect.innerHTML = '<span class="af-selected-placeholder" data-af-placeholder="' + placeholder + '">' + selectedText(item) + '</span>';
                        li.classList.add('active')
                    }
                }
                if (!item.getAttribute('disabled')) {
                    styledOptions.appendChild(li)
                    _this.clickEventListItem(li, item, index)
                }

            })

            if (!item.querySelectorAll('select > option[selected]').length) {
                styledSelect.innerHTML = '<span class="af-selected-placeholder" data-af-placeholder="' + placeholder + '">' + label + '</span>';

            } else {
                item.closest('.af-select').classList.add('af-select--selected')
            }

        }

        const createFind = () => {
            if ((select.getAttribute('data-find') != 'false' && select.querySelectorAll('option').length > 5)) {
                const styledFindInput = document.createElement('input')
                styledFindInput.setAttribute('type', 'text');
                styledFindInput.setAttribute('placeholder', 'Поиск по списку');

                if (!styledList.querySelector('input')) {
                    styledList.prepend(styledFindInput)
                }



                styledFindInput.addEventListener('keyup', (e) => {
                    this.findOption(e)
                })
            }
        }

        //ajax option
        if (select.dataset.ajax) {

            this.ajaxOption(select, (arr) => {

                select.innerHTML = '';

                let attrSelectedId = select.dataset.selected;
                let arrtPlaceholder = select.getAttribute('placeholder')

                arr.unshift({
                    text: (arrtPlaceholder ? arrtPlaceholder : '-Выберите-'),
                    value: ''
                });

                arr.forEach(function (item) {
                    let option = document.createElement('option')
                    option.value = item.value
                    option.innerText = item.text

                    if (attrSelectedId == item.value) {
                        option.setAttribute('selected', true)
                        select.removeAttribute('data-selected')
                    }

                    select.append(option)
                })

                createOptions(item);

                createFind()
            })

        }

        //default
        if (!select.dataset.ajax) {
            createOptions(item)
        }


        createFind()



        //add public methods


        select['afSelect'] = new Object;

        select.afSelect.open = function () {
            _this.openSelect(item)
        }
        select.afSelect.close = function () {
            _this.closeSelect()
        }
        select.afSelect.update = function () {
            _this.reinit(select)
        }



    }

    findOption(event) {

        const listOption = event.target.closest('.select-list').querySelectorAll('li')
        const q = event.target.value

        listOption.forEach(item => {
            if (item.innerText.toLowerCase().indexOf(q.toLowerCase()) !== -1) {
                item.style.display = 'block'
            } else {
                item.style.display = 'none'
            }
        })

    }

    renderTemplate() {

        const _this = this;
        const istanse = []



        this.selectAll.forEach(function (item, index) {



            if (!item.classList.contains('select-hidden')) {
                item.classList.add('select-hidden');
                const wrapper = document.createElement('div');
                wrapper.classList.add('af-select');

                if (item.getAttribute('multiple')) {
                    wrapper.classList.add('af-select--multiple');
                }

                if (item.getAttribute('data-label')) {
                    wrapper.setAttribute('data-title', item.getAttribute('data-label'));
                }

                wrapper.innerHTML = item.outerHTML;
                item.parentNode.replaceChild(wrapper, item);

                //add event 

                istanse.push(wrapper)
            }

        })

        istanse.forEach(function (item, index) {
            _this.renderOption(item)
            _this.clickEventOpenSelect(item)
        })


    }

    openSelect(elem) {

        //console.log(elem)

        if (elem.querySelector('.select-styled.active')) {
            this.closeSelect()
            return false
        }

        if (document.querySelector('.select-styled.active')) {
            document.querySelectorAll('.select-styled.active').forEach(item => {
                item.closest('.af-select').querySelector('select').afSelect.close()
            })
        }

        if (elem.querySelector('select').dataset.ajax && !elem.querySelector('.select-styled').classList.contains('active')) {
            // elem.querySelector('.select-list').remove()
            // this.renderOption(elem);
        }

        if (window.innerHeight - elem.getBoundingClientRect().bottom < 250) {
            elem.classList.add('af-select--top')
        } else {
            elem.classList.contains('af-select--top') ? elem.classList.remove('af-select--top') : ''
        }

        elem.style.maxWidth = (elem.offsetWidth) + 'px'
        elem.querySelector('.select-styled').classList.add('active')
        elem.querySelector('.select-options').classList.add('active')
        elem.querySelector('.select-list').classList.add('active')
        document.querySelector('body').classList.add('af-select-open')

    }

    closeSelect() {
        if (!document.querySelector('.select-styled.active')) return false

        document.querySelector('.select-styled.active').classList.remove('active')
        document.querySelector('.select-options.active').classList.remove('active')
        document.querySelector('.select-list.active').classList.remove('active')
        document.querySelector('body').classList.remove('af-select-open')
    }

    clickEventOut() {
        const _this = this;
        document.addEventListener('click', function (e) {
            _this.closeSelect()
        })
    }

    clickEventListItem(elem, option, index) {

        const parentElem = option.parentNode.parentNode
        const _this = this;
        const placeholder = parentElem.querySelector('select').getAttribute('data-label') || parentElem.querySelector('select').getAttribute('placeholder');
        const label = parentElem.querySelector('select').getAttribute('placeholder')
        const multiple = parentElem.querySelector('select').getAttribute('multiple')
        const styledSelect = parentElem.querySelector('.select-styled')


        elem.addEventListener('click', function (event) {

            event.stopPropagation()
            event.preventDefault()

            option.closest('.af-select').classList.add('af-select--selected')

            if (parentElem.querySelector('.select-options li.active')) {

                // если мульти то не сбрасывать active
                if (!multiple) {
                    parentElem.querySelector('.select-options li.active').classList.remove('active')
                }
            }

            if (this.classList.contains('active')) {
                this.classList.remove('active')
                option.removeAttribute('selected')
            } else {
                this.classList.add('active')
                option.setAttribute('selected', 'selected')
            }

            function selectedText(option) {
                if (multiple) {

                    let selected_arr = [];

                    option.parentNode.querySelectorAll('option[selected]').forEach(function (item) {
                        selected_arr.push(item.innerText)
                    })

                    return (selected_arr.length ? selected_arr.join(', ') : placeholder);
                } else {
                    return option.innerText
                }
            }

            //если есть placeholder
            if (placeholder) {
                styledSelect.innerHTML = '<span class="af-selected-placeholder" data-af-placeholder="' + placeholder + '">' + selectedText(option) + '</span>';
            } else {
                parentElem.querySelector('.select-styled span').innerHTML = selectedText(option)
            }

            if (!multiple) {
                parentElem.querySelector('select').value = this.getAttribute('rel')
            }

            var dispatchEvent = new Event('change');
            parentElem.querySelector('select').dispatchEvent(dispatchEvent);

            if (!event.target.classList.contains('af-check-multiple')) {
                _this.closeSelect()
            }

            if (_this.on.change) {
                _this.on.change(option)
            }



        })
    }

    clickEventOpenSelect(elem) {
        const _this = this;

        function addEventOpen(event) {
            event.stopPropagation()
            event.preventDefault()

            if (event.target.closest('.select-styled')) {
                _this.openSelect(this)
            }

        }

        elem.removeEventListener('click', addEventOpen)
        elem.addEventListener('click', addEventOpen)
    }

}
const search_btn = document.querySelector('#search_btn')

const search_kind_el = document.querySelector('#search_kind')

const search_value_el = document.querySelector('#search_value')


function do_search() {
    const search_kind = search_kind_el.value
    const search_value = search_value_el.value

    window.location = `?kind=${search_kind}&value=${encodeURIComponent(search_value)}`
}

if (search_value_el) {
    search_value_el.addEventListener('keypress', (e) => {
        if (e.key == "Enter") {
            do_search()
        }
    })
    search_btn.addEventListener('click', do_search)
}

const pagination_btn = document.querySelectorAll('li > a')

for (const btn of pagination_btn) {
    btn.addEventListener('click', () => {
        params = new URL(window.location).searchParams
        params.set('page', btn.dataset.target)
        window.location = '?' + params.toString()
    })
}
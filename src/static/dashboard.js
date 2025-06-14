source = new EventSource('/dashboard/sse')

window.onbeforeunload = () => {
    source.close()
}

const table = document.querySelector('tbody')

const go_in = [
    { opacity: 0 },
    { opacity: 100 }
]

const go_out = [
    { opacity: 0}
]

const total_count = document.querySelector('#total_count')
const pending_count = document.querySelector('#pending_count')

source.addEventListener('register', (e) => {
    console.log(e)
    total_count.innerText = +total_count.innerText + 1
    pending_count.innerText = +pending_count.innerText + 1
    const do_it = () => {
        const {num, name, tin} = JSON.parse(e.data)
        const row = table.insertRow(0)
        const th = document.createElement('th')
        th.innerText = num
        row.appendChild(th)

        const name_cell = row.insertCell()
        name_cell.innerText = name

        const tin_cell = row.insertCell()
        tin_cell.innerText = tin

        const status_cell = row.insertCell()
        status_cell.innerHTML = '<span class="badge text-bg-warning">Pending</span>'
        row.animate(go_in, {duration: 500, easing: "cubic-bezier(0.42, 0, 0.58, 1)"})
    }

    if (table.childElementCount >= 9) {
        const last_row = table.lastElementChild
        const anim = last_row.animate(go_out, {duration: 500, easing: "cubic-bezier(0.42, 0, 0.58, 1)"})

        anim.addEventListener('finish', () => {
            console.log('123')
            table.removeChild(last_row)
            do_it()
        })
    } else {
        do_it()
    }

})
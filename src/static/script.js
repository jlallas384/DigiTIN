function hide_element(elem) {
    elem.classList.add('d-none')
}

function unhide_element(elem) {
    elem.classList.remove('d-none')
}

function animate(element, animation, callback) {
    element.classList.add(animation)
    element.addEventListener('animationend', () => {
        element.classList.remove(animation)
        if (callback) {
            callback()
        }
    }, { once : true})
}

const dob = document.querySelector('#date_of_birth')

new coreui.DatePicker(dob, {
    maxDate: new Date(),
    name: 'date_of_birth',
    inputDateFormat: date => dayjs(date).locale('en').format('YYYY-MM-DD'),
    inputDateParse: date => dayjs(date, 'YYYY-MM-DD', 'en').toDate()
})

const eff_date = document.querySelector('#eff_date')

new coreui.DatePicker(eff_date, {
    maxDate: new Date(),
    name: 'id_effectivity_date',
    inputDateFormat: date => dayjs(date).locale('en').format('YYYY-MM-DD'),
    inputDateParse: date => dayjs(date, 'YYYY-MM-DD', 'en').toDate()
})

const exp_date = document.querySelector('#exp_date')

new coreui.DatePicker(exp_date, {
    name: 'id_expiry_date',
    inputDateFormat: date => dayjs(date).locale('en').format('YYYY-MM-DD'),
    inputDateParse: date => dayjs(date, 'YYYY-MM-DD', 'en').toDate(),
})

const bus_reg_date = document.querySelector('#bus_reg_date')

new coreui.DatePicker(bus_reg_date, {
    maxDate: new Date(),
    name: 'bus_reg_date',
    inputDateFormat: date => dayjs(date).locale('en').format('YYYY-MM-DD'),
    inputDateParse: date => dayjs(date, 'YYYY-MM-DD', 'en').toDate()
})

const date_pickers_input = document.querySelectorAll('.date-picker-input')

for (const picker_input of date_pickers_input) {
    const picker_div = picker_input.parentElement.parentElement
    const events = ['change', 'keyup', 'paste']

    for (const event of events) {
        picker_input.addEventListener(event, () => {
            picker_div.classList.remove('is-invalid')
        })
    }
}


const civil_status = document.querySelector('#civil_status')
const spouse_inf = document.querySelector('#spouse_inf')

civil_status.addEventListener('change', () => {
    const is_married = civil_status.value == 'Married'
    if (is_married) {
        unhide_element(spouse_inf)
    } else {
        hide_element(spouse_inf)
    }

    const inputs = document.querySelectorAll('#spouse_name, #spouse_tin')
    for (const input of inputs) {
        input.required = is_married
    }
})

const back_btn = document.querySelector('#back_btn')
const continue_btn = document.querySelector('#continue_btn')
const review_btn = document.querySelector('#review_btn')

const reg_pages = document.querySelectorAll('.reg_page')

let active_reg_page_num = 0

unhide_element(reg_pages[active_reg_page_num])

const pages = document.querySelectorAll('.page')
let active_page_num = 0


function validate(e) {
    const active_page = reg_pages[active_reg_page_num];
    const inputs = active_page.querySelectorAll('input, select');

    let fail = false;

    for (const input of inputs) {

        if (!input.checkValidity()) {
            fail = true;
            input.classList.add('is-invalid')
            input.addEventListener('input', () => {
                input.classList.remove('is-invalid')
            }, {once: true})
        }

    }

    const pickers = active_page.querySelectorAll('.date-picker-input')

    for (const picker_input of pickers) {
        const picker_div = picker_input.parentElement.parentElement
        if (Number.isNaN(Date.parse(picker_input.value))) {
            picker_div.classList.add('is-invalid')
            fail = true
        }
    }

    console.log(fail);
    if (fail) {
        e.stopImmediatePropagation();
    }    
}

continue_btn.addEventListener('click', validate);

function hide_prev_if_first() {
    if (active_reg_page_num == 0) {
        hide_element(back_btn)
    }
}

hide_prev_if_first()

function show_prev_if_not_first() {
    if (active_reg_page_num != 0) {
        unhide_element(back_btn)
    }
}

function set_buttons_disabled(state) {
    continue_btn.disabled = state;
    back_btn.disabled = state;
    review_btn.disabled = state
}


continue_btn.addEventListener('click', () => {
    const active_page = reg_pages[active_reg_page_num];
    const next_page = reg_pages[active_reg_page_num + 1];

    active_reg_page_num++;

    set_buttons_disabled(true);

    animate(active_page, 'slide-out-left', () => {
        window.scroll({
            top: 0,
            left: 0,
            behavior: "smooth",
        });
        animate(next_page, 'slide-in-right')

        unhide_element(next_page)
        hide_element(active_page)
        if (active_reg_page_num == reg_pages.length - 1) {
            unhide_element(review_btn.parentElement)
            hide_element(continue_btn.parentElement)
        }
        show_prev_if_not_first();
        set_buttons_disabled(false);        
    })
})

back_btn.addEventListener('click', () => {
    const active_page = reg_pages[active_reg_page_num];
    const prev_page = reg_pages[active_reg_page_num - 1];
    active_reg_page_num--;

    set_buttons_disabled(true);

    animate(active_page, 'slide-out-right', () => {
        window.scroll({
            top: 0,
            left: 0,
            behavior: "smooth",
        });
        animate(prev_page, 'slide-in-left')

        unhide_element(prev_page)
        hide_element(active_page)

        if (active_reg_page_num != reg_pages.length - 1) {
            hide_element(review_btn.parentElement)
            unhide_element(continue_btn.parentElement)
        }

        hide_prev_if_first();
        set_buttons_disabled(false);
    })
})

const progress_bars = document.querySelectorAll('#progress_bar > div')

function create_colored_box(heading_text) {
    const elem = document.createElement('div')
    elem.classList.add('py-4',  'px-3', 'form-box', 'rounded')

    const heading = document.createElement('h5');
    heading.classList.add('text-primary')
    heading.appendChild(document.createTextNode(heading_text))

    elem.appendChild(heading)

    return elem
}

function create_box_data(heading_text, data, first=false) {
    const elem = create_colored_box(heading_text)
    if (!first) {
        elem.classList.add('mt-4')
    }
    const div = document.createElement('div')
    div.classList.add('row', 'mt-3')

    for (const [label, value] of data) {
        const p = document.createElement("p");

        const span = document.createElement("span");
        span.classList.add('fw-bold')
        span.textContent = `${label}: `

        p.appendChild(span);
        p.appendChild(document.createTextNode(value));

        div.appendChild(p)
    }
    elem.appendChild(div)
    return elem
}

const form = document.querySelector('#registration')
const name_components = ['first_name', 'middle_name', 'last_name', 'suffix']
let form_data

function get_fullname() {
    let taxpayer_name = ''
    let first = true
    for (const component of name_components) {
        const value = form_data.get(component)
        if (value) {
            if (!first) {
                taxpayer_name += ' '
            }
            taxpayer_name += value
        }
        first = false
    }
    return taxpayer_name
}

function populate_review_page(page) {
    const content = page.querySelector('#review_page_content')
    content.innerHTML = ''
    form_data = new FormData(form)

    content.appendChild(create_box_data('Personal Information', [
        ['Full Name', get_fullname()],
        ['Date of Birth', form_data.get('date_of_birth')],
        ['Place of Birth', form_data.get('place_of_birth')],
        ['Gender', form_data.get('gender')],
        ['Civil Status', form_data.get('civil_status')],
        ["Mother's Maiden Name", form_data.get('mothers_name')],
        ["Father's Name", form_data.get('fathers_name')],
        ["Citizenship", form_data.get('citizenship')],
        ["Other Citizenship", form_data.get('other_citizenship') || 'N/A']
    ]), true)

    content.appendChild(create_box_data('Contact Information', [
        ['Contact Type', form_data.get('pref_con_type')],
        ['Contact Number', form_data.get('contact_num')],
        ['Email Address', form_data.get('email_addr')]
    ]))

    content.appendChild(create_box_data('Address Information', [
        ['Local Residence Address', form_data.get('local_address')],
        ['Business Address', form_data.get('business_address')],
        ['Foreign Address', form_data.get('foreign_address')]
    ]))

    content.appendChild(create_box_data('Identification Details', [
        ['PhilSys Number', form_data.get('pcn') || 'N/A'],
        ['ID Type', form_data.get('id_type')],
        ['ID Number', form_data.get('id_num')],
        ['Effectivity Date', form_data.get('id_effectivity_date')],
        ['Expiry Date', form_data.get('id_expiry_date')],
        ['Issuer', form_data.get('id_issuer')],
        ['Country of Issue', form_data.get('id_place_of_issue')]
    ]))

    content.appendChild(create_box_data('Taxpayer Information', [
        ['Taxpayer Type', form_data.get('taxpayer_type')],
        ['Purpose of TIN Application', form_data.get('purpose')],
        ['How much is your expected Annual Gross Sales (GS)?', form_data.get('exp_annual_gs')],
        ['Are you availing of the 8% income tax rate option in lieu of graduated income tax rates?', form_data.get('tax_rate_opt')]
    ]))

    if (civil_status.value == 'Married') {
        content.appendChild(create_box_data('Spouse Information', [
            ['Employment Status of Spouse', form_data.get('spouse_emp_stat') || 'N/A'],
            ['Spouse Name', form_data.get('spouse_name') || 'N/A'],
            ['Spouse TIN', form_data.get('spouse_tin') || 'N/A'],
            ["Spouse Employer's Name", form_data.get('spouse_emp_name') || 'N/A'],
            ["Spouse Employer's TIN", form_data.get('spouse_emp_tin') || 'N/A']
        ]))
    }

    const business = create_colored_box('Business Information')
    business.classList.add('mt-4')
    content.appendChild(business)

    for (let i = 0; i < business_infos.length; i++) {
        const div = document.createElement('div')
        if (i == 0) {
            div.classList.add('mt-3')
        } else {
            div.classList.add('mt-5')
        }
        business.appendChild(div)

        const bus_header = document.createElement('p')
        bus_header.classList.add('fw-bold')
        div.appendChild(bus_header)

        bus_header.textContent = `Business ${i + 1}:`
        const data = [
            ['Trade/Business Name', business_infos[i].bus_name],
            ['Regulatory Body', business_infos[i].reg_body],
            ['Registration Number', business_infos[i].business_reg_num],
            ['Registration Date', business_infos[i].reg_date],
            ['Line of Business', business_infos[i].line_of_business]
        ]
        for (const [label, value] of data) {
            const p = document.createElement("p");

            const span = document.createElement("span");
            span.classList.add('fw-bold')
            span.textContent = `${label}: `

            p.appendChild(span);
            p.appendChild(document.createTextNode(value));

            div.appendChild(p)
        }

    }
}

review_btn.addEventListener('click', validate)
review_btn.addEventListener('click', () => {
    const active_page = pages[active_page_num]
    const next_page = pages[active_page_num + 1]

    populate_review_page(next_page)

    set_buttons_disabled(true)


    animate(active_page, 'slide-out-left', () => {
        window.scroll({
            top: 0,
            left: 0,
            behavior: "smooth",
        });
        const current_bar = progress_bars[active_page_num]

        current_bar.children[0].classList.remove('bg-primary', 'text-white')
        current_bar.children[0].classList.add('bg-gray')
        current_bar.children[1].classList.remove('text-primary')

        const next_bar = progress_bars[active_page_num + 1]

        next_bar.children[0].classList.add('bg-primary', 'text-white')
        next_bar.children[1].classList.add('text-primary')
        active_page_num++

        animate(next_page, 'slide-in-right')
        unhide_element(next_page)
        hide_element(active_page)

        set_buttons_disabled(false)
    })
})


const back_to_edit_btn = document.querySelector('#back_to_edit_btn')

back_to_edit_btn.addEventListener('click', () => {
    const active_page = pages[active_page_num]
    const prev_page = pages[active_page_num - 1]

    animate(active_page, 'slide-out-right', () => {
        const current_bar = progress_bars[active_page_num]

        current_bar.children[0].classList.remove('bg-primary', 'text-white')
        current_bar.children[0].classList.add('bg-gray')
        current_bar.children[1].classList.remove('text-primary')

        const next_bar = progress_bars[active_page_num - 1]

        next_bar.children[0].classList.add('bg-primary', 'text-white')
        next_bar.children[1].classList.add('text-primary')
        active_page_num--

        animate(prev_page, 'slide-in-left')
        unhide_element(prev_page)
        hide_element(active_page)        
    })
})



const edit_modal = document.querySelector('#edit_modal')
const bs_modal = new bootstrap.Modal(edit_modal)

const business_infos = []
let current_business_index = 0

const add_btn = document.querySelector('#add_btn')
const edit_row = document.querySelector('#edit_row')

edit_modal.addEventListener('show.bs.modal', (e) => {
    if (e.relatedTarget == add_btn) {
        business_infos.push({
            bus_name: '',
            reg_body: '',
            business_reg_num: '',
            reg_date: '',
            line_of_business: ''
        })
        current_business_index = business_infos.length - 1
        const html_content = `
            <tr>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td><button type="button" class="btn btn-light" data-bs-toggle="modal" data-bs-target="#edit_modal">Edit</button></td>
            </tr>
        `
        edit_row.insertAdjacentHTML('beforebegin', html_content)
    } else {
        const buttons = Array.from(document.querySelectorAll('#business_infos button'))
        current_business_index = buttons.findIndex((btn) => btn == e.relatedTarget)
        console.assert(current_business_index != -1)
    }
    const inputs = edit_modal.querySelectorAll('input');
    const info = business_infos[current_business_index]
    inputs[0].value = info.bus_name
    inputs[1].value = info.reg_body
    inputs[2].value = info.business_reg_num
    inputs[3].value = info.reg_date
    inputs[4].value = info.line_of_business            
})

const save_btn = document.querySelector('#save_btn')

function set_edit_row() {
    const inputs = edit_modal.querySelectorAll('input');    

    const rows = document.querySelectorAll('#business_infos tbody tr')
    const row = rows[current_business_index]

    business_infos[current_business_index] = {
        bus_name: inputs[0].value,
        reg_body: inputs[1].value,
        business_reg_num: inputs[2].value,
        reg_date: inputs[3].value,
        line_of_business: inputs[4].value
    }

    const info = business_infos[current_business_index]
    console.log(info)

    const tds = row.querySelectorAll('td')

    tds[0].textContent = info.bus_name
    tds[1].textContent = info.reg_body
    tds[2].textContent = info.business_reg_num
    tds[3].textContent = info.reg_date
    tds[4].textContent = info.line_of_business
}

save_btn.addEventListener('click', (e) => {
    const inputs = edit_modal.querySelectorAll('input');
    let fail = false;

    for (const input of inputs) {
        if (!input.checkValidity()) {
            fail = true;
            input.classList.add('is-invalid')
            input.addEventListener('input', () => {
                input.classList.remove('is-invalid')
            }, {once: true})
        }
    }

    const picker_input = edit_modal.querySelector('.date-picker-input')

    const picker_div = picker_input.parentElement.parentElement
    if (Number.isNaN(Date.parse(picker_input.value))) {
        picker_div.classList.add('is-invalid')
        fail = true
    }

    if (!fail) {
        set_edit_row()
        bs_modal.hide()
    }
})

const delete_btn = document.querySelector('#delete_btn')

delete_btn.addEventListener('click', () => {
    business_infos.splice(current_business_index, 1)
    const rows = document.querySelectorAll('#business_infos tbody tr')
    const row = rows[current_business_index]   
    row.remove()
    bs_modal.hide()
})


const certify_chk = document.querySelector('#certify')
const submit_btn = document.querySelector('#submit_btn')

certify_chk.addEventListener('change', (e) => {
    submit_btn.disabled = !e.target.checked
})

const toast_elem = document.querySelector('.toast')
const toast = new bootstrap.Toast(toast_elem)

form.addEventListener('submit', async (e) => {
    e.preventDefault()
    e.submitter.disabled = true

    const body = Object.fromEntries(form_data.entries())
    body['business_details'] = business_infos.map((e, index) => {
        return {num: index + 1, ...e}
    })

    for (const name in body) {
        if (body[name] === '') {
            delete body[name]
        }
    }


    let taxpayer_name = get_fullname()

    for (const component of name_components) {
        delete body[component]
    }

    body['taxpayer_name'] = taxpayer_name

    const response = await fetch('/api/register', {
        method: 'POST',
        body: JSON.stringify(body),
        headers: {
            'content-type': 'application/json'
        },
    })   

    if (response.status == 201) {
        window.location.replace('/success') 
    } else {
        toast.show()
        e.submitter.disabled = false
    }
})


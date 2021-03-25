const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)
const STUDENT_MANAGER_KEY = 'F8_Student'

const studentList = $('#student-list')
const inputs = $$('.form-control')
const inputName = $('.form-control.name')
const inputEmail = $('.form-control.email')
const inputPhone = $('.form-control.phone')
const inputAddress = $('.form-control.address')
const createBtn = $('.btn-create')

let isEdit = false
let editStudentIndex = null
let formRules = {};

let validatorRules = {
    required: function (value) {
        return value ? undefined : 'Vui lòng nhập trường này'
    },
    email: function (value) {
        var regex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
        return regex.test(value) ? undefined : 'Vui lòng nhập Email'
    },
    phone: function (value) {
        var regex = /^\(?([0-9]{3})\)?[-. ]?([0-9]{4})[-. ]?([0-9]{3,4})$/;
        return regex.test(value) ? undefined : 'Vui lòng nhập số điện thoại có độ dài 10 hoặc 11 số'

    }
}

const students = JSON.parse(localStorage.getItem(STUDENT_MANAGER_KEY)) || [
    {
        name: 'Sơn Lê',
        email: 'email@abc.com',
        phone: '12345678910',
        address: 'Vinh, Nghệ An',
    },
    {
        name: 'Hoàn Nguyễn',
        email: 'email@abc.com',
        phone: '12345678910',
        address: 'Đống Đa, Hà Nội',
    }

]
function render() {

    // render sinh viên
    const studentListHtml = students.map(function (student, index) {
        return `
            <li class="cards_item" data-index="${index}">
                <div class="card">
                    <div class="card_image"><img src="https://vanhienblog.info/wp-content/uploads/2019/02/anh-gai-xinh-dep-hot-girl-1-00.jpg">
                        <span class="badge badge-info" onclick="editStudent(event)">Edit</span>
                        <span class="badge badge-danger" onclick="deleteStudent(event)">Delete</span>
                    </div>
                    <div class="card_content">
                        <h2 class="card_text">Name: ${student.name}</h2>
                        <p class="card_text">Email: ${student.email}</p>
                        <p class="card_text">Phone: ${student.phone}</p>
                        <p class="card_text">Address: ${student.address}</p>
                    </div>
                </div>
            </li>
        `
    })
    studentList.innerHTML = studentListHtml.join('')
}
// lấy các validation rule từ input
// gán các hành động khi blur và nhập dữ liệu vào input
function setValidation() {
    for (var input of inputs) {
        const rules = input.getAttribute('rules').split('|');
        for (const rule of rules) {
            const ruleFunc = validatorRules[rule];

            if (Array.isArray(formRules[input.className])) {
                formRules[input.className].push(ruleFunc);

            } else {
                formRules[input.className] = [ruleFunc]
            }
        }

        input.onblur = handleValidate;
        input.oninput = handleClearError;
    }

}

// Thực hiện validate cho input
function handleValidate(event) {
    var rules = formRules[event.target.className];
    var errorMessage;

    rules.some(function (rule) {
        errorMessage = rule(event.target.value);
        return errorMessage;
    })

    // Neu co loi thi hien thi message
    if (errorMessage) {
        var formGroup = getParentElement(event.target, '.form-group');

        if (formGroup) {
            formGroup.classList.add('invalid')
            var formMessage = formGroup.querySelector('.form-message');
            if (formMessage) {
                formMessage.innerText = errorMessage;
            }
        }
    }
    return !errorMessage;
}
// Xoá message báo lỗi khi đang nhậP input
function handleClearError(event) {
    var formGroup = getParentElement(event.target, '.form-group');
    if (formGroup.classList.contains('invalid')) {
        formGroup.classList.remove('invalid');
        var formMessage = formGroup.querySelector('.form-message');

        if (formMessage) {
            formMessage.innerText = '';
        }

    }

}

// Tạo sinh viên nếu đã validate và không có email sinh viên trong database
function createStudent() {
    let isValid = true;

    for (var input of inputs) {
        if (!handleValidate({ target: input })) {
            isValid = false;
        }
    }

    if (isValid) {
        const newStudent = {
            name: inputName.value.trim(),
            email: inputEmail.value.trim(),
            phone: inputPhone.value.trim(),
            address: inputAddress.value.trim(),
        }
        const isExist = students.some(function (student) {
            return student.email === newStudent.email
        })
        if (!isExist) {
            students.push(newStudent)
            localStorage.setItem(STUDENT_MANAGER_KEY, JSON.stringify(students))
        } else {
            const messageElement = $('.message')
            messageElement.innerText = 'Sinh viên này đã tồn tại'
        }


        handleEvents()
        render()
    }
}

function deleteStudent(event) {

    const studentItem = getParentElement(event.target, '.cards_item')
    students.splice(studentItem.dataset.index, 1)

    // Clear Input, trong trường hợp click vào edit trước rồi click vào delete
    // nếu ấn Save thì thông tin của sinh viên đã bị xoá sẽ ghi đè lên sinh viên khác
    inputName.value = ''
    inputEmail.value = ''
    inputPhone.value = ''
    inputAddress.value = ''

    localStorage.setItem(STUDENT_MANAGER_KEY, JSON.stringify(students))

    render()
}

function saveStudent(index) {
    let isValid = true;

    for (var input of inputs) {
        if (!handleValidate({ target: input })) {
            isValid = false;
        }
    }
    if (isValid) {

        // Lưu thông tin sinh viên 
        students[index].name = inputName.value;
        students[index].email = inputEmail.value;
        students[index].phone = inputPhone.value;
        students[index].address = inputAddress.value;

        // Set lại các thuộc tính
        editStudentIndex = null
        isEdit = false

        // Clear Input
        inputName.value = ''
        inputEmail.value = ''
        inputPhone.value = ''
        inputAddress.value = ''
        localStorage.setItem(STUDENT_MANAGER_KEY, JSON.stringify(students))
        handleEvents()
        render()
    }
}

function editStudent(event) {
    const studentItem = getParentElement(event.target, '.cards_item')
    const currentStudent = students[studentItem.dataset.index]

    // Lấy thông tin và hiển thị ở các ô input
    inputName.value = currentStudent.name;
    inputEmail.value = currentStudent.email;
    inputPhone.value = currentStudent.phone;
    inputAddress.value = currentStudent.address;

    editStudentIndex = studentItem.dataset.index
    isEdit = true

    handleEvents()
    render()
}

function handleEvents() {
    if (isEdit) {
        createBtn.onclick = () => {
            saveStudent(editStudentIndex)
        }
        createBtn.innerText = 'Save'


    } else {
        createBtn.onclick = createStudent
        createBtn.innerText = 'Create'
    }
}



function getParentElement(element, parentSelector) {
    while (element.parentElement) {
        if (element.parentElement.matches(parentSelector)) {
            return element.parentElement
        }
        element = element.parentElement;

    }
}

function start() {
    setValidation()
    handleEvents()
    render()

}

start()
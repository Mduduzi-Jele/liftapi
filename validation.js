exports.emailValidation = (email) => {
    let pattern = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    let result = pattern.test(email.toString())
    return result
}

exports.passwordValidation = (password) => {
    let pattern = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,16}$/;
    let result = pattern.test(password.toString())
    return result
}

exports.nameValidation = (name) => {
    let pattern = /^[a-zA-Z]+$/
    let result = pattern.test(name.toString())
    return result
}


export function validateEmail(email) {
    // 邮箱格式的正则表达式
    var re = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    // 使用正则表达式验证邮箱格式
    return re.test(email);
}
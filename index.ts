function buttonClick(): void {
    let request = new XMLHttpRequest();
    request.open('GET', './exit', true);
    request.send();
    alert('Server is closed.');
}
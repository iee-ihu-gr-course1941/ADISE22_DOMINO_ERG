$.ajax({ 
    url: "dominoes.php/users/authorized",
    method: 'GET',
    dataType: "json",
    contentType: 'application/json',
    success: (data) => {
        if (data.authorized) {
            window.location.href = "..";
        }
    },
    error: () => {
        let toasts = new toast();
        toasts.show('something went wrong','error');
    },
    async:false
});

$(document).ready( () => {
    $("#login").submit((e) => {
        e.preventDefault();
        let toasts = new toast();
        $.ajax({
            url: "dominoes.php/users",
            method: 'POST',
            dataType: "json",
            contentType: 'application/json',
            data: JSON.stringify({
                username: $('#username').val(),
                password: $('#password').val()
            }),
            success: (data) => {
                $("#ubtn").attr('disabled', true);
                toasts.show(data.errormesg,'success');
                setInterval(function redirect() {
                    window.location.href = "..";
                }, 2000);
            },
            error: (er) => {
                const msg = JSON.parse(er.responseText);
                toasts.show(msg.errormesg,'error');
            }
            }
        );
    });
})
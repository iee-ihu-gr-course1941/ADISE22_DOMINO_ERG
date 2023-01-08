class toast {
    constructor() {
        toastr.options = {
            "closeButton": true,
            "newestOnTop": false,
            "progressBar": true,
            "positionClass": "toast-bottom-right",
            "preventDuplicates": false,
            "onclick": null,
            "showDuration": "300",
            "hideDuration": "1000",
            "timeOut": "2000",
            "extendedTimeOut": "1000",
            "showEasing": "swing",
            "hideEasing": "linear",
            "showMethod": "fadeIn",
            "hideMethod": "fadeOut"
        }
    }

    show(msg,type) {
        switch (type) {
            case 'success':
                toastr.success(msg);
                break;
            case 'error':
                toastr.error(msg);
                break;
            case 'warning':
                toastr.warning(msg);
                break;
            case 'info':
                toastr.info(msg);
                break;
        }
    }
}
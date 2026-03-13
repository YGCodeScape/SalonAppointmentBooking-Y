// alerts.js

// SUCCESS ALERT
function showSuccess(message, title = "Success") {
    return Swal.fire({
        icon: "success",
        title: title,
        text: message,
        confirmButtonColor: "#3085d6"
    });
}

// ERROR ALERT
function showError(message, title = "Error") {
    return Swal.fire({
        icon: "error",
        title: title,
        text: message,
        confirmButtonColor: "#d33"
    });
}

// WARNING ALERT
function showWarning(message, title = "Warning") {
    return Swal.fire({
        icon: "warning",
        title: title,
        text: message,
        confirmButtonColor: "#f39c12"
    });
}

// CONFIRMATION DIALOG
function confirmAction(title, text, confirmText = "Yes", cancelText = "Cancel") {
    return Swal.fire({
        title: title,
        text: text,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#6c757d",
        confirmButtonText: confirmText,
        cancelButtonText: cancelText
    });
}

// LOADING ALERT
function showLoading(title = "Please wait...") {
    Swal.fire({
        title: title,
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });
}
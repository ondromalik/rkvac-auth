{
    function checkKeys() {
        fetch('/check-data', {
            method: 'GET'
        }).then(function(response) {
            if(response.ok) {
                console.log('RKVAC is ready');
                document.getElementById('initiatingRKVAC').hidden = true;
                return;
            }
            if(response.status === 404) {
                console.log('RKVAC is not ready');
                return;
            }
            throw new Error('Request failed.');
        }).catch(function(error) {
            console.log(error);
        });
        fetch('/check-ie-key', {
            method: 'GET'
        }).then(function(response) {
            if(response.ok) {
                console.log('File exists');
                document.getElementById('upload-IE-SK').hidden = true;
                document.getElementById('delete-IE-SK').hidden = false;
                return;
            }
            if(response.status === 404) {
                document.getElementById('delete-IE-SK').hidden = true;
                document.getElementById('upload-IE-SK').hidden = false;
                console.log('File not found');
                return;
            }
            throw new Error('Request failed.');
        }).catch(function(error) {
            console.log(error);
        });
        fetch('/check-ra-key', {
            method: 'GET'
        }).then(function(response) {
            if(response.ok) {
                console.log('File exists');
                document.getElementById('upload-RA-PK').hidden = true;
                document.getElementById('delete-RA-PK').hidden = false;
                return;
            }
            if(response.status === 404) {
                document.getElementById('delete-RA-PK').hidden = true;
                document.getElementById('upload-RA-PK').hidden = false;
                console.log('File not found');
                return;
            }
            throw new Error('Request failed.');
        }).catch(function(error) {
            console.log(error);
        });
        fetch('/check-ra-params', {
            method: 'GET'
        }).then(function(response) {
            if(response.ok) {
                console.log('File exists');
                document.getElementById('upload-RA-PARAM').hidden = true;
                document.getElementById('delete-RA-PARAM').hidden = false;
                return;
            }
            if(response.status === 404) {
                document.getElementById('delete-RA-PARAM').hidden = true;
                document.getElementById('upload-RA-PARAM').hidden = false;
                console.log('File not found');
                return;
            }
            throw new Error('Request failed.');
        }).catch(function(error) {
            console.log(error);
        });
        fetch('/check-admin-attribute', {
            method: 'GET'
        }).then(function(response) {
            if(response.ok) {
                console.log('File exists');
                document.getElementById('adminReady').hidden = false;
                document.getElementById('adminNotReady').hidden = true;
                document.getElementById('deleteAdminButton').disabled = false;
                document.getElementById('adminButton').disabled = true;
                return;
            }
            if(response.status === 404) {
                console.log('File not found');
                return;
            }
            throw new Error('Request failed.');
        }).catch(function(error) {
            console.log(error);
        });
        fetch('/check-teacher-attribute', {
            method: 'GET'
        }).then(function(response) {
            if(response.ok) {
                console.log('File exists');
                document.getElementById('teacherReady').hidden = false;
                document.getElementById('teacherNotReady').hidden = true;
                document.getElementById('deleteTeacherButton').disabled = false;
                document.getElementById('teacherButton').disabled = true;
                return;
            }
            if(response.status === 404) {
                console.log('File not found');
                return;
            }
            throw new Error('Request failed.');
        }).catch(function(error) {
            console.log(error);
        });
        fetch('/check-student-attribute', {
            method: 'GET'
        }).then(function(response) {
            if(response.ok) {
                console.log('File exists');
                document.getElementById('studentReady').hidden = false;
                document.getElementById('studentNotReady').hidden = true;
                document.getElementById('deleteStudentButton').disabled = false;
                document.getElementById('studentButton').disabled = true;
                return;
            }
            if(response.status === 404) {
                console.log('File not found');
                return;
            }
            throw new Error('Request failed.');
        }).catch(function(error) {
            console.log(error);
        });
    }

    // window.onbeforeunload = checkRA();
    window.onload = checkKeys;

    function changeAttributeType(buttonType) {
        console.log('clicked');
        document.getElementById("userrole").value = buttonType;
        document.getElementById('adminButton').className = document.getElementById('adminButton').className.replace('w3-gray', "");
        document.getElementById('teacherButton').className = document.getElementById('teacherButton').className.replace('w3-gray', '');
        document.getElementById('studentButton').className = document.getElementById('studentButton').className.replace('w3-gray', '');
        document.getElementById(buttonType + 'Button').className += ' w3-gray';
        document.getElementById('newAttributeButton').disabled = false;
    }

    document.getElementById('newAttributeButton').addEventListener('click', () => {
        connect();
    })

    document.getElementById('scheduleEpochButton').addEventListener('click', () => {
        let RAAddress = document.getElementById('RAAddress').value;
        let cronTimer = document.getElementById('cronTimer').value;
        let message = document.getElementById('scheduleMessage');
        let scheduleInfo = {
            address: RAAddress,
            timer: cronTimer
        };
        if (RAAddress !== "" && cronTimer !== "") {
            fetch('/scheduleNewEpoch', {
                method: 'POST',
                body: JSON.stringify(scheduleInfo),
                headers: { 'Content-Type': 'application/json'}
            }).then((response) => {
                if(response.ok) {
                    message.innerHTML = "Přechod na novou epochu naplánován";
                    message.hidden = false;
                    message.className = "w3-text-green";
                    return;
                }
                if(response.status === 501) {
                    message.innerHTML = "Časovač nemá správny formát";
                    message.hidden = false;
                    message.className = "w3-text-red";
                    return;
                }
                throw new Error('Request failed.');
            }).catch((error) => {
                console.log(error);
            });
        }
        else if (RAAddress === "" && cronTimer !== "") {
            message.innerHTML = "Časovač nezadán";
            message.hidden = false;
            message.className = "w3-text-red";
        }
        else if (RAAddress !== "" && cronTimer === "") {
            message.innerHTML = "Adresa revokační autority nezadána";
            message.hidden = false;
            message.className = "w3-text-red";
        }
        else {
            message.innerHTML = "Adresa revokační autority a časovač nejsou zadány";
            message.hidden = false;
            message.className = "w3-text-red";
        }
    })

    document.getElementById('destroyEpochButton').addEventListener('click', () => {
        let message = document.getElementById('scheduleMessage');
        fetch('/destroyEpoch', {
            method: 'POST'
        }).then((response) => {
            if(response.ok) {
                message.innerHTML = "Pravidelný přechod na novou epochu zrušen";
                message.hidden = false;
                message.className += " w3-text-red";
                return;
            }
            if (response.status === 501) {
                message.innerHTML = "Pravidelný přechod nebyl nastaven";
                message.hidden = false;
                message.className += " w3-text-red";
                return;
            }
            throw new Error('Request failed.');
        }).catch((error) => {
            console.log(error);
        });
    })
}

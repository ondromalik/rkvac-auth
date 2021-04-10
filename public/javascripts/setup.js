{
    /* Check functions */

    function checkAll() {
        fetch('/check-data', {
            method: 'GET'
        }).then((response) => {
            response.json().then((data) => {
                if (data.rkvac) {
                    activateApp();
                    return;
                }
                throw new Error('Request failed');
            }).catch((error) => {
                console.log(error);
            });
        });
        fetch('/check-keys', {
            method: 'GET'
        }).then((response) => {
            response.json().then((data) => {
                if (data.ieKey) {
                    document.getElementById('upload-IE-SK').hidden = true;
                    document.getElementById('delete-IE-SK').hidden = false;
                } else if (!data.ieKey) {
                    document.getElementById('upload-IE-SK').hidden = false;
                    document.getElementById('delete-IE-SK').hidden = true;
                } else {
                    throw new Error('Request failed');
                }
                if (data.raKey) {
                    document.getElementById('upload-RA-PK').hidden = true;
                    document.getElementById('delete-RA-PK').hidden = false;
                } else if (!data.raKey) {
                    document.getElementById('upload-RA-PK').hidden = false;
                    document.getElementById('delete-RA-PK').hidden = true;
                }
                if (data.raParams) {
                    document.getElementById('upload-RA-PARAM').hidden = true;
                    document.getElementById('delete-RA-PARAM').hidden = false;
                } else if (!data.raParams) {
                    document.getElementById('upload-RA-PARAM').hidden = false;
                    document.getElementById('delete-RA-PARAM').hidden = true;
                }
            }).catch((error) => {
                console.log(error);
            });
        });
        fetch('/check-attribute-files', {
            method: 'GET'
        }).then((response) => {
            response.json().then((data) => {
                if (data.adminReady) {
                    document.getElementById('adminReady').hidden = false;
                    document.getElementById('adminNotReady').hidden = true;
                    document.getElementById('deleteAdminButton').disabled = false;
                    document.getElementById('adminButton').disabled = true;
                    document.getElementById('adminButton').className = document.getElementById('adminButton').className.replace("w3-gray", "");
                } else if (!data.adminReady) {
                    document.getElementById('adminReady').hidden = true;
                    document.getElementById('adminNotReady').hidden = false;
                    document.getElementById('deleteAdminButton').disabled = true;
                    document.getElementById('adminButton').disabled = false;
                } else {
                    throw new Error('Request failed');
                }
                if (data.teacherReady) {
                    document.getElementById('teacherReady').hidden = false;
                    document.getElementById('teacherNotReady').hidden = true;
                    document.getElementById('deleteTeacherButton').disabled = false;
                    document.getElementById('teacherButton').disabled = true;
                    document.getElementById('teacherButton').className = document.getElementById('teacherButton').className.replace("w3-gray", "");
                } else if (!data.teacherReady) {
                    document.getElementById('teacherReady').hidden = true;
                    document.getElementById('teacherNotReady').hidden = false;
                    document.getElementById('deleteTeacherButton').disabled = true;
                    document.getElementById('teacherButton').disabled = false;
                }
                if (data.studentReady) {
                    document.getElementById('studentReady').hidden = false;
                    document.getElementById('studentNotReady').hidden = true;
                    document.getElementById('deleteStudentButton').disabled = false;
                    document.getElementById('studentButton').disabled = true;
                    document.getElementById('studentButton').className = document.getElementById('studentButton').className.replace("w3-gray", "");
                } else if (!data.studentReady) {
                    document.getElementById('studentReady').hidden = true;
                    document.getElementById('studentNotReady').hidden = false;
                    document.getElementById('deleteStudentButton').disabled = true;
                    document.getElementById('studentButton').disabled = false;
                }
            }).catch((error) => {
                console.log(error);
            });
        });
    }

    window.onload = checkAll;

    /* Button`s listeners */

    document.getElementById('deleteAdminButton').addEventListener('click', () => {
        deleteAttribute("admin");
    })

    document.getElementById('deleteTeacherButton').addEventListener('click', () => {
        deleteAttribute("teacher");
    })

    document.getElementById('deleteStudentButton').addEventListener('click', () => {
        deleteAttribute("student");
    })

    document.getElementById('adminButton').addEventListener('click', () => {
        changeAttributeType('admin');
    })
    document.getElementById('teacherButton').addEventListener('click', () => {
        changeAttributeType('teacher');
    })
    document.getElementById('studentButton').addEventListener('click', () => {
        changeAttributeType('student');
    })

    /* Changing attributes form */
    const attributeCount = document.getElementById('attributeCount');
    const ownAttributes = document.getElementById('ownAttributes');
    attributeCount.addEventListener('change', function () {
        let selectedValue = attributeCount.value;

        while (ownAttributes.firstChild) {
            ownAttributes.removeChild(ownAttributes.firstChild);
        }

        for (let i = 0; i < selectedValue; i++) {
            let label = document.createElement("label");
            label.innerHTML = "Název #" + (i + 1);
            // label.setAttribute("class", "labels");

            let input = document.createElement("input");
            input.setAttribute("class", "w3-input w3-border w3-round-medium w3-margin-bottom");
            let newID = toString(i);
            input.id = "own" + i;

            ownAttributes.appendChild(label);
            ownAttributes.appendChild(input);
        }
    });

    document.getElementById('newAttributeButton').addEventListener('click', () => {
        let userrole = document.getElementById("userrole").value;
        let attributeCount = document.getElementById('attributeCount').value;
        let disclosedAttributes = document.getElementById('disclosedAttributes').value;
        let newAttribute = {
            userrole: userrole,
            attributeCount: attributeCount,
            disclosedAttributes: disclosedAttributes
        };
        for (let i = 0; i < attributeCount; i++) {
            let id = 'own' + i;
            let attribName = 'own' + i;
            newAttribute[attribName] = document.getElementById(id).value;
            document.getElementById(id).value = "";
        }
        fetch('/createAttribute', {
            method: 'POST',
            body: JSON.stringify(newAttribute),
            headers: {'Content-Type': 'application/json'}
        }).then((response) => {
            response.json().then((data) => {
                if (data.success) {
                    document.getElementById('newAttributeMessageOK').hidden = false;
                    checkAll();
                    return;
                }
                if (!data.success) {
                    document.getElementById('newAttributeMessageError').hidden = false;
                    return;
                }
                throw new Error('Request failed.');
            }).catch((error) => {
                console.log(error);
            });
        });
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
                headers: {'Content-Type': 'application/json'}
            }).then((response) => {
                if (response.ok) {
                    message.innerHTML = "Přechod na novou epochu naplánován";
                    message.hidden = false;
                    message.className = "w3-text-green";
                    return;
                }
                if (response.status === 501) {
                    message.innerHTML = "Časovač nemá správny formát";
                    message.hidden = false;
                    message.className = "w3-text-red";
                    return;
                }
                throw new Error('Request failed.');
            }).catch((error) => {
                console.log(error);
            });
        } else if (RAAddress === "" && cronTimer !== "") {
            message.innerHTML = "Časovač nezadán";
            message.hidden = false;
            message.className = "w3-text-red";
        } else if (RAAddress !== "" && cronTimer === "") {
            message.innerHTML = "Adresa revokační autority nezadána";
            message.hidden = false;
            message.className = "w3-text-red";
        } else {
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
            if (response.ok) {
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

    /* Functions */

    function activateApp() {
        document.getElementById('initiatingRKVAC').hidden = true;
        document.getElementById("keyPanel").className = document.getElementById("keyPanel").className.replace("w3-light-grey", "w3-light-blue");
        document.getElementById("attributePanel").className = document.getElementById("attributePanel").className.replace("w3-light-grey", "w3-light-blue");
        document.getElementById("newAttributePanel").className = document.getElementById("newAttributePanel").className.replace("w3-light-grey", "w3-cyan");
        document.getElementById("epochPanel").className = document.getElementById("epochPanel").className.replace("w3-light-grey", "w3-light-blue");
    }

    function changeAttributeType(buttonType) {
        document.getElementById("userrole").value = buttonType;
        document.getElementById('adminButton').className = document.getElementById('adminButton').className.replace('w3-gray', "");
        document.getElementById('teacherButton').className = document.getElementById('teacherButton').className.replace('w3-gray', '');
        document.getElementById('studentButton').className = document.getElementById('studentButton').className.replace('w3-gray', '');
        document.getElementById(buttonType + 'Button').className += ' w3-gray';
        document.getElementById('newAttributeButton').disabled = false;
    }

    function deleteAttribute(userrole) {
        hideMessages();
        let file = {
            filename: ""
        }
        switch (userrole) {
            case "admin":
                file.filename = "DBAdmin.att"
                break;
            case "teacher":
                file.filename = "DBTeacher.att"
                break;
            case "student":
                file.filename = "DBStudent.att"
                break;
        }
        fetch("/deleteAttribute", {
            method: 'POST',
            body: JSON.stringify(file),
            headers: {'Content-Type': 'application/json'}
        }).then((response) => {
            response.json().then((data) => {
                if (data.success) {
                    checkAll();
                    return;
                }
                throw new Error('Request failed.');
            }).catch((error) => {
                console.log(error);
            });
        });
    }

    function hideMessages () {
        let messages = document.getElementsByClassName("message");
        for (let i = 0; i < messages.length; i++) {
            messages[i].hidden = true;
        }
    }
}

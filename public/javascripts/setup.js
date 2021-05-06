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
                    document.getElementById('adminDetail').hidden = false;
                } else if (!data.adminReady) {
                    document.getElementById('adminReady').hidden = true;
                    document.getElementById('adminNotReady').hidden = false;
                    document.getElementById('deleteAdminButton').disabled = true;
                    document.getElementById('adminButton').disabled = false;
                    document.getElementById('adminDetail').hidden = true;
                } else {
                    throw new Error('Request failed');
                }
                if (data.teacherReady) {
                    document.getElementById('teacherReady').hidden = false;
                    document.getElementById('teacherNotReady').hidden = true;
                    document.getElementById('deleteTeacherButton').disabled = false;
                    document.getElementById('teacherButton').disabled = true;
                    document.getElementById('teacherButton').className = document.getElementById('teacherButton').className.replace("w3-gray", "");
                    document.getElementById('teacherDetail').hidden = false;
                } else if (!data.teacherReady) {
                    document.getElementById('teacherReady').hidden = true;
                    document.getElementById('teacherNotReady').hidden = false;
                    document.getElementById('deleteTeacherButton').disabled = true;
                    document.getElementById('teacherButton').disabled = false;
                    document.getElementById('teacherDetail').hidden = true;
                }
                if (data.studentReady) {
                    document.getElementById('studentReady').hidden = false;
                    document.getElementById('studentNotReady').hidden = true;
                    document.getElementById('deleteStudentButton').disabled = false;
                    document.getElementById('studentButton').disabled = true;
                    document.getElementById('studentButton').className = document.getElementById('studentButton').className.replace("w3-gray", "");
                    document.getElementById('studentDetail').hidden = false;
                } else if (!data.studentReady) {
                    document.getElementById('studentReady').hidden = true;
                    document.getElementById('studentNotReady').hidden = false;
                    document.getElementById('deleteStudentButton').disabled = true;
                    document.getElementById('studentButton').disabled = false;
                    document.getElementById('studentDetail').hidden = true;
                }
            }).catch((error) => {
                console.log(error);
            });
        });
        fetch('/check-epoch', {
            method: 'GET'
        }).then((response) => {
            response.json().then((data) => {
                if (data.RAAddress !== "") {
                    document.getElementById('RAAddress').hidden = true;
                    document.getElementById('RAAddressLabel').hidden = false;
                    document.getElementById('RAAddressLabel').innerHTML = data.RAAddress;
                    document.getElementById('RAAddressMessageOK').hidden = false;
                    document.getElementById('RAAddressMessageError').hidden = true;
                    document.getElementById('saveRAAddress').disabled = true;
                    document.getElementById('deleteRAAddress').disabled = false;
                    document.getElementById('newEpochButton').disabled = false;
                }
                if (data.RAAddress === "") {
                    document.getElementById('RAAddress').hidden = false;
                    document.getElementById('RAAddressLabel').hidden = true;
                    document.getElementById('RAAddressLabel').innerHTML = "";
                    document.getElementById('RAAddressMessageOK').hidden = true;
                    document.getElementById('RAAddressMessageError').hidden = false;
                    document.getElementById('saveRAAddress').disabled = false;
                    document.getElementById('deleteRAAddress').disabled = true;
                    document.getElementById('newEpochButton').disabled = true;
                }
                if (data.epochNumber !== "") {
                    document.getElementById('currentEpochLabel').hidden = false;
                    document.getElementById('currentEpochLabel').innerHTML = data.epochNumber;
                    document.getElementById('currentEpochError').hidden = true;
                }
                if (data.epochNumber === "") {
                    document.getElementById('currentEpochLabel').hidden = true;
                    document.getElementById('currentEpochError').hidden = false;
                }
                if (data.currentCron !== "") {
                    document.getElementById('cronTimer').hidden = true;
                    document.getElementById('epochLabel').hidden = false;
                    document.getElementById('epochScheduleLabel').hidden = false;
                    document.getElementById('epochScheduleLabel').innerHTML = data.currentCron;
                    document.getElementById('scheduleMessageError').hidden = true;
                    document.getElementById('scheduleEpochButton').disabled = true;
                    document.getElementById('destroyEpochButton').disabled = false;
                    document.getElementById('scheduleEpochError').hidden = true;
                }
                if (data.currentCron === "") {
                    document.getElementById('cronTimer').hidden = false;
                    document.getElementById('epochLabel').hidden = true;
                    document.getElementById('epochScheduleLabel').hidden = true;
                    document.getElementById('epochScheduleLabel').innerHTML = "";
                    document.getElementById('scheduleMessageError').hidden = false;
                    document.getElementById('scheduleEpochButton').disabled = false;
                    document.getElementById('destroyEpochButton').disabled = true;
                }
            }).catch((error) => {
                console.log(error);
            });
        });
    }

    window.onload = checkAll;

    /* Button`s listeners */

    document.getElementById('deleteIEButton').addEventListener('click', () => {
        deleteKey('ie_sk.dat');
    })

    document.getElementById('deleteRAButton').addEventListener('click', () => {
        deleteKey('ra_pk.dat');
    })

    document.getElementById('deleteParamsButton').addEventListener('click', () => {
        deleteKey('ra_public_parameters.dat');
    })

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

    document.getElementById('saveRAAddress').addEventListener('click', () => {
        let RAAddress = document.getElementById('RAAddress').value;
        if (RAAddress === "") {
            RAAddress = "127.0.0.1"
        }
        let RA = {
            RAAddress: RAAddress
        }
        fetch('/saveRAAddress', {
            method: 'POST',
            body: JSON.stringify(RA),
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
    })

    document.getElementById('deleteRAAddress').addEventListener('click', () => {
        fetch('/deleteRAAddress', {
            method: 'GET'
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
    })

    document.getElementById('newEpochButton').addEventListener('click', () => {
        fetch('/createNewEpoch', {
            method: 'GET'
        }).then((response) => {
            response.json().then((data) => {
                if (data.success) {
                    checkAll();
                    return;
                }
                if (!data.success) {
                    document.getElementById('newEpochError').hidden = false;
                    return;
                }
                throw new Error('Request failed.');
            }).catch((error) => {
                console.log(error);
            });
        });
    })

    document.getElementById('scheduleEpochButton').addEventListener('click', () => {
        let cronTimer = document.getElementById('cronTimer').value;
        let scheduleInfo = {
            timer: cronTimer
        };
        fetch('/scheduleNewEpoch', {
            method: 'POST',
            body: JSON.stringify(scheduleInfo),
            headers: {'Content-Type': 'application/json'}
        }).then((response) => {
            response.json().then((data) => {
                if (data.success) {
                    checkAll();
                    return;
                }
                if (!data.success) {
                    document.getElementById('scheduleEpochError').hidden = false;
                    return;
                }
                throw new Error('Request failed.');
            }).catch((error) => {
                console.log(error);
            });
        });
    })

    document.getElementById('destroyEpochButton').addEventListener('click', () => {
        let message = document.getElementById('scheduleMessage');
        fetch('/destroyEpoch', {
            method: 'POST'
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
    })

    document.getElementById('resetRKVAC').addEventListener('click', () => {
        var really = confirm("You are about to delete all RKVAC configuration\nDo you want to continue?");
        if (really) {
            fetch("/deleteData", {
                method: 'POST'
            }).then((response) => {
                response.json().then((data) => {
                    if (data.success) {
                        location.reload();
                        return;
                    }
                    document.getElementById('resetMessage').hidden = false;
                    throw new Error('Request failed.');
                }).catch((error) => {
                    console.log(error);
                });
            });
        }
    });

    document.getElementById('adminDetail').addEventListener('click', () => {
        showAttributeInfo('DBAdmin.att', 'adminPosition.dat');
    });

    document.getElementById('teacherDetail').addEventListener('click', () => {
        showAttributeInfo('DBTeacher.att', 'teacherPosition.dat');
    });

    document.getElementById('studentDetail').addEventListener('click', () => {
        showAttributeInfo('DBStudent.att', 'studentPosition.dat');
    });

    /* Functions */

    function activateApp() {
        document.getElementById('initiatingRKVAC').hidden = true;
        document.getElementById("keyPanel").className = document.getElementById("keyPanel").className.replace("w3-light-grey", "w3-light-blue");
        document.getElementById("attributePanel").className = document.getElementById("attributePanel").className.replace("w3-light-grey", "w3-light-blue");
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

    function deleteKey(keyName) {
        let file = {
            filename: keyName
        }
        fetch("/deleteKey", {
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

    function showAttributeInfo(attributeName, disclosedName) {
        let attribName = {
            attributeName: attributeName,
            disclosedName: disclosedName
        }
        fetch('/show-attribute', {
            method: 'POST',
            body: JSON.stringify(attribName),
            headers: {'Content-Type': 'application/json'}
        }).then(function (response) {
            response.json().then((data) => {
                if (data.success) {
                    let list = document.getElementById('attributeList');
                    while (list.firstChild) {
                        list.removeChild(list.firstChild);
                    }
                    let header = list.createTHead();
                    let row = header.insertRow(0);
                    let th1 = document.createElement('th');
                    let th2 = document.createElement('th');
                    th1.innerHTML = "Název";
                    th2.innerHTML = "Hodnota";
                    row.appendChild(th1);
                    row.appendChild(th2);
                    for (let i = 0; i < data.names.length; i++) {
                        let row = list.insertRow(i+1);
                        let cell1 = row.insertCell(0);
                        let cell2 = row.insertCell(1);
                        cell1.innerHTML = data.names[i] + ":";
                        cell2.innerHTML = data.attributes[i];
                    }
                    let card = document.getElementById('disclosedContainer');
                    while (card.firstChild) {
                        card.removeChild(card.firstChild);
                    }
                    let label = document.createElement('label');
                    label.innerHTML = "Odhaleny atribúty: " + data.disclosedAttributes;
                    card.appendChild(label);
                    document.getElementById('attributeInfo').style.display = 'block';
                    return;
                }
                if (!data.success) {
                    return;
                }
                throw new Error('Request failed.');
            }).catch(function (error) {
                console.log(error);
            });
        })
    }

    function hideMessages() {
        let messages = document.getElementsByClassName("message");
        for (let i = 0; i < messages.length; i++) {
            messages[i].hidden = true;
        }
    }

    window.onclick = function (event) {
        let modal = document.getElementById('attributeInfo');
        if (event.target === modal) {
            modal.style.display = "none";
        }
    }
}

{
    document.getElementById('adminButton').addEventListener('click', () => {
        startLoader();
        let tableRows = document.getElementsByClassName('cardSelector');
        let selectedCard = "";
        for (let i = 0; i < tableRows.length; i++) {
            if (tableRows[i].checked) {
                selectedCard = tableRows[i];
            }
        }
        connect(selectedCard.value);
    })

    // document.getElementById('teacherButton').addEventListener('click', () => {
    //     startLoader();
    //     let tableRows = document.getElementsByClassName('cardSelector');
    //     let selectedCard = "";
    //     for (let i = 0; i < tableRows.length; i++) {
    //         if (tableRows[i].checked) {
    //             selectedCard = tableRows[i];
    //         }
    //     }
    //     connect(selectedCard.value);
    // })
    //
    // document.getElementById('studentButton').addEventListener('click', () => {
    //     startLoader();
    //     let tableRows = document.getElementsByClassName('cardSelector');
    //     let selectedCard = "";
    //     for (let i = 0; i < tableRows.length; i++) {
    //         if (tableRows[i].checked) {
    //             selectedCard = tableRows[i];
    //         }
    //     }
    //     connect(selectedCard.value);
    // })

    function startLoader() {
        document.getElementById('login-loader').hidden = false;
    }

    function showPanel(id) {
        var panel = document.getElementById(id);
        if (panel.className.indexOf("w3-show") === -1) {
            panel.className += " w3-show";
        } else {
            panel.className = panel.className.replace(" w3-show", "");
        }
    }

    async function contactCard(index, hexdata) {
        var _readers = await navigator.webcard.readers();
        let atr = await _readers[index].connect(true);
        console.log("APDU request: " + hexdata);
        let res = await _readers[index].transcieve(hexdata);
        _readers[index].disconnect();
        return res;
    }

    async function ListReaders() {
        var reader_ul = document.getElementById('readerList');
        if (reader_ul.firstChild) {
            reader_ul.removeChild(reader_ul.firstChild);
        }
        var _readers = await navigator.webcard.readers();
        if (_readers[0]) {
            _readers.forEach((reader, index) => {
                var node = document.createElement('li');
                reader_ul.append(node)
                node.outerHTML = `
          <div class="" tabindex="${index}" onclick="testReader(${index})">
                <input type="radio" class="w3-radio w3-bar-item cardSelector" name="cardIndex" value="${index}" onclick="enableLogin()">
                    <label style="font-weight: bold">${reader.name}</label>
                    <label style="font-style: italic">(${reader.atr === "" ? "Karta nevložená" : "Karta vložená"})</label>
                </input>
                </div>
          `;

            })
            document.getElementById('cardStatus').hidden = true;
        }
        else {
            document.getElementById('reloadMessage').hidden = false;
        }
    }

    function enableLogin() {
        document.getElementById('adminButton').disabled = false;
        document.getElementById('teacherButton').disabled = false;
        document.getElementById('studentButton').disabled = false;
    }

    function testReader(index) {
        startCardLoader();
        contactCard(index, '00A40400077675743231303100').then(res => {
            hideCardLoader();
            if (res === '9000') {
                document.getElementById("cardConnected").hidden = false;
                document.getElementById("cardDisconnected").hidden = true;
            }
            console.log("APDU response: " + res);
        }).catch(function (error) {
            hideCardLoader();
            document.getElementById("cardDisconnected").hidden = false;
            document.getElementById("cardConnected").hidden = true;
            console.log(error);
        });
    }

    function startCardLoader() {
        document.getElementById('card-loader').hidden = false;
    }

    function hideCardLoader() {
        document.getElementById('card-loader').hidden = true;
    }

    window.onload = ListReaders;
}
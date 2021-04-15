{
    async function refreshTable(root) {
        // console.log("Table refreshed!");

        const table = root.querySelector(".table-logTable");
        const response = await fetch(root.dataset.url).catch(function(error) {
            console.log(error);
        });
        const logData = await response.json();
        let date = new Date();
        let dateFormat = date.getHours() + ":" + (date.getMinutes()<10?'0':'') + date.getMinutes() + ":" + (date.getSeconds()<10?'0':'') + date.getSeconds();
        document.getElementById('updatedDate').innerHTML = "Aktualizováno: " + dateFormat;
        if (logData.success === false) {
            return;
        }

        //Clear table
        table.querySelector("thead tr").innerHTML = "";
        table.querySelector("tbody").innerHTML = "";

        //Populate headers
        for (const header of logData.headers) {
            table.querySelector("thead tr").insertAdjacentHTML("beforeend", `<th>${ header }</th>`);
        }

        //Populate rows

        for (let i = logData.rows.length - 1; i >= 0; i--) {
            table.querySelector("tbody").insertAdjacentHTML("beforeend", `
                <tr>
                    ${ logData.rows[i].map(col => `<td>${ col }</td>`).join("") }               
                </tr>
            `);
        }
    }

    for (const root of document.querySelectorAll(".logTable[data-url]")) {
        const btnRefreshLog = document.getElementById('btnRefreshLog');
        const table = document.createElement("table");
        table.classList.add("w3-table-all");
        table.classList.add("w3-gray");
        table.classList.add("table-logTable");

        table.innerHTML = `
            <thead>
                <tr class="w3-light-gray"></tr>
            </thead>
            <tbody>
                <tr>
                    <td>Seznam je prázdny</td>
                </tr>
            </tbody>
        `;

        root.append(table);

        btnRefreshLog.addEventListener('click', function (e) {
            btnRefreshLog.className += " table-refresh__button--refreshing";
            refreshTable(root).then(() => {
                btnRefreshLog.className = btnRefreshLog.className.replace(" table-refresh__button--refreshing", "");
            }).catch((error) => {
                console.log(error);
                btnRefreshLog.className = btnRefreshLog.className.replace(" table-refresh__button--refreshing", "");
            });
        });

        refreshTable(root);
    }
}